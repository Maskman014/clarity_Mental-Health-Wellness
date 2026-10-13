import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type MoodType = 'flourishing' | 'grounded' | 'overwhelmed' | 'exhausted' | 'restless';

export interface DiagnosticEntry {
  id: string;
  timestamp: number;
  mood: MoodType;
  journal: string;
  stressLevel: number;
}

export interface WeeklyAggregate {
  weekStart: number;
  weekEnd: number;
  avgStress: number;
  moodDistribution: Record<MoodType, number>;
  entriesCount: number;
}

export interface WellnessProof {
  verified: boolean;
  proofHash: string;
  proofType: 'streak' | 'low_stress';
  streakLength?: number;
  avgStress?: number;
}

interface WellnessContextValue {
  diagnostics: DiagnosticEntry[];
  weeklyAggregates: WeeklyAggregate[];
  loadingDiagnostics: boolean;
  addDiagnostic: (entry: Omit<DiagnosticEntry, 'id' | 'timestamp'>) => Promise<void>;
  getRecentDiagnostics: (count: number) => DiagnosticEntry[];
  getDiagnosticsByDateRange: (start: number, end: number) => DiagnosticEntry[];
  calculateWeeklyAggregate: (weekStart: number) => WeeklyAggregate | null;
  clearHistory: () => Promise<void>;
  generateWellnessProof: (days?: number) => Promise<WellnessProof>;
  generateLowStressProof: (days?: number) => Promise<WellnessProof>;
  verifyWellnessProof: (hash: string) => Promise<{ found: boolean; proofType?: string; streakLength?: number; avgStress?: number }>;
}

const WellnessContext = createContext<WellnessContextValue | undefined>(undefined);

export const MOOD_LABELS: Record<MoodType, string> = {
  flourishing: 'Flourishing',
  grounded: 'Grounded',
  overwhelmed: 'Overwhelmed',
  exhausted: 'Exhausted',
  restless: 'Restless',
};

function rowToEntry(row: { id: string; mood: string; journal: string; stress_level: number; created_at: string }): DiagnosticEntry {
  return {
    id: row.id,
    timestamp: new Date(row.created_at).getTime(),
    mood: row.mood as MoodType,
    journal: row.journal,
    stressLevel: row.stress_level,
  };
}

export function WellnessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);

  useEffect(() => {
    if (!user) {
      setDiagnostics([]);
      return;
    }

    setLoadingDiagnostics(true);

    supabase
      .from('diagnostics')
      .select('id, mood, journal, stress_level, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (!error && data) {
          setDiagnostics(data.map(rowToEntry));
        }
        setLoadingDiagnostics(false);
      });
  }, [user]);

  const addDiagnostic = useCallback(async (entry: Omit<DiagnosticEntry, 'id' | 'timestamp'>) => {
    const { data, error } = await supabase
      .from('diagnostics')
      .insert({ mood: entry.mood, journal: entry.journal, stress_level: entry.stressLevel })
      .select('id, mood, journal, stress_level, created_at')
      .single();

    if (!error && data) {
      setDiagnostics((prev) => [rowToEntry(data), ...prev]);
    }
  }, []);

  const getRecentDiagnostics = useCallback((count: number): DiagnosticEntry[] => {
    return diagnostics.slice(0, count);
  }, [diagnostics]);

  const getDiagnosticsByDateRange = useCallback((start: number, end: number): DiagnosticEntry[] => {
    return diagnostics.filter((d) => d.timestamp >= start && d.timestamp <= end);
  }, [diagnostics]);

  const calculateWeeklyAggregate = useCallback((weekStart: number): WeeklyAggregate | null => {
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    const weekEntries = getDiagnosticsByDateRange(weekStart, weekEnd);

    if (weekEntries.length === 0) return null;

    const avgStress = weekEntries.reduce((sum, e) => sum + e.stressLevel, 0) / weekEntries.length;
    const moodDistribution: Record<MoodType, number> = {
      flourishing: 0, grounded: 0, overwhelmed: 0, exhausted: 0, restless: 0,
    };
    weekEntries.forEach((e) => { moodDistribution[e.mood]++; });

    return { weekStart, weekEnd, avgStress, moodDistribution, entriesCount: weekEntries.length };
  }, [getDiagnosticsByDateRange]);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    const { error } = await supabase
      .from('diagnostics')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setDiagnostics([]);
    }
  }, [user]);

  const generateWellnessProof = useCallback(async (days = 7): Promise<WellnessProof> => {
    const entries = getRecentDiagnostics(days);

    // Determine which calendar days are covered (YYYY-MM-DD keys)
    const today = new Date();
    const coveredDays = new Set(
      entries.map((e) => new Date(e.timestamp).toISOString().split('T')[0])
    );
    let streakLength = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (coveredDays.has(key)) {
        streakLength++;
      } else {
        break; // streak must be consecutive going backwards from today
      }
    }

    const verified = streakLength === days;

    // Hash only IDs + timestamps — no mood, journal, or stress data
    const payload = entries
      .map((e) => `${e.id}:${e.timestamp}`)
      .join('|');
    const encoded = new TextEncoder().encode(payload || 'empty');
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const proofHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Persist proof — INSERT only (ignore if hash already exists)
    await supabase
      .from('wellness_proofs')
      .insert({ proof_hash: proofHash, streak_length: streakLength, proof_type: 'streak' })
      .select()
      .maybeSingle(); // silently swallows unique-constraint duplicate

    return { verified, proofHash, proofType: 'streak', streakLength };
  }, [getRecentDiagnostics]);

  const generateLowStressProof = useCallback(async (days = 7): Promise<WellnessProof> => {
    const entries = getRecentDiagnostics(days);
    
    const avgStress = entries.length ? entries.reduce((s, e) => s + e.stressLevel, 0) / entries.length : 0;
    const verified = entries.length > 0 && avgStress < 4;

    const payload = entries.map((e) => `${e.id}:${e.timestamp}`).join('|');
    const encoded = new TextEncoder().encode(payload || 'empty');
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const proofHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    await supabase
      .from('wellness_proofs')
      .insert({ proof_hash: proofHash, proof_type: 'low_stress', avg_stress: avgStress, streak_length: entries.length })
      .select()
      .maybeSingle();

    return { verified, proofHash, proofType: 'low_stress', avgStress };
  }, [getRecentDiagnostics]);

  const verifyWellnessProof = useCallback(async (hash: string): Promise<{ found: boolean; proofType?: string; streakLength?: number; avgStress?: number }> => {
    const { data } = await supabase
      .from('wellness_proofs')
      .select('streak_length, proof_type, avg_stress')
      .eq('proof_hash', hash.trim())
      .maybeSingle();
    if (data) return { found: true, proofType: data.proof_type, streakLength: data.streak_length, avgStress: data.avg_stress };
    return { found: false };
  }, []);

  const value: WellnessContextValue = {
    diagnostics,
    weeklyAggregates: [],
    loadingDiagnostics,
    addDiagnostic,
    getRecentDiagnostics,
    getDiagnosticsByDateRange,
    calculateWeeklyAggregate,
    clearHistory,
    generateWellnessProof,
    generateLowStressProof,
    verifyWellnessProof,
  };

  return (
    <WellnessContext.Provider value={value}>
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellness(): WellnessContextValue {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
}

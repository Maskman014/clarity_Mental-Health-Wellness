import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
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

interface WellnessContextValue {
  diagnostics: DiagnosticEntry[];
  weeklyAggregates: WeeklyAggregate[];
  loadingDiagnostics: boolean;
  addDiagnostic: (entry: Omit<DiagnosticEntry, 'id' | 'timestamp'>) => Promise<void>;
  getRecentDiagnostics: (count: number) => DiagnosticEntry[];
  getDiagnosticsByDateRange: (start: number, end: number) => DiagnosticEntry[];
  calculateWeeklyAggregate: (weekStart: number) => WeeklyAggregate | null;
  clearHistory: () => Promise<void>;
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

  const value: WellnessContextValue = {
    diagnostics,
    weeklyAggregates: [],
    loadingDiagnostics,
    addDiagnostic,
    getRecentDiagnostics,
    getDiagnosticsByDateRange,
    calculateWeeklyAggregate,
    clearHistory,
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

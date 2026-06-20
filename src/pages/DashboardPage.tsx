import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun, Anchor, CloudLightning, BatteryLow, Zap,
  Activity, FileText, Gauge, Sparkles, ArrowRight,
  CheckCircle2, TrendingUp, TrendingDown, Minus,
  Brain, Lightbulb, BarChart3,
} from 'lucide-react';
import { useWellness, MoodType, DiagnosticEntry } from '../context/WellnessContext';
import { getMoodColor, getStressColor } from '../utils/dataExport';

interface MoodOption {
  id: MoodType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const moodOptions: MoodOption[] = [
  { id: 'flourishing', label: 'Flourishing', icon: Sun, description: 'Thriving and experiencing positive well-being' },
  { id: 'grounded', label: 'Grounded', icon: Anchor, description: 'Balanced, calm, and emotionally stable' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: CloudLightning, description: 'Feeling burdened by challenges and stressors' },
  { id: 'exhausted', label: 'Exhausted', icon: BatteryLow, description: 'Drained physically or emotionally' },
  { id: 'restless', label: 'Restless', icon: Zap, description: 'Unable to relax, feeling agitated' },
];

const MOOD_SCORE: Record<MoodType, number> = {
  flourishing: 5, grounded: 4, restless: 3, overwhelmed: 2, exhausted: 1,
};

const MOOD_INSIGHTS: Record<MoodType, { message: string; tip: string }> = {
  flourishing: {
    message: 'You\'re in an excellent mental space. This is a great time to set goals and practice gratitude.',
    tip: 'Try a 5-minute journaling session to anchor this positive state.',
  },
  grounded: {
    message: 'Your emotional baseline is stable. Groundedness is a strong foundation for resilience.',
    tip: 'Use this calm energy to work through any pending stressors methodically.',
  },
  restless: {
    message: 'Restlessness often signals unexpressed energy or unresolved tension.',
    tip: 'A 10-minute walk or the 4-4-4 breathing exercise can help discharge that energy.',
  },
  overwhelmed: {
    message: 'Overwhelm is a signal — not a character flaw. Breaking tasks into smaller steps can help.',
    tip: 'Visit the Therapy Room for a guided breathing session to reset your nervous system.',
  },
  exhausted: {
    message: 'Your body and mind are calling for rest. Rest is productive — not a weakness.',
    tip: 'Prioritise sleep tonight and minimise non-essential demands on your energy.',
  },
};

interface TrendResult {
  stressTrend: 'improving' | 'stable' | 'worsening';
  stressDiff: number;
  avgPriorStress: number;
  currentStress: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  dominantPriorMood: MoodType | null;
  currentMood: MoodType;
  sessionCount: number;
}

function computeTrend(
  current: { mood: MoodType; stressLevel: number },
  history: DiagnosticEntry[],
): TrendResult {
  const prior = history.slice(0, 7);
  const sessionCount = history.length;

  let avgPriorStress = current.stressLevel;
  let stressDiff = 0;
  if (prior.length > 0) {
    avgPriorStress = prior.reduce((s, e) => s + e.stressLevel, 0) / prior.length;
    stressDiff = current.stressLevel - avgPriorStress;
  }

  const stressTrend: TrendResult['stressTrend'] =
    stressDiff <= -1.0 ? 'improving' : stressDiff >= 1.0 ? 'worsening' : 'stable';

  const moodCounts: Record<MoodType, number> = {
    flourishing: 0, grounded: 0, overwhelmed: 0, exhausted: 0, restless: 0,
  };
  prior.forEach((e) => { moodCounts[e.mood]++; });
  const topPriorMoodEntry = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0];
  const dominantPriorMood = topPriorMoodEntry ? (topPriorMoodEntry[0] as MoodType) : null;

  let moodTrend: TrendResult['moodTrend'] = 'stable';
  if (dominantPriorMood) {
    const scoreDiff = MOOD_SCORE[current.mood] - MOOD_SCORE[dominantPriorMood];
    moodTrend = scoreDiff >= 1 ? 'improving' : scoreDiff <= -1 ? 'declining' : 'stable';
  }

  return {
    stressTrend, stressDiff, avgPriorStress, currentStress: current.stressLevel,
    moodTrend, dominantPriorMood, currentMood: current.mood, sessionCount,
  };
}

function TrendAnalysisPanel({ trend, mood }: { trend: TrendResult; mood: MoodType }) {
  const insight = MOOD_INSIGHTS[mood];

  const StressTrendIcon = trend.stressTrend === 'improving'
    ? TrendingDown
    : trend.stressTrend === 'worsening'
    ? TrendingUp
    : Minus;

  const stressColor =
    trend.stressTrend === 'improving' ? 'text-emerald-400' :
    trend.stressTrend === 'worsening' ? 'text-red-400' :
    'text-slate-400';

  const moodTrendColor =
    trend.moodTrend === 'improving' ? 'text-emerald-400' :
    trend.moodTrend === 'declining' ? 'text-amber-400' :
    'text-slate-400';

  return (
    <div className="lg:col-span-12 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Clarity Trend Analysis</h2>
            <p className="text-sm text-slate-400">Immediate insight based on your {trend.sessionCount} recorded {trend.sessionCount === 1 ? 'session' : 'sessions'}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Entry Saved</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Stress trend */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Stress Trend</p>
            <div className="flex items-end gap-3">
              <div>
                <div className="text-3xl font-bold text-white">{trend.currentStress}<span className="text-lg text-slate-400">/10</span></div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {trend.sessionCount > 1
                    ? `vs ${trend.avgPriorStress.toFixed(1)} avg`
                    : 'First session'}
                </div>
              </div>
              <div className={`flex items-center gap-1 ml-auto ${stressColor}`}>
                <StressTrendIcon className="w-5 h-5" />
                <span className="text-sm font-medium capitalize">{trend.stressTrend}</span>
              </div>
            </div>
            {trend.sessionCount > 1 && (
              <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(trend.currentStress / 10) * 100}%`,
                    backgroundColor: getStressColor(trend.currentStress),
                  }}
                />
              </div>
            )}
          </div>

          {/* Mood trend */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Mood Trend</p>
            <div className="flex items-end justify-between">
              <div>
                <div
                  className="text-xl font-bold capitalize"
                  style={{ color: getMoodColor(trend.currentMood) }}
                >
                  {trend.currentMood}
                </div>
                {trend.dominantPriorMood && trend.dominantPriorMood !== trend.currentMood && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    Previously: <span className="capitalize">{trend.dominantPriorMood}</span>
                  </div>
                )}
              </div>
              <div className={`text-sm font-medium capitalize ${moodTrendColor}`}>
                {trend.moodTrend === 'improving' ? '↑ Improving' :
                 trend.moodTrend === 'declining' ? '↓ Declining' : '→ Stable'}
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {(['exhausted', 'overwhelmed', 'restless', 'grounded', 'flourishing'] as MoodType[]).map((m) => (
                <div
                  key={m}
                  className="flex-1 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: getMoodColor(m),
                    opacity: m === trend.currentMood ? 1 : 0.2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Session momentum */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Tracking Momentum</p>
            <div className="text-3xl font-bold text-white mb-1">{trend.sessionCount}</div>
            <p className="text-xs text-slate-400">
              {trend.sessionCount === 1
                ? 'First diagnostic — great start!'
                : trend.sessionCount < 5
                ? 'Building your data profile'
                : trend.sessionCount < 20
                ? 'Strong tracking habit forming'
                : 'Excellent long-term tracker'}
            </p>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              View full analytics
            </Link>
          </div>
        </div>

        {/* Insight + tip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
            <Brain className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Clinical Insight</p>
              <p className="text-sm text-slate-300 leading-relaxed">{insight.message}</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 bg-teal-500/8 border border-teal-500/20 rounded-xl">
            <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">Recommended Action</p>
              <p className="text-sm text-slate-300 leading-relaxed">{insight.tip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MAX_SENTENCES = 3;

export function DashboardPage() {
  const { addDiagnostic, diagnostics } = useWellness();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [journalText, setJournalText] = useState('');
  const [stressLevel, setStressLevel] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trendResult, setTrendResult] = useState<TrendResult | null>(null);

  const sentenceCount = useMemo(() => {
    return journalText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  }, [journalText]);

  const wordCount = useMemo(() => {
    return journalText.trim().split(/\s+/).filter((w) => w.length > 0).length;
  }, [journalText]);

  const canSubmit = selectedMood !== null && sentenceCount <= MAX_SENTENCES && journalText.trim().length > 0;

  const handleDiagnostic = async () => {
    if (!canSubmit || !selectedMood) return;
    setIsSubmitting(true);
    const trend = computeTrend({ mood: selectedMood, stressLevel }, diagnostics);
    await addDiagnostic({ mood: selectedMood, journal: journalText.trim(), stressLevel });
    setTrendResult({ ...trend, sessionCount: diagnostics.length + 1 });
    setIsSubmitting(false);
    setSelectedMood(null);
    setJournalText('');
    setStressLevel(5);
  };

  const handleNewEntry = () => setTrendResult(null);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Diagnostic Workspace</h1>
          <p className="text-slate-400">Assess your current mental state to track patterns and receive personalised insights.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Show trend analysis if just submitted */}
          {trendResult && (
            <>
              <TrendAnalysisPanel trend={trendResult} mood={trendResult.currentMood} />
              <div className="lg:col-span-12">
                <button
                  onClick={handleNewEntry}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Record Another Diagnostic
                </button>
              </div>
            </>
          )}

          {!trendResult && (
            <>
              {/* Panel A – Mood Selector */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Current Mood Assessment</h2>
                      <p className="text-sm text-slate-400">Select the state that best describes you right now</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moodOptions.map((mood) => {
                      const Icon = mood.icon;
                      const isSelected = selectedMood === mood.id;
                      return (
                        <button
                          key={mood.id}
                          onClick={() => setSelectedMood(mood.id)}
                          className={`group relative p-4 rounded-xl border transition-all duration-300 text-left ${
                            isSelected
                              ? 'bg-slate-800/50 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                              : 'bg-slate-800/20 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
                          }`}
                        >
                          {isSelected && (
                            <div
                              className="absolute inset-0 rounded-xl pointer-events-none"
                              style={{ boxShadow: `0 0 20px ${getMoodColor(mood.id)}30` }}
                            />
                          )}
                          <div className="relative">
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                                style={{
                                  background: isSelected
                                    ? `${getMoodColor(mood.id)}20`
                                    : undefined,
                                  border: isSelected ? `2px solid ${getMoodColor(mood.id)}60` : undefined,
                                }}
                              >
                                <Icon
                                  className="w-6 h-6 transition-colors"
                                  style={{ color: isSelected ? getMoodColor(mood.id) : undefined }}
                                />
                              </div>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                            </div>
                            <h3 className="font-semibold text-white mb-1">{mood.label}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{mood.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Panel B – Micro Journal */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Micro-Journal</h2>
                      <p className="text-sm text-slate-400">Capture your thoughts (3 sentences max)</p>
                    </div>
                  </div>

                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write a brief reflection on your current state..."
                    className="w-full h-36 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className={sentenceCount > MAX_SENTENCES ? 'text-red-400' : 'text-slate-400'}>
                      <span className={`font-medium ${sentenceCount > MAX_SENTENCES ? 'text-red-400' : 'text-emerald-400'}`}>{sentenceCount}</span>/{MAX_SENTENCES} sentences
                    </span>
                    <span className="text-slate-500">{wordCount} words</span>
                  </div>
                </div>
              </div>

              {/* Panel C – Stress Index */}
              <div className="lg:col-span-6">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Stress Index</h2>
                      <p className="text-sm text-slate-400">Rate your current stress (1 = minimal, 10 = severe)</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-400">Low Stress</span>
                      <span className="text-red-400">High Stress</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-6
                        [&::-webkit-slider-thumb]:h-6
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:hover:scale-125
                        [&::-webkit-slider-thumb]:transition-transform"
                    />
                    <div className="flex items-center justify-center">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                          background: `${getStressColor(stressLevel)}20`,
                          boxShadow: `0 0 30px ${getStressColor(stressLevel)}30`,
                        }}
                      >
                        <span className="text-3xl font-bold" style={{ color: getStressColor(stressLevel) }}>
                          {stressLevel}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: getStressColor(i + 1),
                            opacity: i < stressLevel ? 1 : 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel D – Execute */}
              <div className="lg:col-span-6">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Execute Diagnostic</h2>
                      <p className="text-sm text-slate-400">Save and analyse your assessment</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {selectedMood && (
                      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">
                          Mood: {moodOptions.find((m) => m.id === selectedMood)?.label}
                        </span>
                      </div>
                    )}
                    {journalText.trim().length > 0 && sentenceCount <= MAX_SENTENCES && (
                      <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">Journal ready ({wordCount} words)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-400">Stress index: {stressLevel}/10</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDiagnostic}
                    disabled={!canSubmit || isSubmitting}
                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 mt-4 ${
                      canSubmit && !isSubmitting
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Analysing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Execute &amp; Analyse
                      </>
                    )}
                  </button>
                  {!canSubmit && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                      Select a mood and add a journal entry to continue
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Recent entries footer */}
          {!trendResult && diagnostics.length > 0 && (
            <div className="lg:col-span-12 bg-slate-900/30 rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">Recent Diagnostics</h3>
                  <p className="text-sm text-slate-400">
                    {diagnostics.length} recorded {diagnostics.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <Link
                  to="/analytics"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-white rounded-lg border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all text-sm"
                >
                  View Analytics <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

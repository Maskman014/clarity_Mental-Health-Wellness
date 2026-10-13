import { DiagnosticEntry, MoodType, MOOD_LABELS } from '../context/WellnessContext';

export function generateClinicalReport(diagnostic: DiagnosticEntry[]): string {
  const timestamp = new Date().toISOString();
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const entries = diagnostic.map((entry) => ({
    date: new Date(entry.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    mood: MOOD_LABELS[entry.mood],
    moodCode: entry.mood,
    stressLevel: entry.stressLevel,
    journal: entry.journal,
  }));

  const avgStress = diagnostic.length > 0
    ? (diagnostic.reduce((sum, e) => sum + e.stressLevel, 0) / diagnostic.length).toFixed(1)
    : 'N/A';

  const moodCounts: Record<MoodType, number> = {
    flourishing: 0,
    grounded: 0,
    overwhelmed: 0,
    exhausted: 0,
    restless: 0,
  };

  diagnostic.forEach((e) => {
    moodCounts[e.mood]++;
  });

  const dominantMood = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)[0];

  const report = {
    reportHeader: {
      platform: 'Clarity Mental Health & Wellness Platform',
      reportType: 'Clinical History Export',
      generatedAt: reportDate,
      isoTimestamp: timestamp,
      patientEntries: diagnostic.length,
    },
    summary: {
      averageStressLevel: avgStress,
      dominantMood: dominantMood ? MOOD_LABELS[dominantMood[0] as MoodType] : 'N/A',
      moodDistribution: {
        flourishing: moodCounts.flourishing,
        grounded: moodCounts.grounded,
        overwhelmed: moodCounts.overwhelmed,
        exhausted: moodCounts.exhausted,
        restless: moodCounts.restless,
      },
    },
    entries,
    disclaimer: 'This report is generated from self-reported data and should be used as a supplementary tool by healthcare professionals. It does not constitute a clinical diagnosis.',
  };

  return JSON.stringify(report, null, 2);
}

export function downloadClinicalReport(diagnostic: DiagnosticEntry[], filename: string = 'clarity-clinical-report.json'): void {
  const report = generateClinicalReport(diagnostic);
  const blob = new Blob([report], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getMoodColor(mood: MoodType): string {
  const colors: Record<MoodType, string> = {
    flourishing: '#10b981',
    grounded: '#3b82f6',
    overwhelmed: '#f59e0b',
    exhausted: '#ef4444',
    restless: '#8b5cf6',
  };
  return colors[mood];
}

export function getStressColor(level: number): string {
  if (level <= 3) return '#10b981';
  if (level <= 5) return '#3b82f6';
  if (level <= 7) return '#f59e0b';
  return '#ef4444';
}

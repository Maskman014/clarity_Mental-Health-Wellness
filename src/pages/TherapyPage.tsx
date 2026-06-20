import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Quote,
  Droplets,
  Waves,
  Wind,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';

const affirmations = [
  { text: "You are worthy of peace and happiness.", category: "Self-Worth" },
  { text: "Every breath you take brings calm to your body.", category: "Mindfulness" },
  { text: "You have the strength to overcome any challenge.", category: "Resilience" },
  { text: "Your feelings are valid and deserve to be acknowledged.", category: "Acceptance" },
  { text: "You are growing stronger with each passing day.", category: "Growth" },
  { text: "Peace begins with a single conscious breath.", category: "Calming" },
  { text: "You deserve to take time for yourself.", category: "Self-Care" },
  { text: "Your mental health is a priority, not an afterthought.", category: "Wellness" },
  { text: "You are not defined by your struggles.", category: "Identity" },
  { text: "Today, you choose to be kind to yourself.", category: "Compassion" },
  { text: "You are surrounded by invisible support.", category: "Connection" },
  { text: "Each moment is a fresh beginning.", category: "Hope" },
  { text: "Your journey is unique and valid.", category: "Acceptance" },
  { text: "You release what you cannot control.", category: "Letting Go" },
  { text: "Your presence makes a difference in the world.", category: "Purpose" },
];

const soundscapes = [
  { id: 'rain', title: 'Rainfall', gradient: 'from-blue-400 to-cyan-500' },
  { id: 'waves', title: 'Wave Therapy', gradient: 'from-teal-400 to-emerald-500' },
  { id: 'ambient', title: 'Ambient Focus', gradient: 'from-slate-400 to-gray-500' },
];

export function TherapyPage() {
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [breathOpacity, setBreathOpacity] = useState(0.5);

  const generateAffirmation = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setCurrentAffirmation(affirmations[randomIndex]);
  }, []);

  useEffect(() => {
    if (!isBreathing) return;

    const cycleTime = 8000;
    const phaseTime = cycleTime / 3;

    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'inhale') {
          setBreathOpacity(1);
          return 'hold';
        } else if (prev === 'hold') {
          return 'exhale';
        } else {
          setBreathOpacity(0.5);
          setBreathCount((c) => c + 1);
          return 'inhale';
        }
      });
    }, phaseTime);

    return () => clearInterval(interval);
  }, [isBreathing]);

  const toggleBreathing = () => {
    setIsBreathing(!isBreathing);
    if (!isBreathing) {
      setBreathPhase('inhale');
      setBreathCount(0);
      setBreathOpacity(0.5);
    }
  };

  const bubbleScale = useMemo(() => {
    if (!isBreathing) return 1;
    if (breathPhase === 'inhale' || breathPhase === 'hold') {
      return 1 + (breathOpacity - 0.5) * 0.5;
    }
    return 0.8 + breathOpacity * 0.3;
  }, [isBreathing, breathPhase, breathOpacity]);

  const bubbleGlow = useMemo(() => {
    if (!isBreathing) return 'rgba(16, 185, 129, 0.2)';
    const intensity = breathPhase === 'inhale' || breathPhase === 'hold' ? 0.4 : 0.2;
    return `rgba(16, 185, 129, ${intensity})`;
  }, [isBreathing, breathPhase]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Zen Therapy Room</h1>
          <p className="text-slate-400">
            A dedicated space for mindfulness, relaxation, and therapeutic exercises.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Quote className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Clinical Affirmations</h2>
                  <p className="text-sm text-slate-400">Therapeutic positive statements</p>
                </div>
              </div>

              <div className="relative min-h-[200px] flex items-center justify-center mb-6">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl opacity-50"
                />
                <div className="relative text-center px-6">
                  <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">
                    {currentAffirmation.category}
                  </div>
                  <p className="text-xl text-white font-medium leading-relaxed">
                    &ldquo;{currentAffirmation.text}&rdquo;
                  </p>
                </div>
              </div>

              <button
                onClick={generateAffirmation}
                className="w-full py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Generate New Affirmation
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Calm Bubble Breathing</h2>
                    <p className="text-sm text-slate-400">4-4-4 therapeutic breathing exercise</p>
                  </div>
                </div>
                <button
                  onClick={toggleBreathing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isBreathing
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  }`}
                >
                  {isBreathing ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Session
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-center py-8">
                <div className="relative">
                  <div
                    className="w-48 h-48 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out"
                    style={{
                      transform: `scale(${bubbleScale})`,
                      background: `radial-gradient(circle at 30% 30%, rgba(52, 211, 153, 0.3), rgba(16, 185, 129, 0.1))`,
                      boxShadow: `
                        0 0 60px ${bubbleGlow},
                        inset 0 -20px 40px rgba(16, 185, 129, 0.2),
                        inset 0 20px 40px rgba(255, 255, 255, 0.1)
                      `,
                    }}
                  >
                    <div
                      className="absolute inset-4 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.2), transparent)`,
                      }}
                    />

                    {isBreathing ? (
                      <div className="text-center z-10">
                        <div className="text-2xl font-light text-white capitalize mb-1">
                          {breathPhase}
                        </div>
                        <div className="text-sm text-emerald-300">
                          {breathPhase === 'inhale' && 'Breathe in slowly...'}
                          {breathPhase === 'hold' && 'Hold your breath...'}
                          {breathPhase === 'exhale' && 'Release gently...'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center z-10">
                        <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                        <div className="text-sm text-slate-400">Tap to begin</div>
                      </div>
                    )}
                  </div>

                  {isBreathing && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-500 ${
                              i < breathCount % 5 ? 'bg-emerald-400' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 ml-2">
                        {breathCount} breath{breathCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-8 text-sm text-slate-400 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Inhale (4s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-400" />
                  <span>Hold (4s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span>Exhale (4s)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Waves className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Soundscape Controller</h2>
                  <p className="text-sm text-slate-400">Immersive ambient wellness audio</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {soundscapes.map((soundscape) => (
                  <AudioPlayer
                    key={soundscape.id}
                    id={soundscape.id}
                    title={soundscape.title}
                    gradient={soundscape.gradient}
                  />
                ))}
              </div>

              <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <Wind className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-400">
                    Ambient sounds can help reduce stress, improve focus, and promote relaxation.
                    Use these soundscapes during work, meditation, or before sleep to enhance
                    your mental well-being. For best results, use headphones.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Daily Wellness Reminder
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Consistency is key to mental wellness. Try to complete at least one breathing
                    session and read an affirmation daily to build healthy habits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

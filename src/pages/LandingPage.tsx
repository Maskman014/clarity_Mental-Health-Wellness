import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Heart,
  Shield,
  ArrowRight,
  Activity,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

const statsData = [
  { id: 'users', label: 'Active Users', target: 50000, icon: Users },
  { id: 'diagnostics', label: 'Sessions Completed', target: 125000, icon: Activity },
  { id: 'improvement', label: 'Wellness Rate', target: 87, suffix: '%', icon: TrendingUp },
];

const impactFeatures = [
  {
    icon: Brain,
    title: 'Mental Health Stewardship',
    description: 'Evidence-based tools designed to support emotional regulation and psychological well-being.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Target,
    title: 'SDG 3.4 Alignment',
    description: 'Directly contributing to reducing premature mortality from non-communicable diseases by 2030.',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Privacy-First Design',
    description: 'Your mental health data stays on your device. We prioritize confidentiality and trust.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Heart,
    title: 'Holistic Wellness',
    description: 'Integrating mindfulness, stress tracking, and therapeutic exercises for complete care.',
    gradient: 'from-rose-400 to-pink-500',
  },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="font-bold">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function LandingPage() {
  const { diagnostics } = useWellness();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % impactFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <section className="pt-20 pb-16 px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">UN SDG Target 3.4</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Clarity
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              An elite Mental Health &amp; Wellness platform dedicated to promoting mental well-being
              and reducing premature mortality from non-communicable diseases through therapeutic
              technologies and evidence-based practices.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <Link
                to="/dashboard"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <Activity className="w-5 h-5" />
                Begin Diagnostic
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/therapy"
                className="px-8 py-4 bg-slate-800/50 text-white rounded-xl font-semibold flex items-center gap-2 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300"
              >
                <Heart className="w-5 h-5" />
                Enter Therapy Room
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {statsData.map((stat) => (
                <div
                  key={stat.id}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300">
                    <stat.icon className="w-8 h-8 text-emerald-400 mb-3" />
                    <div className="text-3xl text-white mb-1">
                      <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                    </div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Advancing Global Mental Health
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Clarity aligns with the United Nations Sustainable Development Goal 3, targeting
                the promotion of mental health and well-being for all.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {impactFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group relative transition-all duration-500 ${
                    activeFeature === index ? 'scale-[1.02]' : ''
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />
                  <div
                    className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 ${
                      activeFeature === index
                        ? 'border-emerald-500/50'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center flex-shrink-0`}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    {activeFeature === index && (
                      <Sparkles className="absolute top-4 right-4 w-4 h-4 text-emerald-400 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/dashboard"
                className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Diagnostic Workspace
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Assess your current mental state with our interactive mood selector,
                    micro-journaling, and stress index tools.
                  </p>
                  <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                    <span>Access Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link
                to="/analytics"
                className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Analytics &amp; Trends
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Visualize your mental health journey with clinical trend charts
                    and export reports for medical professionals.
                  </p>
                  <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
                    <span>View Analytics</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {diagnostics.length > 0 && (
              <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Welcome back!</p>
                  <p className="text-slate-400 text-sm">
                    You have {diagnostics.length} diagnostic{' '}
                    {diagnostics.length === 1 ? 'entry' : 'entries'} recorded.
                  </p>
                </div>
                <Link
                  to="/analytics"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  View History
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Heart, Shield, Target, Globe, Users,
  Activity, BarChart3, Waves, Quote, ArrowRight,
  CheckCircle2, AlertCircle, BookOpen, Lightbulb,
  Lock, TrendingUp,
} from 'lucide-react';

const sdgPillars = [
  {
    icon: Target,
    title: 'SDG 3.4 Direct Alignment',
    description: 'Clarity is built specifically to support UN Sustainable Development Goal 3.4: to reduce premature mortality from non-communicable diseases by one-third by 2030, and to promote mental health and well-being.',
    color: 'emerald',
  },
  {
    icon: Globe,
    title: 'Universal Access',
    description: 'Designed to be accessible to anyone with a browser — no specialist equipment, no clinical referral needed. Evidence-based tools available to all, regardless of geography or socioeconomic background.',
    color: 'blue',
  },
  {
    icon: Shield,
    title: 'Privacy-First Architecture',
    description: 'All diagnostic data is encrypted, tied to your unique account, and never shared with third parties. You own your mental health data — always.',
    color: 'amber',
  },
  {
    icon: BookOpen,
    title: 'Evidence-Based Methodology',
    description: 'Every feature — from the 4-4-4 breathing technique to the micro-journaling protocol — is grounded in peer-reviewed research in positive psychology and cognitive behavioural therapy.',
    color: 'teal',
  },
];

const features = [
  { icon: Activity, label: 'Diagnostic Workspace', desc: 'Mood assessment, stress indexing, and micro-journaling in one unified session.' },
  { icon: BarChart3, label: 'Clinical Analytics', desc: 'Interactive trend charts, mood distribution analysis, and exportable clinical reports.' },
  { icon: Waves, label: 'Therapy Room', desc: 'Guided breathing exercises, therapeutic affirmations, and ambient soundscapes.' },
  { icon: Brain, label: 'Trend Analysis', desc: 'Immediate AI-style insights comparing your current session to historical patterns.' },
  { icon: Lock, label: 'Secure Auth', desc: 'Supabase-powered authentication with per-user data isolation and row-level security.' },
  { icon: TrendingUp, label: 'Progress Tracking', desc: 'Long-term well-being trends visualised over 7 days, 30 days, or all time.' },
];

const faqItems = [
  {
    q: 'Is Clarity a replacement for professional mental health care?',
    a: 'No. Clarity is a self-monitoring and wellness tool intended to complement — not replace — professional mental health support. If you are in crisis, please contact a licensed mental health professional or your local emergency services.',
  },
  {
    q: 'Who can see my data?',
    a: 'Only you. All diagnostic entries are stored in an isolated database partition tied exclusively to your user account via row-level security policies. No staff member or third party can access your entries.',
  },
  {
    q: 'What are the biometric stress index levels?',
    a: 'Levels 1–3 indicate low stress; 4–5 moderate; 6–7 elevated; 8–10 high. These are self-reported and serve as a personal reference — they are not clinical measurements.',
  },
  {
    q: 'How often should I run a diagnostic?',
    a: 'Once a day is ideal for building a meaningful trend picture, but even 2–3 times per week provides actionable insights. Consistency matters more than frequency.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. The Analytics page lets you export a full clinical-style JSON report covering all your entries, mood distribution, and stress averages — useful for sharing with a therapist.',
  },
];

export function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-8 pt-16 pb-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">About Clarity</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Mental wellness technology{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              for everyone.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Clarity is a UN SDG 3.4-aligned mental health and wellness platform that empowers
            individuals to understand, track, and improve their emotional well-being through
            evidence-based tools — available to anyone, anywhere.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
            >
              <Activity className="w-4 h-4" />
              Start a Diagnostic
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-2 px-6 py-3 bg-slate-800/60 text-white rounded-xl font-semibold border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Mission statement */}
      <section className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-8">
            <div className="flex gap-4">
              <Quote className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xl text-white leading-relaxed font-medium italic">
                  "Mental health is not a luxury. By 2030, the United Nations aims to reduce
                  premature deaths from non-communicable diseases by one-third and to promote
                  mental health and well-being for all. Clarity exists to make that goal reachable
                  — one session at a time."
                </p>
                <p className="text-emerald-400 text-sm mt-4 font-semibold">
                  The Clarity Platform — Aligned with UNSDG Target 3.4
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDG Pillars */}
      <section className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">Our Core Commitments</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Four principles guide every design decision in the Clarity platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sdgPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${pillar.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${pillar.color}-400`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">{pillar.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">Platform Features</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every tool in Clarity is purpose-built for mental health monitoring and support.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="bg-slate-900/40 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{f.label}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">How Clarity Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">A simple three-step loop that builds lasting mental resilience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01', icon: Activity, title: 'Assess',
                desc: 'Complete a Diagnostic session — select your current mood, write a short journal entry, and rate your stress level.',
              },
              {
                step: '02', icon: Brain, title: 'Analyse',
                desc: 'Receive immediate trend analysis comparing your session to your history. Understand your patterns.',
              },
              {
                step: '03', icon: TrendingUp, title: 'Improve',
                desc: 'Follow personalised recommendations, use the Therapy Room exercises, and track your progress over time.',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                  <div className="text-5xl font-black text-slate-800 absolute top-4 right-6">{s.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">Built With Purpose</h2>
                <p className="text-slate-400 leading-relaxed text-sm mb-4">
                  Clarity was developed by a multidisciplinary team of mental health advocates,
                  software engineers, and UX researchers united by a common goal: making
                  evidence-based mental health tools available to every person on the planet —
                  not just those with access to clinical care.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Evidence-Based Design', 'Clinical-Grade Privacy', 'SDG 3.4 Aligned', 'Open to All'].map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((faq, i) => (
              <div key={i} className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                  <div className={`w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180 border-emerald-500' : ''}`}>
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical disclaimer */}
      <section className="px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-4 p-5 bg-amber-500/8 border border-amber-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-semibold text-sm mb-1">Clinical Disclaimer</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Clarity is a self-monitoring and wellness support tool. It is not a medical device,
                does not provide clinical diagnoses, and is not a substitute for professional mental
                health care. If you are experiencing a mental health crisis or are in danger, please
                contact your local emergency services or a licensed mental health professional immediately.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

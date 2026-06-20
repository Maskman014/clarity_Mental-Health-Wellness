import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Heart, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RootLandingPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate('/landing', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
      {/* Full-bleed layered background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-0 w-full h-full opacity-40"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(16,185,129,0.18) 0%, transparent 60%)' }}
        />
        <div className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 80%, rgba(20,184,166,0.18) 0%, transparent 60%)' }}
        />
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)' }}
        />
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#10b981" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/2 w-48 h-48 bg-emerald-400/8 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 pointer-events-none" />
          <img
            src="/assets/image.png"
            alt="Clarity – UN SDG 3.4 Mental Wellness Platform"
            className="relative w-64 h-48 object-contain drop-shadow-2xl mx-auto"
          />
        </div>

        {/* Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
          <Brain className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">UN SDG 3.4 Mental Wellness</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-[1.1]">
          Your mind{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            deserves clarity.
          </span>
        </h1>

        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
          Track emotional well-being, manage stress, and build lasting mental
          resilience — backed by evidence and aligned with global health goals.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link
            to="/login"
            className="flex-1 py-4 rounded-xl font-semibold text-white border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 flex items-center justify-center text-base"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="flex-1 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg shadow-emerald-500/30"
          >
            Sign Up Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-8 mt-12">
          {[
            { icon: Shield, label: 'Secure & Private' },
            { icon: Heart, label: 'Evidence-Based' },
            { icon: Brain, label: 'SDG Aligned' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center">
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 mt-14 text-xs text-slate-600 pb-8">
        &copy; {new Date().getFullYear()} Clarity. Supporting UN SDG Target&nbsp;3.4.
      </p>
    </div>
  );
}

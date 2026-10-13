import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate('/landing', { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : error.message
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/image.png"
              alt="Clarity"
              className="h-16 object-contain"
            />
          </Link>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to continue your wellness journey.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          <Link to="/" className="hover:text-slate-400 transition-colors">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

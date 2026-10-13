import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function SignUpPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session) navigate('/landing', { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(
        error.message.includes('already registered')
          ? 'An account with this email already exists. Try logging in instead.'
          : error.message
      );
      setLoading(false);
      return;
    }

    if (data.session) {
      navigate('/landing', { replace: true });
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    if (!password) return null;
    if (password.length < 8) return { label: 'Too short', color: 'text-red-400', fill: 'bg-red-500', width: '25%' };
    if (password.length < 12) return { label: 'Fair', color: 'text-amber-400', fill: 'bg-amber-500', width: '55%' };
    return { label: 'Strong', color: 'text-emerald-400', fill: 'bg-emerald-500', width: '100%' };
  })();

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account created!</h2>
          <p className="text-slate-400 mb-6">
            Check your email to confirm your account, then{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              sign in
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-teal-500/8 rounded-full blur-3xl" />
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
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm">Begin your mental wellness journey with Clarity.</p>
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
                  placeholder="Min. 8 characters"
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
              {passwordStrength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.fill}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                  <p className={`text-xs ${passwordStrength.color}`}>{passwordStrength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && password.length >= 8 && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
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
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Sign in
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

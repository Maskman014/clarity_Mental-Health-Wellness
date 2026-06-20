import React, { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Activity,
  BarChart3,
  Heart,
  Sparkles,
  LogOut,
  User,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/landing', label: 'Impact Portal', icon: Home },
  { path: '/dashboard', label: 'Diagnostic', icon: Activity },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/therapy', label: 'Therapy Room', icon: Heart },
  { path: '/about', label: 'About', icon: Info },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-50">
        {/* Brand — uses the Clarity logo image */}
        <div className="p-5 border-b border-slate-800/50 flex items-center gap-3">
          <img
            src="/assets/image.png"
            alt="Clarity"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-white border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'scale-110 text-emerald-400' : 'group-hover:scale-105'
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && <Sparkles className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800/50 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/40">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-300 truncate font-medium">{user.email}</p>
                <p className="text-xs text-slate-500">Clarity Member</p>
              </div>
            </div>
          )}

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 text-sm group"
          >
            <LogOut className="w-4 h-4 transition-colors" />
            <span>Sign Out</span>
          </button>

          <div className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <p className="text-xs text-slate-400">UN SDG 3.4 — Promoting</p>
            <p className="text-xs text-emerald-400 font-semibold">Mental Health & Well-Being</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

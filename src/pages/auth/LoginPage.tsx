import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/context/AuthContext';
import { FamilySide, UserRole } from '@/types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('wedding_admin');
  const [familySide, setFamilySide] = useState<FamilySide>('groom');
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password, role, familySide);
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    try {
      await login('arjun.verma@example.com', undefined, 'wedding_admin', 'groom');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize demo login.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-wine-800 to-wine-900 mx-auto flex items-center justify-center text-gold-400 shadow-wedding border border-gold-400/30">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-wine-900">Make My Marriage</h1>
          <p className="text-xs text-charcoal-500 font-medium">
            One Wedding. Two Families. One Shared Workspace.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-3xl border border-sand-border shadow-wedding-lg space-y-5">
          <div className="border-b border-sand-border pb-3">
            <h2 className="font-serif text-xl font-bold text-charcoal-900">Sign In</h2>
            <p className="text-xs text-charcoal-500 mt-0.5">Please log in to access your wedding workspace</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 uppercase mb-1">
                  Family Side
                </label>
                <select
                  value={familySide}
                  onChange={(e) => setFamilySide(e.target.value as FamilySide)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border bg-white"
                >
                  <option value="groom">Groom's Family</option>
                  <option value="bride">Bride's Family</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border bg-white"
                >
                  <option value="wedding_admin">Wedding Admin</option>
                  <option value="family_admin">Family Admin</option>
                  <option value="family_member">Family Member</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 mt-2" isLoading={isLoading}>
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Preview Option */}
          <div className="relative py-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand-border" />
            </div>
            <span className="relative bg-white px-3 text-[11px] text-charcoal-400 uppercase tracking-wider">
              Or Instant Demo
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-gold-400/50 bg-gold-50/50 text-wine-900 hover:bg-gold-100/60 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>Quick Demo Preview</span>
          </button>

          <div className="pt-2 text-center text-xs text-charcoal-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-semibold text-wine-800 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

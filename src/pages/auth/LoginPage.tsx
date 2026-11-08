import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/context/AuthContext';
import { FamilySide, UserRole } from '@/types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('arjun.verma@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('wedding_admin');
  const [familySide, setFamilySide] = useState<FamilySide>('groom');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, role, familySide);
    navigate('/dashboard');
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
        <div className="bg-white p-8 rounded-3xl border border-sand-border shadow-wedding-lg space-y-6">
          <div className="border-b border-sand-border pb-3">
            <h2 className="font-serif text-xl font-bold text-charcoal-900">Sign In</h2>
            <p className="text-xs text-charcoal-500 mt-0.5">Access your shared wedding workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
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

          <div className="pt-2 text-center text-xs text-charcoal-500">
            Don't have a wedding workspace?{' '}
            <Link to="/setup" className="font-semibold text-wine-800 hover:underline">
              Create New Wedding
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

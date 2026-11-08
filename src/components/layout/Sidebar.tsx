import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CalendarCheck,
  Users2,
  MailOpen,
  Sparkles,
  Settings,
  HeartHandshake,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWedding } from '@/app/context/WeddingContext';
import { useAuth } from '@/app/context/AuthContext';
import { FamilyBadge } from '@/components/ui/Badge';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { wedding, invitation } = useWedding();
  const { user, familySide, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Tasks & Events', path: '/tasks-events', icon: CalendarCheck },
    { label: 'Family & Discussions', path: '/family', icon: Users2 },
    { label: 'Guests & RSVP', path: '/guests', icon: MailOpen },
    { label: 'Invitation Editor', path: '/invitation/editor', icon: Sparkles },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-sand-border flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-sand-border/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-wine-800 to-wine-900 flex items-center justify-center text-gold-400 shadow-sm border border-gold-400/30">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-wine-900 tracking-tight leading-tight">
              Make My Marriage
            </h1>
            <p className="text-[10px] text-gold-600 font-semibold uppercase tracking-wider">
              Shared Workspace
            </p>
          </div>
        </div>

        {/* Couple & Date banner */}
        <div className="mt-4 p-2.5 rounded-xl bg-sand-50 border border-sand-200/80">
          <p className="text-xs font-serif font-bold text-charcoal-900 truncate">
            {wedding.brideName} & {wedding.groomName}
          </p>
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 mt-0.5">
            <span>Dec 12, 2026</span>
            <span className="text-wine-800 font-medium">Udaipur</span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-wine-800 text-white shadow-sm font-semibold'
                    : 'text-charcoal-700 hover:bg-sand-100 hover:text-wine-900'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Public Invitation Link Preview */}
        <div className="pt-4 px-1">
          <a
            href={`/invite/${invitation.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sand-100 to-gold-50 border border-gold-200 text-wine-900 text-xs font-semibold hover:border-gold-400 transition-all group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              View Public Card
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-gold-600 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-sand-border/80 bg-sand-50/40">
        <div className="flex items-center justify-between mb-2">
          <FamilyBadge side={familySide} />
          <button
            onClick={() => logout()}
            title="Sign out"
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-wine-700 text-white font-serif font-bold text-xs flex items-center justify-center">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-charcoal-900 truncate">{user?.fullName}</p>
            <p className="text-[10px] text-charcoal-500 capitalize">Wedding Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

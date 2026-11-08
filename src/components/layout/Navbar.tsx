import React, { useState } from 'react';
import { Menu, Bell, Plus, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWedding } from '@/app/context/WeddingContext';
import { formatCurrency } from '@/lib/utils';

interface NavbarProps {
  onToggleMobile: () => void;
  onOpenAddExpense?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobile, onOpenAddExpense }) => {
  const { metrics, invitation } = useWedding();
  const [copied, setCopied] = useState(false);

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/invite/${invitation.slug}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-sand-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile trigger & workspace tag */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-charcoal-700 hover:bg-sand-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide">
            Workspace:
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-sand-100 text-charcoal-800 font-medium border border-sand-border">
            Sharma & Verma Royal Wedding
          </span>
        </div>
      </div>

      {/* Right: Quick budget status & action buttons */}
      <div className="flex items-center gap-3">
        {/* Budget remaining pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold-50/70 border border-gold-200">
          <span className="text-xs text-gold-900 font-medium">Remaining:</span>
          <span className="text-xs font-bold font-serif text-wine-900">
            {formatCurrency(metrics.remainingBudget)}
          </span>
        </div>

        {/* Share Invite button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyInviteLink}
          className="hidden sm:inline-flex"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-gold-600" />}
          <span>{copied ? 'Link Copied' : 'Share Card'}</span>
        </Button>

        {/* Quick Add Expense button */}
        {onOpenAddExpense && (
          <Button variant="primary" size="sm" onClick={onOpenAddExpense}>
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Expense</span>
          </Button>
        )}

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="p-2 rounded-xl text-charcoal-600 hover:text-wine-900 hover:bg-sand-100 relative transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-wine-600 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};

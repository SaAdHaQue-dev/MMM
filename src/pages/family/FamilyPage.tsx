import React, { useState } from 'react';
import { Users2, Megaphone, Plus, Pin, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FamilyBadge } from '@/components/ui/Badge';
import { useWedding } from '@/app/context/WeddingContext';

export const FamilyPage: React.FC = () => {
  const { announcements, addAnnouncement } = useWedding();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const sampleMembers = [
    { name: 'Arjun Verma', role: 'Wedding Admin', side: 'groom' as const, email: 'arjun@example.com' },
    { name: 'Vikram Verma', role: 'Family Admin', side: 'groom' as const, email: 'vikram@example.com' },
    { name: 'Priya Sharma', role: 'Wedding Admin', side: 'bride' as const, email: 'priya@example.com' },
    { name: 'Sunita Sharma', role: 'Family Admin', side: 'bride' as const, email: 'sunita@example.com' },
    { name: 'R.K. Sharma', role: 'Family Member', side: 'bride' as const, email: 'rk.sharma@example.com' },
  ];

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addAnnouncement(newTitle, newContent, isPinned);
    setNewTitle('');
    setNewContent('');
    setIsPinned(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-serif font-bold text-wine-900">Family Coordination & Workspace</h2>
        <p className="text-xs text-charcoal-500 mt-1">
          Bridge both families into one cohesive planning circle. Share announcements, deliberate on decisions, and delegate responsibilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Members Directory */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users2 className="w-4 h-4 text-wine-800" />
                Family Members ({sampleMembers.length})
              </CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <UserPlus className="w-3.5 h-3.5" />
              Invite
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {sampleMembers.map((member, i) => (
              <div key={i} className="p-3 rounded-xl border border-sand-border bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-charcoal-900">{member.name}</h4>
                  <FamilyBadge side={member.side} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                  <span className="capitalize">{member.role.replace('_', ' ')}</span>
                  <span>{member.email}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Announcements and Discussions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Announcement Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-gold-600" />
                Post Family Announcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePostAnnouncement} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Announcement title (e.g. Haldi dress color theme decided: Mustard Yellow)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Details, instructions, or meeting notes for both families..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-charcoal-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded text-wine-800 focus:ring-wine-800 border-sand-300"
                    />
                    <span>Pin to top of workspace</span>
                  </label>
                  <Button type="submit" variant="primary" size="sm">
                    <Plus className="w-3.5 h-3.5" />
                    Post Notice
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Announcements Feed */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-wine-900">Workspace Notices</h3>
            {announcements.map((ann) => (
              <Card key={ann.id} className={ann.isPinned ? 'border-gold-400 bg-gold-50/20' : ''}>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {ann.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold-800 bg-gold-100 px-2 py-0.5 rounded-full border border-gold-200">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <h4 className="font-serif font-bold text-sm text-charcoal-900">{ann.title}</h4>
                    </div>
                    <span className="text-[11px] text-charcoal-400">Today</span>
                  </div>
                  <p className="text-xs text-charcoal-700 leading-relaxed">{ann.content}</p>
                  <div className="pt-2 text-[11px] text-wine-900 font-semibold">
                    Posted by: {ann.authorName}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

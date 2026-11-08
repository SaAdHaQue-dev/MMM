import React, { useState } from 'react';
import { UserCheck, UserX, Users, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { FamilyBadge, Badge } from '@/components/ui/Badge';
import { useWedding } from '@/app/context/WeddingContext';
import { FamilySide } from '@/types';

export const GuestsPage: React.FC = () => {
  const { guests, addGuest } = useWedding();
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestGroup, setGuestGroup] = useState('');
  const [guestFamily, setGuestFamily] = useState<FamilySide>('groom');

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    addGuest({
      fullName: guestName,
      phone: guestPhone,
      groupName: guestGroup,
      familySide: guestFamily,
      invitationStatus: 'not_sent',
    });

    setGuestName('');
    setGuestPhone('');
    setGuestGroup('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-wine-900">Guest List & RSVPs</h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Organize invitees by family side, track invitation delivery, and monitor real-time RSVP responses.
          </p>
        </div>
      </div>

      {/* Guest & RSVP Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Guests"
          value={guests.length.toString()}
          subtitle="Configured guest records"
          icon={<Users className="w-5 h-5" />}
          highlightColor="neutral"
        />
        <StatCard
          title="Confirmed Attending"
          value="48"
          subtitle="Expected headcount"
          icon={<UserCheck className="w-5 h-5" />}
          highlightColor="emerald"
        />
        <StatCard
          title="Awaiting Response"
          value="32"
          subtitle="Invitations shared"
          icon={<Users className="w-5 h-5" />}
          highlightColor="amber"
        />
        <StatCard
          title="Declined"
          value="4"
          subtitle="Cannot attend"
          icon={<UserX className="w-5 h-5" />}
          highlightColor="wine"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add Guest */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Add Guest Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGuest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Guest / Family Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. & Mrs. R. Singhania"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Mobile / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Family Side
                  </label>
                  <select
                    value={guestFamily}
                    onChange={(e) => setGuestFamily(e.target.value as FamilySide)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-sand-border bg-white"
                  >
                    <option value="groom">Groom</option>
                    <option value="bride">Bride</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Group / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Relatives (3)"
                    value={guestGroup}
                    onChange={(e) => setGuestGroup(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-sand-border bg-white"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
                <Plus className="w-3.5 h-3.5" />
                Add to List
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guests Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Guest Directory ({guests.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-sand-50/80 text-[11px] uppercase tracking-wider font-semibold text-charcoal-500 border-b border-sand-border">
                  <tr>
                    <th className="py-3 px-5">Guest Name</th>
                    <th className="py-3 px-4">Side</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Invitation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/70">
                  {guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-sand-50/50">
                      <td className="py-3 px-5">
                        <p className="font-semibold text-charcoal-900">{guest.fullName}</p>
                        <p className="text-xs text-charcoal-500">{guest.groupName || 'Individual'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <FamilyBadge side={guest.familySide} />
                      </td>
                      <td className="py-3 px-4 text-xs text-charcoal-600">
                        {guest.phone || 'No phone'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={guest.invitationStatus === 'shared' ? 'paid' : 'neutral'}>
                          {guest.invitationStatus === 'shared' ? 'Card Shared' : 'Not Sent'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

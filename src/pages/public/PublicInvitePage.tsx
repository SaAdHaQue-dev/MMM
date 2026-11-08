import React, { useState } from 'react';
import { Heart, Calendar, MapPin, Share2, Check, Send } from 'lucide-react';
import { useWedding } from '@/app/context/WeddingContext';
import { formatDate } from '@/lib/utils';

export const PublicInvitePage: React.FC = () => {
  const { wedding, events, invitation } = useWedding();

  const [guestName, setGuestName] = useState('');
  const [status, setStatus] = useState<'attending' | 'not_attending' | 'maybe'>('attending');
  const [attendeeCount, setAttendeeCount] = useState(2);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setSubmitted(true);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `You are cordially invited to celebrate the wedding of ${wedding.brideName} and ${wedding.groomName} at ${wedding.venueName} on ${formatDate(wedding.weddingDate, 'medium')}!\n\nView details & RSVP here: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-charcoal-900 selection:bg-wine-100 selection:text-wine-900 flex flex-col items-center">
      {/* Decorative Top Accent */}
      <div className="w-full h-2 bg-gradient-to-r from-gold-400 via-wine-800 to-gold-400" />

      {/* Main Container */}
      <div className="w-full max-w-2xl px-4 py-8 sm:py-16 space-y-12">
        {/* Sacred Invocation & Header */}
        <div className="text-center space-y-4">
          <p className="font-serif text-sm tracking-[0.3em] uppercase text-gold-700 font-semibold">
            || Shree Ganeshay Namah ||
          </p>
          <div className="w-16 h-0.5 bg-gold-400 mx-auto" />
          <p className="text-xs uppercase tracking-widest text-charcoal-500 font-medium">
            Cordially invite you to the wedding celebration of
          </p>
        </div>

        {/* Hero Couple Card */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-white border border-gold-300 shadow-wedding-lg text-center overflow-hidden">
          {/* Subtle floral/mandala background hint */}
          <div className="absolute inset-0 bg-radial-gradient from-gold-50/50 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-wine-50 border border-wine-200 flex items-center justify-center text-wine-800">
              <Heart className="w-6 h-6 fill-wine-800/20 text-wine-800" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-wine-900 tracking-tight">
                {wedding.brideName}
              </h1>
              <p className="font-serif italic text-xl text-gold-600">&</p>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-wine-900 tracking-tight">
                {wedding.groomName}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-600 font-serif italic max-w-md mx-auto leading-relaxed pt-2">
              "{invitation.content.welcomeMessage}"
            </p>

            {/* Parents Lineage */}
            <div className="pt-4 border-t border-gold-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal-700">
              <div>
                <p className="text-[10px] uppercase font-bold text-gold-700">Bride's Parents</p>
                <p className="font-medium mt-0.5">{invitation.content.brideParents || 'Mr. & Mrs. Sharma'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gold-700">Groom's Parents</p>
                <p className="font-medium mt-0.5">{invitation.content.groomParents || 'Mr. & Mrs. Verma'}</p>
              </div>
            </div>

            {/* Main Date & Venue */}
            <div className="pt-4 border-t border-gold-200/70 space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-50 text-gold-900 border border-gold-300 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-gold-700" />
                <span>{formatDate(wedding.weddingDate, 'long')}</span>
              </div>
              <div className="text-xs text-charcoal-600 space-y-0.5">
                <p className="font-serif font-bold text-sm text-charcoal-900">{wedding.venueName}</p>
                <p className="text-charcoal-500">{wedding.venueAddress}</p>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share on WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Ceremonial Events Schedule */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl font-bold text-wine-900">Celebration Schedule</h2>
            <p className="text-xs text-charcoal-500">Join us for every sacred ritual and celebration</p>
          </div>

          <div className="space-y-4">
            {events.map((evt, idx) => (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-white border border-sand-border hover:border-gold-300 shadow-sm transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-wine-50 text-wine-800">
                    Day {idx + 1} • {evt.eventType.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-gold-700">
                    {formatDate(evt.startTime, 'short')}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal-900">{evt.name}</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">{evt.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-sand-border text-xs text-charcoal-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-wine-800" />
                    {evt.venueName}
                  </span>
                  {wedding.mapUrl && (
                    <a
                      href={wedding.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-wine-800 hover:underline"
                    >
                      View Map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RSVP Form Section */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-gold-300 shadow-wedding-lg space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-gold-700">Kindly RSVP</span>
            <h3 className="font-serif text-2xl font-bold text-wine-900">Will You Bless Us?</h3>
            <p className="text-xs text-charcoal-500">
              Please respond by {invitation.content.rsvpDeadline || 'Nov 20, 2026'} so we can arrange your hospitality.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-emerald-900">Thank You, {guestName}!</h4>
              <p className="text-xs text-emerald-700">
                Your response has been warmly received by both families. We look forward to celebrating together!
              </p>
            </div>
          ) : (
            <form onSubmit={handleRSVPSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Your Full Name / Family Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand & Meera Kapoor"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-2">
                  Will You Attend? *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'attending', label: 'Joyfully Accept' },
                    { key: 'not_attending', label: 'Regretfully Decline' },
                    { key: 'maybe', label: 'Uncertain' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setStatus(opt.key as any)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        status === opt.key
                          ? 'border-wine-800 bg-wine-800 text-white shadow-sm'
                          : 'border-sand-border bg-sand-50/50 text-charcoal-700 hover:bg-sand-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'attending' && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Number of Guests Attending
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Warm Wishes / Message for the Couple
                </label>
                <textarea
                  rows={2}
                  placeholder="Leave a blessing or note..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-wine-800 hover:bg-wine-900 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-wedding flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Confirm RSVP
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-charcoal-400 space-y-1">
          <p>Make My Marriage • Private Wedding Workspace</p>
          <p className="text-[10px]">No boxed gifts please • Your blessings are our greatest treasure</p>
        </div>
      </div>
    </div>
  );
};

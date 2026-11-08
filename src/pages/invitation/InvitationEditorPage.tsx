import React, { useState } from 'react';
import { Sparkles, Eye, Palette, Globe, Check, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useWedding } from '@/app/context/WeddingContext';

export const InvitationEditorPage: React.FC = () => {
  const { wedding, invitation } = useWedding();
  const [selectedTemplate, setSelectedTemplate] = useState(invitation.templateKey);
  const [welcomeMessage, setWelcomeMessage] = useState(invitation.content.welcomeMessage);
  const [brideParents, setBrideParents] = useState(invitation.content.brideParents || '');
  const [groomParents, setGroomParents] = useState(invitation.content.groomParents || '');
  const [rsvpDeadline, setRsvpDeadline] = useState(invitation.content.rsvpDeadline || '2026-11-20');
  const [isPublished, setIsPublished] = useState(invitation.isPublished);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const templates = [
    { key: 'royal_indian', name: 'Royal Indian Palace', desc: 'Regal burgundy and antique gold with Rajasthani motifs' },
    { key: 'traditional_floral', name: 'Traditional Floral', desc: 'Marigold and rose watercolor borders with delicate patterns' },
    { key: 'modern_minimal', name: 'Modern Minimal', desc: 'Clean typography, generous white space, and editorial layout' },
    { key: 'ivory_gold', name: 'Ivory & Gold Elegance', desc: 'Textured warm ivory paper with embossed gold foil details' },
    { key: 'contemporary_romantic', name: 'Contemporary Romantic', desc: 'Soft blush tones, arch frames, and couple photography' },
  ];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const invitePublicUrl = `${window.location.origin}/invite/${invitation.slug}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-wine-900">Digital Invitation Studio</h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Design an elegant, mobile-friendly invitation card. Share via WhatsApp or SMS and collect RSVPs directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href={`/invite/${invitation.slug}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 text-charcoal-600" />
              Preview Live Card
            </Button>
          </a>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
            {savedSuccess ? 'Changes Saved' : 'Save Invitation'}
          </Button>
        </div>
      </div>

      {/* Public Link Bar */}
      <Card className="bg-gradient-to-r from-wine-50 to-gold-50 border-gold-300">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl border border-gold-300 text-wine-800">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-wine-900">Your Public Invitation Link</p>
              <p className="text-xs text-charcoal-600 font-mono">{invitePublicUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPublished ? 'paid' : 'neutral'}>
              {isPublished ? 'Published & Live' : 'Draft'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPublished(!isPublished)}
              className="text-xs"
            >
              {isPublished ? 'Unpublish' : 'Publish Card'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-wine-800" />
                Select Design Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.key}
                  onClick={() => setSelectedTemplate(tmpl.key as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTemplate === tmpl.key
                      ? 'border-wine-800 bg-wine-50/50 ring-2 ring-wine-800/20'
                      : 'border-sand-border hover:border-gold-300 bg-white'
                  }`}
                >
                  <h4 className="font-serif font-bold text-sm text-charcoal-900">{tmpl.name}</h4>
                  <p className="text-xs text-charcoal-500 mt-1">{tmpl.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Invitation Content Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invitation Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Welcome Invitation Text
                </label>
                <textarea
                  rows={3}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Bride's Parents
                  </label>
                  <input
                    type="text"
                    value={brideParents}
                    onChange={(e) => setBrideParents(e.target.value)}
                    placeholder="Mr. & Mrs. R.K. Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Groom's Parents
                  </label>
                  <input
                    type="text"
                    value={groomParents}
                    onChange={(e) => setGroomParents(e.target.value)}
                    placeholder="Mr. & Mrs. O.P. Verma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  RSVP Deadline Date
                </label>
                <input
                  type="date"
                  value={rsvpDeadline}
                  onChange={(e) => setRsvpDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Miniature Card Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-gold-300 shadow-wedding-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-b from-[#FDFBF7] to-[#FAF7F2] text-center border-b border-sand-border">
              <span className="text-[10px] tracking-[0.25em] font-serif uppercase text-gold-700">
                || Shubh Vivaah ||
              </span>
              <h3 className="font-serif text-2xl font-bold text-wine-900 mt-3">
                {wedding.brideName} & {wedding.groomName}
              </h3>
              <p className="text-[11px] text-charcoal-600 mt-2 px-2 leading-relaxed italic font-serif">
                "{welcomeMessage}"
              </p>
              <div className="mt-4 pt-4 border-t border-gold-200/60 text-xs text-charcoal-700 space-y-1">
                <p className="font-bold text-wine-900">{wedding.venueName}</p>
                <p className="text-charcoal-500">{wedding.weddingDate}</p>
              </div>
            </div>
            <div className="p-4 bg-white flex justify-center">
              <a
                href={`/invite/${invitation.slug}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-bold text-wine-900 bg-sand-100 hover:bg-sand-200 rounded-xl transition-all"
              >
                <span>Open Full Mobile View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

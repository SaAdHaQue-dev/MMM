import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, Wallet, Users2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWedding } from '@/app/context/WeddingContext';
import { useAuth } from '@/app/context/AuthContext';
import { FamilySide } from '@/types';

export const SetupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const { updateWedding } = useWedding();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Wizard fields
  const [brideName, setBrideName] = useState('Priya Sharma');
  const [groomName, setGroomName] = useState('Rahul Verma');
  const [weddingDate, setWeddingDate] = useState('2026-12-12');
  const [venueName, setVenueName] = useState('The Leela Palace');
  const [venueAddress, setVenueAddress] = useState('Lake Pichola, Udaipur, Rajasthan');
  const [totalBudget, setTotalBudget] = useState('2000000');
  const [familySide, setFamilySide] = useState<FamilySide>('groom');

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    updateWedding({
      brideName,
      groomName,
      weddingDate,
      venueName,
      venueAddress,
      totalBudget: parseFloat(totalBudget) || 2000000,
    });
    await login('admin@wedding.com', 'wedding_admin', familySide);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Step indicator */}
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest font-bold text-gold-700">Setup Wizard</p>
          <h1 className="font-serif text-3xl font-bold text-wine-900">Configure Your Wedding Workspace</h1>
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-wine-800' : i < step ? 'w-4 bg-gold-500' : 'w-4 bg-sand-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-sand-border shadow-wedding-lg">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-sand-border">
                <div className="p-2 rounded-xl bg-wine-50 text-wine-800 border border-wine-100">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900">Step 1: Couple Details</h3>
                  <p className="text-xs text-charcoal-500">Who is celebrating this royal bond?</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Bride's Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Groom's Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="primary" onClick={() => setStep(2)}>
                  <span>Next: Wedding Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-sand-border">
                <div className="p-2 rounded-xl bg-gold-50 text-gold-700 border border-gold-200">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900">Step 2: Date & Destination</h3>
                  <p className="text-xs text-charcoal-500">When and where will the wedding take place?</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Primary Wedding Ceremony Date *
                </label>
                <input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Primary Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. The Leela Palace, Udaipur"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Venue Address / City
                </label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="Lake Pichola, Udaipur, Rajasthan"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button variant="primary" onClick={() => setStep(3)}>
                  <span>Next: Budget Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-sand-border">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900">Step 3: Total Budget Target</h3>
                  <p className="text-xs text-charcoal-500">Plan your overall financial envelope</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Combined Total Budget (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="2000000"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                />
                <p className="text-[11px] text-charcoal-500 mt-1">
                  Example: ₹20,00,000 for total estimated catering, venue, jewellery, gifts, and ceremonies.
                </p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button variant="primary" onClick={() => setStep(4)}>
                  <span>Next: Family Side</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-sand-border">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900">Step 4: Creator Family Alignment</h3>
                  <p className="text-xs text-charcoal-500">Which family side are you representing?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => setFamilySide('groom')}
                  className={`p-4 rounded-2xl border cursor-pointer text-center space-y-1 transition-all ${
                    familySide === 'groom'
                      ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-500/30'
                      : 'border-sand-border hover:border-sand-400 bg-white'
                  }`}
                >
                  <p className="font-serif font-bold text-sm text-sky-900">Groom's Family</p>
                  <p className="text-[11px] text-charcoal-500">Verma Family</p>
                </div>

                <div
                  onClick={() => setFamilySide('bride')}
                  className={`p-4 rounded-2xl border cursor-pointer text-center space-y-1 transition-all ${
                    familySide === 'bride'
                      ? 'border-pink-600 bg-pink-50/60 ring-2 ring-pink-500/30'
                      : 'border-sand-border hover:border-sand-400 bg-white'
                  }`}
                >
                  <p className="font-serif font-bold text-sm text-pink-900">Bride's Family</p>
                  <p className="text-[11px] text-charcoal-500">Sharma Family</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button variant="primary" onClick={handleFinish}>
                  <Check className="w-4 h-4" />
                  <span>Launch Workspace</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

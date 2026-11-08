import React from 'react';
import { Shield, Phone, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/app/context/AuthContext';
import { FamilyBadge } from '@/components/ui/Badge';

export const ProfilePage: React.FC = () => {
  const { user, role, familySide } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-serif font-bold text-wine-900">Your Account Profile</h2>
        <p className="text-xs text-charcoal-500 mt-1">
          Personal credentials, workspace role, and assigned family alignment.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-wine-800 to-wine-900 text-white font-serif font-bold text-xl flex items-center justify-center shadow-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <CardTitle>{user?.fullName}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <FamilyBadge side={familySide} />
              <span className="text-xs text-charcoal-500 capitalize">Role: {role.replace('_', ' ')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-sand-50 border border-sand-border space-y-1">
              <span className="text-charcoal-500 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-wine-800" />
                Email Address
              </span>
              <p className="font-semibold text-charcoal-900">arjun.verma@example.com</p>
            </div>
            <div className="p-3 rounded-xl bg-sand-50 border border-sand-border space-y-1">
              <span className="text-charcoal-500 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-gold-600" />
                Phone Number
              </span>
              <p className="font-semibold text-charcoal-900">+91 98765 43210</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-wine-50/60 border border-wine-100 flex items-start gap-3">
            <Shield className="w-4 h-4 text-wine-800 shrink-0 mt-0.5" />
            <div className="text-xs text-wine-900 space-y-0.5">
              <p className="font-bold">Role: Wedding Administrator</p>
              <p className="text-wine-800/80">
                You have full administrative privileges over budget, expenses, digital invitation publishing, and workspace memberships.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

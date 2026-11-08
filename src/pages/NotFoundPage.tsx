import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-wine-50 text-wine-800 flex items-center justify-center border border-wine-200 mb-4 shadow-wedding">
        <HeartCrack className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wine-900">Page Not Found</h1>
      <p className="text-sm text-charcoal-500 max-w-sm mt-2 mb-6">
        The wedding ceremony page or invitation link you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

import React from 'react';
import { Loader2 } from 'lucide-react';
import { ClayCard } from './ClayCard';

export const LoadingState = ({ message = "Loading RetailIQ customer data..." }) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <ClayCard className="max-w-md w-full text-center py-10 px-8 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl clay-inset flex items-center justify-center text-accent mb-4 animate-pulse">
          <Loader2 size={28} className="animate-spin text-accent" />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">
          Accessing Analytics Pipeline
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {message}
        </p>
      </ClayCard>
    </div>
  );
};

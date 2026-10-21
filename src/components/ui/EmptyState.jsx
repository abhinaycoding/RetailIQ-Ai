import React from 'react';
import { SearchX } from 'lucide-react';
import { ClayCard } from './ClayCard';

export const EmptyState = ({
  title = "No Matching Records",
  description = "No customers match the current filter or search criteria.",
  onReset
}) => {
  return (
    <ClayCard className="py-12 px-6 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl clay-inset flex items-center justify-center text-text-muted mb-3">
        <SearchX size={24} />
      </div>
      <h4 className="text-sm font-semibold text-text-primary mb-1">
        {title}
      </h4>
      <p className="text-xs text-text-secondary max-w-sm mb-4">
        {description}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="clay-button px-4 py-1.5 text-xs font-semibold"
        >
          Reset Filters
        </button>
      )}
    </ClayCard>
  );
};

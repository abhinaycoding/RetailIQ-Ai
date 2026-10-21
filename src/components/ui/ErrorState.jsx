import React from 'react';
import { AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { ClayCard } from './ClayCard';

export const ErrorState = ({
  title = "Dataset Loading Error",
  message = "Unable to load the required CSV dataset files.",
  onRetry
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <ClayCard className="max-w-xl w-full py-8 px-6 sm:px-8 border-rose-200/80">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl clay-inset flex items-center justify-center text-status-danger shrink-0">
            <AlertCircle size={26} strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
              {message}
            </p>

            <div className="clay-inset p-3.5 mb-5 text-xs text-text-secondary space-y-1.5 font-mono">
              <div className="font-semibold text-text-primary font-sans mb-1 flex items-center gap-1.5">
                <FileText size={14} className="text-accent" />
                Required data exports in <code>public/data/</code>:
              </div>
              <div>• <code>retailiq_customers.csv</code> (Customer RFM records & clusters)</div>
              <div>• <code>retailiq_segments.csv</code> (Cluster medians and spending)</div>
              <div>• <code>retailiq_model_comparison.csv</code> (4 model benchmarking scores)</div>
            </div>

            {onRetry && (
              <button
                onClick={onRetry}
                className="clay-button-primary px-4 py-2 text-xs font-semibold"
              >
                <RefreshCw size={14} />
                Retry Data Loading
              </button>
            )}
          </div>
        </div>
      </ClayCard>
    </div>
  );
};

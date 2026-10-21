import React from 'react';

/**
 * SectionHeader - Standard header for cards and analytical modules
 */
export const SectionHeader = ({
  title,
  subtitle,
  badge,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="clay-badge bg-surface-secondary text-accent font-semibold text-[11px]">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};

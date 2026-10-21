import React from 'react';

export const MetricCard = ({
  title,
  value,
  caption,
  icon: Icon,
  badge,
  badgeType = 'neutral', // 'positive' | 'neutral' | 'warning'
  className = ''
}) => {
  const badgeClasses = {
    positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    brand: 'bg-blue-50 text-blue-700 border border-blue-200',
  }[badgeType] || 'bg-slate-100 text-slate-700 border border-slate-200';

  return (
    <div className={`bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600">
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-numbers">
          {value}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{caption}</span>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

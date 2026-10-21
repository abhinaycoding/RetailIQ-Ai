import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { MISSING_VALUES_ANALYSIS } from '../../data/edaMetadata';
import { formatNumber } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="clay-card-sm p-3 bg-white/95 backdrop-blur-sm text-xs border border-white shadow-xl">
        <div className="font-bold text-text-primary mb-1">{data.column}</div>
        <div className="text-text-secondary space-y-0.5">
          <div>Missing Records: <strong className="text-text-primary tabular-numbers">{formatNumber(data.missing)}</strong></div>
          <div>Missing Percentage: <strong className="text-status-danger tabular-numbers">{data.pct}%</strong></div>
          <div className="text-[11px] text-text-muted mt-1">{data.status}</div>
        </div>
      </div>
    );
  }
  return null;
};

export const MissingValuesChart = () => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={MISSING_VALUES_ANALYSIS}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#DCE2EC" />
          <XAxis
            type="number"
            domain={[0, 30]}
            unit="%"
            tick={{ fill: '#6F7A90', fontSize: 11 }}
            axisLine={{ stroke: '#DCE2EC' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="column"
            tick={{ fill: '#20283A', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
            {MISSING_VALUES_ANALYSIS.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pct > 5 ? '#D85E69' : entry.pct > 0 ? '#D99742' : '#27876D'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

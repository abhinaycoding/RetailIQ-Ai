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
import { formatCurrency, formatCompactCurrency, formatPercent } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="clay-card-sm p-3 bg-white/95 backdrop-blur-sm text-xs border border-white shadow-lg">
        <div className="font-bold text-text-primary mb-1 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name}
        </div>
        <div className="text-text-secondary space-y-0.5">
          <div>Total Spending: <strong className="text-text-primary tabular-numbers">{formatCurrency(data.totalSpending)}</strong></div>
          <div>Revenue Share: <strong className="text-text-primary tabular-numbers">{formatPercent(data.pctOfRevenue)}</strong></div>
          <div>Median Spending: <strong className="text-text-primary tabular-numbers">{formatCurrency(data.medianSpending)}</strong></div>
        </div>
      </div>
    );
  }
  return null;
};

export const SpendingChart = ({ segments = [] }) => {
  const chartData = segments.map(s => ({
    name: s.name,
    shortName: s.shortName,
    totalSpending: s.totalSpending,
    medianSpending: s.medianSpending,
    pctOfRevenue: s.pctOfRevenue,
    color: s.color
  }));

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE2EC" />
          <XAxis
            dataKey="shortName"
            tick={{ fill: '#6F7A90', fontSize: 11 }}
            axisLine={{ stroke: '#DCE2EC' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCompactCurrency}
            tick={{ fill: '#6F7A90', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalSpending" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

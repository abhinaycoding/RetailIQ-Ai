import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { formatNumber, formatPercent } from '../../utils/formatters';

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
          <div>Customers: <strong className="text-text-primary tabular-numbers">{formatNumber(data.customerCount)}</strong></div>
          <div>Share: <strong className="text-text-primary tabular-numbers">{formatPercent(data.pctOfCustomers)}</strong></div>
          <div>Median Recency: <strong className="text-text-primary tabular-numbers">{data.medianRecency}d</strong></div>
        </div>
      </div>
    );
  }
  return null;
};

export const SegmentDistributionChart = ({ segments = [] }) => {
  const chartData = segments.map(s => ({
    name: s.name,
    shortName: s.shortName,
    value: s.customerCount,
    customerCount: s.customerCount,
    pctOfCustomers: s.pctOfCustomers,
    medianRecency: s.medianRecency,
    color: s.color
  }));

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#F5F7FB" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-text-secondary font-medium mr-2">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

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
import { COUNTRY_REVENUE_DISTRIBUTION } from '../../data/edaMetadata';
import { formatCompactCurrency, formatCurrency, formatPercent } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="clay-card-sm p-3 bg-white/95 backdrop-blur-sm text-xs border border-white shadow-xl min-w-[180px]">
        <div className="font-bold text-text-primary mb-1">{data.country}</div>
        <div className="text-text-secondary space-y-0.5">
          <div>Revenue: <strong className="text-text-primary tabular-numbers">{formatCurrency(data.revenue)}</strong></div>
          <div>Share of Total: <strong className="text-accent tabular-numbers">{formatPercent(data.pct)}</strong></div>
          <div>Customers: <strong className="text-text-primary tabular-numbers">{data.customers}</strong></div>
        </div>
      </div>
    );
  }
  return null;
};

export const CountryRevenueChart = () => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={COUNTRY_REVENUE_DISTRIBUTION}
          margin={{ top: 10, right: 15, left: 15, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE2EC" />
          <XAxis
            dataKey="country"
            angle={-30}
            textAnchor="end"
            interval={0}
            tick={{ fill: '#6F7A90', fontSize: 10 }}
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
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {COUNTRY_REVENUE_DISTRIBUTION.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.country === 'United Kingdom' ? '#526DDB' : '#7B8FF0'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

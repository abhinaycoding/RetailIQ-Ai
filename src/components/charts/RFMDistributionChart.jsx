import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatNumber } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, labelPrefix }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="clay-card-sm p-3 bg-white/95 backdrop-blur-sm text-xs border border-white shadow-xl">
        <div className="font-bold text-text-primary mb-1">Range: {data.bin}</div>
        <div className="text-text-secondary">
          Customers: <strong className="text-text-primary tabular-numbers">{formatNumber(data.count)}</strong>
        </div>
      </div>
    );
  }
  return null;
};

export const RFMDistributionChart = ({ distributions }) => {
  const [activeDimension, setActiveDimension] = useState('recency');

  if (!distributions) return null;

  const config = {
    recency: {
      data: distributions.recency,
      title: 'Recency Distribution (Days since purchase)',
      color: '#526DDB',
      unit: 'd'
    },
    frequency: {
      data: distributions.frequency,
      title: 'Frequency Distribution (Invoice count)',
      color: '#27876D',
      unit: ' orders'
    },
    monetary: {
      data: distributions.monetary,
      title: 'Monetary Value Distribution (Total spend in £)',
      color: '#7B8FF0',
      unit: ''
    }
  }[activeDimension];

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        {['recency', 'frequency', 'monetary'].map((dim) => (
          <button
            key={dim}
            onClick={() => setActiveDimension(dim)}
            className={`px-3 py-1.5 rounded-xl text-xs capitalize transition-all ${
              activeDimension === dim
                ? 'clay-nav-active font-semibold'
                : 'clay-button text-text-secondary'
            }`}
          >
            {dim}
          </button>
        ))}
      </div>

      <div className="w-full h-60 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={config.data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE2EC" />
            <XAxis
              dataKey="bin"
              tick={{ fill: '#6F7A90', fontSize: 10 }}
              axisLine={{ stroke: '#DCE2EC' }}
              tickLine={false}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={{ fill: '#6F7A90', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip labelPrefix={config.unit} />} />
            <Bar dataKey="count" fill={config.color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

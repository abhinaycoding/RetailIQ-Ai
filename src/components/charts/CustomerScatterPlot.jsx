import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="clay-card-sm p-3 bg-white/95 backdrop-blur-sm text-xs border border-white shadow-xl min-w-[180px]">
        <div className="font-bold text-text-primary mb-1 flex items-center justify-between">
          <span className="font-mono text-xs">Customer #{data.id}</span>
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.clusterColor }}
          />
        </div>
        <div className="text-[11px] font-semibold text-accent mb-1.5">
          {data.clusterName}
        </div>
        <div className="space-y-1 text-text-secondary border-t border-slate-100 pt-1.5">
          <div className="flex justify-between">
            <span>Recency:</span>
            <strong className="text-text-primary tabular-numbers">{data.recency} days</strong>
          </div>
          <div className="flex justify-between">
            <span>Frequency:</span>
            <strong className="text-text-primary tabular-numbers">{data.frequency} invoices</strong>
          </div>
          <div className="flex justify-between">
            <span>Monetary:</span>
            <strong className="text-text-primary tabular-numbers">{formatCurrency(data.monetary)}</strong>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CustomerScatterPlot = ({
  customers = [],
  selectedCluster = 'all',
  maxPoints = 800
}) => {
  const [useLogScale, setUseLogScale] = useState(true);

  // Filter and stratify points for smooth 60fps rendering
  const processedData = useMemo(() => {
    let filtered = customers;
    if (selectedCluster !== 'all') {
      const clusterNum = Number(selectedCluster);
      filtered = customers.filter(c => c.cluster === clusterNum);
    }

    // Stratified subsample to maintain segment balance without freezing DOM
    if (filtered.length > maxPoints) {
      const step = Math.ceil(filtered.length / maxPoints);
      return filtered.filter((_, idx) => idx % step === 0);
    }
    return filtered;
  }, [customers, selectedCluster, maxPoints]);

  // Separate data by cluster for Recharts scatter layers
  const cluster0Data = useMemo(() => processedData.filter(d => d.cluster === 0), [processedData]);
  const cluster1Data = useMemo(() => processedData.filter(d => d.cluster === 1), [processedData]);
  const cluster2Data = useMemo(() => processedData.filter(d => d.cluster === 2), [processedData]);

  return (
    <div className="w-full flex flex-col">
      {/* Controls header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="text-xs text-text-secondary">
          Displaying <strong className="text-text-primary tabular-numbers">{processedData.length}</strong> representative customer points
          {selectedCluster !== 'all' ? ` in Cluster ${selectedCluster}` : ' across all segments'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-secondary font-medium">Spending Axis:</span>
          <button
            onClick={() => setUseLogScale(!useLogScale)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
              useLogScale ? 'clay-nav-active font-semibold' : 'clay-button text-text-secondary'
            }`}
          >
            {useLogScale ? 'Log10 Scale (£)' : 'Linear Scale (£)'}
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DCE2EC" />
            <XAxis
              type="number"
              dataKey="recency"
              name="Recency"
              unit="d"
              tick={{ fill: '#6F7A90', fontSize: 11 }}
              axisLine={{ stroke: '#DCE2EC' }}
              tickLine={false}
              label={{
                value: 'Recency (Days since last purchase)',
                position: 'bottom',
                offset: 12,
                fill: '#6F7A90',
                fontSize: 11
              }}
            />
            <YAxis
              type="number"
              dataKey={useLogScale ? 'logMonetary' : 'monetary'}
              name="Monetary"
              tick={{ fill: '#6F7A90', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => {
                if (useLogScale) {
                  const actual = Math.pow(10, val);
                  return actual >= 1000 ? `£${(actual / 1000).toFixed(0)}k` : `£${actual.toFixed(0)}`;
                }
                return val >= 1000 ? `£${(val / 1000).toFixed(0)}k` : `£${val.toFixed(0)}`;
              }}
              label={{
                value: useLogScale ? 'Spending (Log10 £)' : 'Spending (Linear £)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#6F7A90',
                fontSize: 11
              }}
            />
            <ZAxis range={[25, 25]} />
            <Tooltip content={<CustomScatterTooltip />} />
            
            {/* Cluster 0 (High-Value) */}
            <Scatter
              name="High-Value Recent (C0)"
              data={cluster0Data}
              fill="#526DDB"
              fillOpacity={0.7}
            />
            {/* Cluster 1 (At-Risk) */}
            <Scatter
              name="Inactive / At-Risk (C1)"
              data={cluster1Data}
              fill="#D85E69"
              fillOpacity={0.7}
            />
            {/* Cluster 2 (Occasional) */}
            <Scatter
              name="Occasional (C2)"
              data={cluster2Data}
              fill="#27876D"
              fillOpacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Analytical Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-2 border-t border-slate-200/60 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#526DDB]" />
          <span>Cluster 0: High-Value (Low Recency, High Monetary)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#D85E69]" />
          <span>Cluster 1: At-Risk (High Recency, Low Monetary)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#27876D]" />
          <span>Cluster 2: Occasional (Moderate Recency & Spending)</span>
        </div>
      </div>
    </div>
  );
};

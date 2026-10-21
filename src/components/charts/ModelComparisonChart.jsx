import React, { useState } from 'react';
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

const METRIC_CONFIGS = {
  silhouette: {
    label: 'Silhouette Score',
    key: 'silhouette',
    direction: 'Higher is Better (Max: 1.0)',
    higherIsBetter: true,
    formatter: (v) => v.toFixed(4),
    description: 'Measures how similar an object is to its own cluster compared to other clusters.'
  },
  daviesBouldin: {
    label: 'Davies–Bouldin Index',
    key: 'daviesBouldin',
    direction: 'Lower is Better (Min: 0.0)',
    higherIsBetter: false,
    formatter: (v) => v.toFixed(4),
    description: 'Validates cluster separation and compactness. Lower scores indicate tighter, better-separated clusters.'
  },
  calinskiHarabasz: {
    label: 'Calinski–Harabasz Score',
    key: 'calinskiHarabasz',
    direction: 'Higher is Better',
    higherIsBetter: true,
    formatter: (v) => v.toFixed(1),
    description: 'Ratio of between-cluster variance to within-cluster dispersion.'
  },
  runtime: {
    label: 'Execution Runtime',
    key: 'runtime',
    direction: 'Lower is Faster (Seconds)',
    higherIsBetter: false,
    formatter: (v) => `${v.toFixed(3)}s`,
    description: 'Elapsed wall-clock execution time during the Colab benchmark run.'
  }
};

const CustomTooltip = ({ active, payload, activeMetricConfig }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const val = data[activeMetricConfig.key];
    return (
      <div className="clay-card-sm p-3 bg-white/95 backdrop-blur-sm text-xs border border-white shadow-xl min-w-[200px]">
        <div className="font-bold text-text-primary mb-1 flex items-center justify-between">
          <span>{data.modelName}</span>
          {data.isBest && (
            <span className="text-[10px] bg-indigo-100 text-accent font-bold px-1.5 py-0.5 rounded">
              Selected
            </span>
          )}
        </div>
        <div className="text-text-secondary space-y-1 pt-1 border-t border-slate-100">
          <div className="flex justify-between">
            <span>{activeMetricConfig.label}:</span>
            <strong className="text-text-primary tabular-numbers">
              {activeMetricConfig.formatter(val)}
            </strong>
          </div>
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>Clusters Discovered:</span>
            <span>{data.clusters}</span>
          </div>
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>Noise Ratio:</span>
            <span>{data.noisePct}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ModelComparisonChart = ({ models = [] }) => {
  const [activeMetric, setActiveMetric] = useState('silhouette');
  const metricConfig = METRIC_CONFIGS[activeMetric];

  return (
    <div className="w-full flex flex-col">
      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(METRIC_CONFIGS).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                activeMetric === key
                  ? 'clay-nav-active font-semibold'
                  : 'clay-button text-text-secondary'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-lg clay-inset-sm text-text-secondary flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span>{metricConfig.direction}</span>
        </div>
      </div>

      {/* Description of active metric */}
      <p className="text-xs text-text-secondary mb-3">
        {metricConfig.description}
      </p>

      {/* Bar Chart Container */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={models} margin={{ top: 15, right: 15, left: 15, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE2EC" />
            <XAxis
              dataKey="modelName"
              tick={{ fill: '#6F7A90', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: '#DCE2EC' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => {
                if (activeMetric === 'calinskiHarabasz') return v >= 1000 ? `${(v/1000).toFixed(1)}k` : v;
                return metricConfig.formatter(v);
              }}
              tick={{ fill: '#6F7A90', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip activeMetricConfig={metricConfig} />} />
            <Bar dataKey={metricConfig.key} radius={[8, 8, 0, 0]}>
              {models.map((entry, index) => {
                const isSelected = entry.modelName === 'K-Means';
                return (
                  <Cell
                    key={`bar-${index}`}
                    fill={isSelected ? '#526DDB' : '#8B97AC'}
                    fillOpacity={isSelected ? 1 : 0.75}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[11px] text-text-muted flex items-center justify-between border-t border-slate-200/60 pt-2">
        <span>* K-Means highlighted in blue as the selected model configuration.</span>
        <span>DBSCAN evaluated on non-noise core points (2.19% noise excluded).</span>
      </div>
    </div>
  );
};

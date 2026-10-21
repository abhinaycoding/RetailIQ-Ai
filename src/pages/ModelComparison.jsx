import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Cpu,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  BarChart,
  HelpCircle,
  AlertCircle,
  FileCheck2,
  Scale
} from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MetricCard } from '../components/ui/MetricCard';
import { ModelComparisonChart } from '../components/charts/ModelComparisonChart';

const MODEL_METHODOLOGY = [
  {
    name: 'K-Means',
    type: 'Centroid-Based Partitioning',
    verdict: 'Selected Champion Model',
    verdictColor: 'text-accent bg-indigo-50 border-indigo-200',
    mechanism: 'Iteratively assigns points to the nearest cluster centroid (minimizing within-cluster sum of squares) and recomputes means until convergence.',
    strengths: 'Fast convergence (0.23s), clean spherical cluster boundaries, highest Silhouette (0.4157), and lowest Davies–Bouldin (0.8250).',
    limitations: 'Assumes spherical cluster shapes and requires pre-specifying k in advance.',
    complexity: 'O(t · k · n · d)'
  },
  {
    name: 'Agglomerative Clustering',
    type: 'Hierarchical (Ward Linkage)',
    verdict: 'Competitive Benchmark',
    verdictColor: 'text-status-success bg-emerald-50 border-emerald-200',
    mechanism: 'Bottom-up hierarchical merging where each customer starts as an individual singleton cluster and pairs are iteratively merged using Ward variance minimization.',
    strengths: 'Produces an interpretable dendrogram tree structure. Achieves 0.4013 Silhouette score, nearly matching K-Means.',
    limitations: 'Substantially slower runtime (1.6457s, ~7.1× slower than K-Means). O(n²) memory complexity does not scale efficiently to large transactional datasets.',
    complexity: 'O(n² log n)'
  },
  {
    name: 'Gaussian Mixture Model (GMM)',
    type: 'Probabilistic / Soft Clustering',
    verdict: 'Suboptimal for RFM',
    verdictColor: 'text-status-warning bg-amber-50 border-amber-200',
    mechanism: 'Assumes data points are generated from a mixture of k Gaussian distributions with parameterized mean vectors and covariance matrices (fitted via Expectation-Maximization).',
    strengths: 'Provides soft probabilistic cluster membership probabilities rather than hard binary assignments.',
    limitations: 'Scored substantially lower in Silhouette (0.1904) and highest in Davies–Bouldin (1.5778) due to overlapping elliptical Gaussian components in log-scaled space.',
    complexity: 'O(t · k · n · d²)'
  },
  {
    name: 'DBSCAN',
    type: 'Density-Based Spatial Clustering',
    verdict: 'Identified 2 Clusters + Noise',
    verdictColor: 'text-text-secondary bg-slate-100 border-slate-300',
    mechanism: 'Groups together points that are closely packed together (core samples with min_samples in eps neighborhood) and marks points in low-density regions as outliers (-1).',
    strengths: 'Automatically discovers non-spherical shapes without requiring pre-defined k, and successfully isolates 2.19% transactional anomalies.',
    limitations: 'Discovered only 2 primary clusters under optimal eps tuning. Internal validation metrics exclude noise points, requiring careful interpretation.',
    complexity: 'O(n log n)'
  }
];

export const ModelComparison = () => {
  const { models } = useOutletContext();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Benchmark Header Banner */}
      <ClayCard className="border border-white p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="clay-badge bg-indigo-50 text-accent border border-indigo-200">
              Unsupervised Algorithm Benchmark
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Comparative Evaluation of 4 Clustering Paradigms
            </h2>
            <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
              Empirical experiment conducted in Google Colab evaluating Centroid-Based, Hierarchical, Probabilistic, and Density-Based algorithms on log-scaled and standardized RFM customer data.
            </p>
          </div>

          <div className="clay-inset p-3 rounded-xl text-xs flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg clay-inset-sm flex items-center justify-center text-accent">
              <Award size={18} />
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Selected Model</span>
              <span className="text-sm font-bold text-text-primary">K-Means (k = 3)</span>
              <span className="text-[10px] text-status-success block">Silhouette: 0.4157</span>
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Top Benchmark KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Optimal Silhouette Score"
          value="0.4157"
          caption="K-Means (Higher is better)"
          icon={Award}
          accentColor="#526DDB"
          tag="Rank 1"
        />
        <MetricCard
          title="Best Davies–Bouldin Index"
          value="0.8250"
          caption="K-Means (Lower is better)"
          icon={Scale}
          accentColor="#27876D"
          tag="Min Distance"
        />
        <MetricCard
          title="Fastest Scalable Runtime"
          value="0.1413s"
          caption="DBSCAN (0.2303s K-Means)"
          icon={Clock}
          accentColor="#7B8FF0"
          tag="Wall-clock"
        />
        <MetricCard
          title="DBSCAN Noise Identified"
          value="2.19%"
          caption="95 anomalous customer vectors"
          icon={AlertCircle}
          accentColor="#D99742"
          tag="Outliers"
        />
      </div>

      {/* Interactive Model Comparison Chart with multi-metric toggle */}
      <ClayCard>
        <SectionHeader
          title="Empirical Metric Comparison"
          subtitle="Toggle between Silhouette Score, Davies–Bouldin Index, Calinski–Harabasz Criterion, and Execution Runtime."
          badge="Measured Benchmarks"
        />
        <ModelComparisonChart models={models} />
      </ClayCard>

      {/* Detailed Benchmark Summary Table */}
      <ClayCard className="p-0 overflow-hidden border border-white/80">
        <div className="p-4 sm:p-5 border-b border-[#d8dde7]">
          <h3 className="text-sm font-bold text-text-primary">
            Experiment Benchmark Leaderboard
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Exact exported scores recorded from the Google Colab experimental environment.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-secondary/80 text-text-secondary border-b border-[#d8dde7]">
                <th className="py-3 px-4 font-semibold">Algorithm Model</th>
                <th className="py-3 px-4 font-semibold text-center">Clusters (k)</th>
                <th className="py-3 px-4 font-semibold text-center">Noise %</th>
                <th className="py-3 px-4 font-semibold text-right">Runtime (s)</th>
                <th className="py-3 px-4 font-semibold text-right">Silhouette ↑</th>
                <th className="py-3 px-4 font-semibold text-right">Davies–Bouldin ↓</th>
                <th className="py-3 px-4 font-semibold text-right">Calinski–Harabasz ↑</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6ebf3]">
              {models.map((m) => {
                const isSelected = m.modelName === 'K-Means';
                return (
                  <tr
                    key={m.modelName}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-50/50 font-medium' : 'hover:bg-white/60'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-accent' : 'bg-text-muted'}`} />
                        <span className="font-bold text-text-primary text-sm">{m.modelName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center tabular-numbers">
                      {m.clusters}
                    </td>
                    <td className="py-3 px-4 text-center tabular-numbers">
                      {m.noisePct > 0 ? (
                        <span className="text-status-warning font-semibold">{m.noisePct.toFixed(2)}%</span>
                      ) : (
                        <span className="text-text-muted">0.00%</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-numbers font-mono text-text-secondary">
                      {m.runtime.toFixed(4)}s
                    </td>
                    <td className="py-3 px-4 text-right tabular-numbers font-mono font-bold text-accent">
                      {m.silhouette.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-numbers font-mono font-semibold text-status-success">
                      {m.daviesBouldin.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-numbers font-mono text-text-primary">
                      {m.calinskiHarabasz.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isSelected ? (
                        <span className="clay-badge bg-indigo-100 text-accent border border-indigo-200">
                          Selected Model
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-muted">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-surface-secondary/40 text-[11px] text-text-muted border-t border-[#d8dde7] space-y-1">
          <div>• <strong>Metric Directions:</strong> Silhouette: higher is better | Davies–Bouldin: lower is better | Calinski–Harabasz: higher is better | Runtime: lower is faster.</div>
          <div>• <strong>DBSCAN Note:</strong> Internal metrics were calculated on core non-noise points after excluding the 2.19% noise partition.</div>
        </div>
      </ClayCard>

      {/* 4 Algorithmic Methodology & Viva Defense Cards */}
      <div>
        <SectionHeader
          title="Methodology Evaluation & Algorithmic Defense"
          subtitle="Detailed technical analysis of algorithmic mechanisms, empirical strengths, and practical limitations."
          badge="Viva Reference"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODEL_METHODOLOGY.map((mod) => (
            <ClayCard key={mod.name} className="flex flex-col justify-between border border-white/80">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      {mod.type}
                    </span>
                    <h3 className="text-base font-bold text-text-primary">
                      {mod.name}
                    </h3>
                  </div>
                  <span className={`clay-badge border ${mod.verdictColor} text-[11px]`}>
                    {mod.verdict}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-text-secondary mt-3">
                  <div>
                    <strong className="text-text-primary block mb-0.5">Mechanism:</strong>
                    {mod.mechanism}
                  </div>
                  <div>
                    <strong className="text-status-success block mb-0.5">Empirical Findings:</strong>
                    {mod.strengths}
                  </div>
                  <div>
                    <strong className="text-status-danger block mb-0.5">Observed Trade-off:</strong>
                    {mod.limitations}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-text-muted">
                <span>Algorithmic Complexity:</span>
                <code className="clay-inset px-2 py-0.5 text-text-primary">{mod.complexity}</code>
              </div>
            </ClayCard>
          ))}
        </div>
      </div>

      {/* Model Selection Defense Note */}
      <ClayCard className="bg-[#FAFBFD] border-l-4 border-l-accent p-5">
        <h3 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <Award size={16} className="text-accent" />
          Technical Defense of Model Selection (Viva Discussion)
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          K-Means was selected as the operational clustering model for RetailIQ based on superior empirical performance: it attained the highest Silhouette score (0.4157), the lowest Davies–Bouldin index (0.8250), and the highest Calinski–Harabasz variance ratio (4393.91), while executing in just 0.2303s. Agglomerative clustering was competitive (0.4013 Silhouette) but exhibited ~7.1× slower runtime and quadratic memory scaling. GMM proved ill-suited for the log-scaled RFM geometry, while DBSCAN merged dense customer regions into only two clusters with 2.19% noise.
        </p>
      </ClayCard>
    </div>
  );
};

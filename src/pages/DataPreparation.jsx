import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  GitBranch,
  Filter,
  CheckCircle2,
  Scale,
  Calendar,
  AlertCircle,
  FileCheck,
  ArrowDown,
  Info
} from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PREPROCESSING_PIPELINE, DATASET_OVERVIEW } from '../data/edaMetadata';
import { formatNumber } from '../utils/formatters';

export const DataPreparation = () => {
  const { summary } = useOutletContext();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Pipeline Summary Header */}
      <ClayCard className="border border-white p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="clay-badge bg-indigo-50 text-accent border border-indigo-200">
              8-Stage Preprocessing Pipeline
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              From Raw Transaction Logs to Scaled RFM Feature Space
            </h2>
            <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
              Standardized pipeline implemented in Google Colab prior to unsupervised clustering. Filtering reduced 541,909 raw records to 392,692 clean purchases, aggregated into 4,338 customer-level RFM vectors.
            </p>
          </div>

          <div className="clay-inset p-3 rounded-xl text-xs space-y-1 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary">Raw Transactions:</span>
              <strong className="text-text-primary tabular-numbers">541,909</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary">Cleaned Transactions:</span>
              <strong className="text-status-success tabular-numbers">392,692</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary">Engineered RFM Vectors:</span>
              <strong className="text-accent tabular-numbers">4,338</strong>
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Visual Pipeline Funnel Steps */}
      <div>
        <SectionHeader
          title="Sequential Preprocessing Funnel"
          subtitle="Documented attrition of records across each cleaning transformation stage."
          badge="Funnel Analysis"
        />

        <div className="space-y-3">
          {PREPROCESSING_PIPELINE.map((stage, idx) => {
            const isReduction = stage.removedCount > 0;
            const pctRetained = ((stage.outputCount / 541909) * 100).toFixed(1);

            return (
              <ClayCard
                key={stage.step}
                className="p-4 sm:p-5 hover:border-accent/40 transition-all border border-white"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Step number & description */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl clay-inset flex items-center justify-center font-bold text-accent text-sm shrink-0">
                      0{stage.step}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary">
                          {stage.name}
                        </h3>
                        {stage.step === 7 && (
                          <span className="clay-badge bg-emerald-50 text-status-success text-[10px]">
                            RFM Aggregation Point
                          </span>
                        )}
                        {stage.step === 8 && (
                          <span className="clay-badge bg-indigo-50 text-accent text-[10px]">
                            Feature Transformation
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {stage.description}
                      </p>
                      <div className="text-[11px] text-text-muted mt-1 italic">
                        Rationale: {stage.rationale}
                      </div>
                    </div>
                  </div>

                  {/* Right: Record Counts & Attrition Stats */}
                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-200/60">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-text-primary tabular-numbers">
                        {formatNumber(stage.outputCount)} {stage.step >= 7 ? 'customers' : 'rows'}
                      </div>
                      <div className="text-[10px] text-text-muted tabular-numbers">
                        {stage.step < 7 ? `${pctRetained}% of raw data` : 'Final cohort'}
                      </div>
                    </div>

                    {isReduction ? (
                      <div className="clay-inset px-2.5 py-1.5 rounded-lg text-right min-w-[90px]">
                        <span className="text-[10px] font-bold text-status-danger uppercase block">
                          Dropped
                        </span>
                        <span className="text-xs font-bold text-status-danger tabular-numbers">
                          -{formatNumber(stage.removedCount)}
                        </span>
                      </div>
                    ) : (
                      <div className="clay-inset px-2.5 py-1.5 rounded-lg text-right min-w-[90px]">
                        <span className="text-[10px] font-bold text-status-success uppercase block">
                          Retained
                        </span>
                        <span className="text-xs font-bold text-status-success tabular-numbers">
                          100%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </ClayCard>
            );
          })}
        </div>
      </div>

      {/* RFM Mathematical Formulations & Reference Anchor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClayCard className="border-t-4 border-t-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">R — Recency</span>
            <span className="clay-badge bg-surface-secondary text-text-secondary text-[10px]">Days</span>
          </div>
          <div className="text-lg font-bold text-text-primary mb-1">
            Recency = Reference Date − max(InvoiceDate)
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            Measures customer dormancy in elapsed days. Derived using the reference date <strong>{summary?.referenceDate || '2011-12-10'}</strong> (max purchase date + 1 day).
          </p>
          <div className="clay-inset p-2.5 rounded-xl text-xs space-y-1 font-mono">
            <div>• Min observed: 0 days (shopped yesterday)</div>
            <div>• Max observed: 373 days (inactive for over a year)</div>
            <div>• Median: 50 days across all customers</div>
          </div>
        </ClayCard>

        <ClayCard className="border-t-4 border-t-status-success">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-status-success">F — Frequency</span>
            <span className="clay-badge bg-surface-secondary text-text-secondary text-[10px]">Count</span>
          </div>
          <div className="text-lg font-bold text-text-primary mb-1">
            Frequency = Count(Distinct InvoiceNo)
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            Measures customer repeat purchase engagement. Counts unique positive checkout sessions, avoiding bias from multiple line items in a single cart.
          </p>
          <div className="clay-inset p-2.5 rounded-xl text-xs space-y-1 font-mono">
            <div>• Min: 1 single purchase</div>
            <div>• Max: 210 repeat orders</div>
            <div>• Median: 2 distinct checkout sessions</div>
          </div>
        </ClayCard>

        <ClayCard className="border-t-4 border-t-secondary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">M — Monetary</span>
            <span className="clay-badge bg-surface-secondary text-text-secondary text-[10px]">GBP (£)</span>
          </div>
          <div className="text-lg font-bold text-text-primary mb-1">
            Monetary = Σ(Quantity × UnitPrice)
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            Gross cumulative monetary value generated by each customer across the observation period.
          </p>
          <div className="clay-inset p-2.5 rounded-xl text-xs space-y-1 font-mono">
            <div>• Min: £3.75</div>
            <div>• Max: £280,206.02 (wholesale bulk buyer)</div>
            <div>• Total dataset value: £8,887,208.89</div>
          </div>
        </ClayCard>
      </div>

      {/* Critical Technical Explanation: Why Scaling & Transformation are Essential */}
      <ClayCard className="border border-indigo-100">
        <SectionHeader
          title="Methodological Justification: Why Normalization & Log Scaling are Mandatory"
          subtitle="Theoretical defense for technical viva on distance-based clustering algorithms."
          badge="Viva Defense"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary leading-relaxed">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Scale size={18} className="text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary text-sm block mb-1">1. Euclidean Distance Distortion</strong>
                Clustering algorithms like K-Means and Agglomerative Clustering calculate proximity between points using Euclidean distance:
                <div className="clay-inset p-2 rounded-lg my-2 font-mono text-[11px] text-text-primary">
                  d(p, q) = √[ (R₁ − R₂)² + (F₁ − F₂)² + (M₁ − M₂)² ]
                </div>
                Because Monetary ranges up to £280,000 while Frequency ranges from 1 to 210, raw unscaled Monetary would dominate 99.9% of distance calculations, rendering Recency and Frequency completely meaningless.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={18} className="text-status-success shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary text-sm block mb-1">2. Skewness Correction (np.log1p) & StandardScaler</strong>
                Customer spending and purchase counts follow severe power-law / Pareto distributions. Applying natural logarithmic transformation <code>np.log1p(x)</code> compresses extreme right tails into approximately normal shapes.
                <div className="mt-2">
                  Following log transformation, <code>StandardScaler</code> centers each dimension to mean = 0 and variance = 1, ensuring equal mathematical weight across Recency, Frequency, and Monetary features.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-text-muted">
          <Info size={13} className="text-accent shrink-0" />
          <span>Note: The application presents exported preprocessing results from the Colab pipeline; raw transaction ETL is not re-computed in the client browser.</span>
        </div>
      </ClayCard>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Store,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Check,
  Award,
  Layers,
  HelpCircle,
  Clock,
  Scale
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SaasCard } from '../components/ui/SaasCard';
import { ModelComparisonChart } from '../components/charts/ModelComparisonChart';
import { formatNumber } from '../utils/formatters';

export const Settings = () => {
  const { storeSettings, updateStoreSettings, resetToDemo, datasetName, source, summary, models } = useData();
  const [storeNameInput, setStoreNameInput] = useState(storeSettings.storeName || 'My Store');
  const [currencyInput, setCurrencyInput] = useState(storeSettings.currency || 'GBP');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    updateStoreSettings({
      storeName: storeNameInput.trim() || 'My Store',
      currency: currencyInput
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = async () => {
    await resetToDemo();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Store Settings & Intelligence Engine
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure store identity, manage customer datasets, and review machine learning clustering specifications.
        </p>
      </div>

      {/* Store Profile Card */}
      <SaasCard className="p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Store size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Store Profile & Currency
          </h3>
        </div>

        <form onSubmit={handleSaveStoreSettings} className="space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Store / Business Display Name:
            </label>
            <input
              type="text"
              value={storeNameInput}
              onChange={(e) => setStoreNameInput(e.target.value)}
              placeholder="e.g. My Giftware Store"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Store Currency:
            </label>
            <select
              value={currencyInput}
              onChange={(e) => setCurrencyInput(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="GBP">GBP (£) — British Pound Sterling</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Save Store Profile
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <Check size={14} /> Profile updated
              </span>
            )}
          </div>
        </form>
      </SaasCard>

      {/* Data Management Card */}
      <SaasCard className="p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Database size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Active Dataset & Store Data Management
          </h3>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <span>{datasetName}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                  {source === 'demo' ? 'Sample Demo' : 'Custom Upload'}
                </span>
              </div>
              <p className="text-slate-500 mt-1">
                Active customer accounts: <strong className="text-slate-800">{formatNumber(summary?.totalCustomers)}</strong> • Reference Period: <strong className="text-slate-800">{summary?.referenceDate}</strong>
              </p>
            </div>

            <button
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto shrink-0"
            >
              <RefreshCw size={13} className="text-slate-500" />
              <span>Reset to Sample Store Data</span>
            </button>
          </div>

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Demo dataset restored successfully (4,338 customers).</span>
            </div>
          )}
        </div>
      </SaasCard>

      {/* Technical Clustering Engine Details (Collapsible & Clean) */}
      <SaasCard className="p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Machine Learning Model & Technical Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark metrics and algorithmic specifications evaluated for automated customer segmentation.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            {showTechnicalDetails ? 'Hide Model Details' : 'View Model Details'}
          </button>
        </div>

        {showTechnicalDetails && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800 block mb-1 font-semibold flex items-center gap-1.5">
                <Award size={15} className="text-blue-600" />
                Underlying Segmentation Architecture:
              </strong>
              RetailIQ automatically clusters retail accounts into business cohorts using K-Means clustering ($k=3$) evaluated against Hierarchical, Gaussian Mixture, and Density-based (DBSCAN) models. The features (Recency, Frequency, and Monetary spend) are log-transformed via <code>np.log1p</code> to eliminate Pareto skewness and standardized via <code>StandardScaler</code> prior to distance computation.
            </div>

            {/* Model Benchmark Leaderboard Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
                Algorithm Evaluation Benchmark (Online Retail Baseline)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 text-slate-600 border-b border-slate-200 font-semibold">
                      <th className="py-2.5 px-3">Algorithm</th>
                      <th className="py-2.5 px-3 text-center">Clusters</th>
                      <th className="py-2.5 px-3 text-center">Noise %</th>
                      <th className="py-2.5 px-3 text-right">Runtime</th>
                      <th className="py-2.5 px-3 text-right">Silhouette ↑</th>
                      <th className="py-2.5 px-3 text-right">Davies-Bouldin ↓</th>
                      <th className="py-2.5 px-3 text-center">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(models || []).map(m => (
                      <tr key={m.modelName} className={m.isBest ? 'bg-blue-50/40 font-medium' : ''}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{m.modelName}</td>
                        <td className="py-2.5 px-3 text-center tabular-numbers">{m.clusters}</td>
                        <td className="py-2.5 px-3 text-center tabular-numbers text-slate-500">{m.noisePct}%</td>
                        <td className="py-2.5 px-3 text-right tabular-numbers font-mono text-slate-600">{m.runtime.toFixed(4)}s</td>
                        <td className="py-2.5 px-3 text-right tabular-numbers font-mono font-bold text-blue-600">{m.silhouette.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-right tabular-numbers font-mono text-emerald-600">{m.daviesBouldin.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-center">
                          {m.isBest ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              Production Model
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Benchmark</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Comparison Interactive Chart */}
            <div className="pt-2">
              <ModelComparisonChart models={models} />
            </div>
          </div>
        )}
      </SaasCard>
    </div>
  );
};

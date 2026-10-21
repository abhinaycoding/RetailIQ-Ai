import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  PieChart as PieIcon,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Download,
  Filter,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SaasCard } from '../components/ui/SaasCard';
import { CustomerScatterPlot } from '../components/charts/CustomerScatterPlot';
import { SegmentDistributionChart } from '../components/charts/SegmentDistributionChart';
import { SpendingChart } from '../components/charts/SpendingChart';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent
} from '../utils/formatters';

export const CustomerSegments = () => {
  const { segments, customers, summary } = useData();
  const navigate = useNavigate();
  const [selectedCluster, setSelectedCluster] = useState('all');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Customer Segmentation Cohorts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated customer categorization based on purchase recency, order frequency, and cumulative spend.
          </p>
        </div>

        <button
          onClick={() => navigate('/customers')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Users size={14} className="text-slate-500" />
          <span>Browse All {summary?.totalCustomers?.toLocaleString()} Accounts</span>
        </button>
      </div>

      {/* 3 Detailed Segment Cohort Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {segments.map((seg) => (
          <SaasCard
            key={seg.clusterId}
            hoverable
            onClick={() => navigate(`/customers?segment=${seg.clusterId}`)}
            className="flex flex-col justify-between border-t-4"
            style={{ borderTopColor: seg.color }}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${seg.badgeClass}`}>
                    Cohort #{seg.clusterId}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">
                    {seg.name}
                  </h3>
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {seg.description}
              </p>

              {/* Empirical Metrics */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Audience Size:</span>
                  <strong className="text-slate-900 tabular-numbers">
                    {formatNumber(seg.customerCount)} ({formatPercent(seg.pctOfCustomers)})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Revenue:</span>
                  <strong className="text-slate-900 tabular-numbers">
                    {formatCurrency(seg.totalSpending, 0)} ({formatPercent(seg.pctOfRevenue)})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Median Spend:</span>
                  <strong className="text-slate-900 tabular-numbers">
                    {formatCurrency(seg.medianSpending)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Typical Frequency:</span>
                  <strong className="text-slate-900 tabular-numbers">
                    {seg.medianFrequency} {seg.medianFrequency === 1 ? 'order' : 'orders'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recency Profile:</span>
                  <strong className="text-slate-900 tabular-numbers">
                    ~{seg.medianRecency} days ago
                  </strong>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="mt-3 p-2.5 bg-blue-50/50 border border-blue-100/70 rounded-lg text-[11px] text-blue-900 leading-snug">
                <strong className="font-semibold block mb-0.5">Recommended Playbook:</strong>
                {seg.action}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>View {formatNumber(seg.customerCount)} Customers</span>
              <ArrowRight size={13} />
            </div>
          </SaasCard>
        ))}
      </div>

      {/* Cohort Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SaasCard>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">
              Customer Share by Segment
            </h3>
            <span className="text-xs text-slate-500">Audience Breakdown</span>
          </div>
          <SegmentDistributionChart segments={segments} />
        </SaasCard>

        <SaasCard>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">
              Revenue Contribution by Segment
            </h3>
            <span className="text-xs text-slate-500">Sales Breakdown</span>
          </div>
          <SpendingChart segments={segments} />
        </SaasCard>
      </div>

      {/* Recency vs Spend Scatter Plot */}
      <SaasCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Customer Recency vs. Monetary Spending Space
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Observe how automated segmentation cleanly isolates high-value frequent buyers from lapsed accounts.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {['all', '0', '1', '2'].map((id) => (
              <button
                key={id}
                onClick={() => setSelectedCluster(id)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  selectedCluster === id
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 border border-slate-200 bg-white'
                }`}
              >
                {id === 'all' ? 'All Points' : `Cohort ${id}`}
              </button>
            ))}
          </div>
        </div>

        <CustomerScatterPlot
          customers={customers}
          selectedCluster={selectedCluster}
          maxPoints={900}
        />
      </SaasCard>
    </div>
  );
};

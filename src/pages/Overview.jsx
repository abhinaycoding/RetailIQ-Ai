import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Repeat,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  AlertCircle,
  Clock,
  UploadCloud
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { MetricCard } from '../components/ui/MetricCard';
import { SaasCard } from '../components/ui/SaasCard';
import { SegmentDistributionChart } from '../components/charts/SegmentDistributionChart';
import { SpendingChart } from '../components/charts/SpendingChart';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent
} from '../utils/formatters';

export const Overview = () => {
  const { summary, segments, customers, salesTimeline, datasetName, source, importedAt } = useData();
  const navigate = useNavigate();
  const [timelineRange, setTimelineRange] = useState('all'); // '3m' | '6m' | 'all'

  // Filter sales timeline by selected date range
  const filteredTimeline = useMemo(() => {
    if (!salesTimeline || salesTimeline.length === 0) return [];
    if (timelineRange === '3m') {
      return salesTimeline.slice(-3);
    }
    if (timelineRange === '6m') {
      return salesTimeline.slice(-6);
    }
    return salesTimeline;
  }, [salesTimeline, timelineRange]);

  // Derived Repeat vs One-time customers
  const repeatCount = useMemo(() => {
    return (customers || []).filter(c => c.frequency > 1).length;
  }, [customers]);
  const oneTimeCount = (customers?.length || 0) - repeatCount;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Seller Notice / Data Context Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">
                Active Store Dataset: {datasetName}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {source === 'demo' ? 'Sample Data' : 'Custom Upload'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Reference Date: <strong className="text-slate-700">{summary?.referenceDate}</strong>
              {importedAt && ` • Imported at ${importedAt}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/import')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud size={14} className="text-slate-500" />
            <span>Upload New CSV</span>
          </button>
          <button
            onClick={() => navigate('/customers')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>View Customers</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 5 Core Business KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCompactCurrency(summary?.totalRevenue)}
          caption={`Exact: ${formatCurrency(summary?.totalRevenue, 2)}`}
          icon={DollarSign}
          badge="Gross Sales"
          badgeType="positive"
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(summary?.totalOrders)}
          caption="Completed checkouts"
          icon={ShoppingBag}
          badge="Invoices"
          badgeType="neutral"
        />
        <MetricCard
          title="Unique Customers"
          value={formatNumber(summary?.totalCustomers)}
          caption="Active buyer accounts"
          icon={Users}
          badge="Audience"
          badgeType="brand"
        />
        <MetricCard
          title="Repeat Customer Rate"
          value={`${summary?.repeatCustomerRate || 0}%`}
          caption={`${formatNumber(repeatCount)} customers with 2+ orders`}
          icon={Repeat}
          badge="Loyalty"
          badgeType="positive"
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(summary?.avgOrderValue, 2)}
          caption="Revenue per transaction"
          icon={TrendingUp}
          badge="AOV"
          badgeType="neutral"
        />
      </div>

      {/* Main Charts Row: Revenue Over Time & Segment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <SaasCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Revenue Over Time
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly gross sales trend across the recorded transaction window.
                </p>
              </div>

              {/* Date range filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
                <button
                  onClick={() => setTimelineRange('3m')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timelineRange === '3m' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Last 3 Months
                </button>
                <button
                  onClick={() => setTimelineRange('6m')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timelineRange === '6m' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Last 6 Months
                </button>
                <button
                  onClick={() => setTimelineRange('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timelineRange === 'all' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatCompactCurrency}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Aggregated from verified transaction dates</span>
            <button
              onClick={() => navigate('/sales')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Detailed Sales Analytics</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </SaasCard>

        {/* Customer Cohort Distribution */}
        <SaasCard className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Customer Segments
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Automated
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Share of customers grouped by purchase behavior.
            </p>

            <SegmentDistributionChart segments={segments} />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{summary?.totalCustomers?.toLocaleString()} total buyers</span>
            <button
              onClick={() => navigate('/segments')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Explore Segments</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </SaasCard>
      </div>

      {/* 3 Actionable Business Cohorts Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Customer Cohorts & Revenue Contribution
            </h3>
            <p className="text-xs text-slate-500">
              Click any cohort to view its customer accounts or download contact lists for targeted marketing.
            </p>
          </div>
          <button
            onClick={() => navigate('/segments')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>All Segments</span>
            <ArrowRight size={13} />
          </button>
        </div>

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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cohort #{seg.clusterId}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {seg.name}
                    </h4>
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {seg.description}
                </p>

                {/* Metrics Breakdown */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customers:</span>
                    <strong className="text-slate-900 tabular-numbers">
                      {formatNumber(seg.customerCount)} ({formatPercent(seg.pctOfCustomers)})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Spend:</span>
                    <strong className="text-slate-900 tabular-numbers">
                      {formatCurrency(seg.totalSpending, 0)} ({formatPercent(seg.pctOfRevenue)})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Typical Order Cadence:</span>
                    <strong className="text-slate-900 tabular-numbers">
                      {seg.medianFrequency} orders • ~{seg.medianRecency}d recency
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>View {formatNumber(seg.customerCount)} Customers</span>
                <ArrowRight size={13} />
              </div>
            </SaasCard>
          ))}
        </div>
      </div>

      {/* Recommended Seller Actions Panel */}
      <SaasCard className="border-l-4 border-l-blue-600 p-5 bg-gradient-to-r from-blue-50/20 via-white to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Recommended Actions
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Actionable Opportunities</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Immediate Growth & Retention Plays
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Based on your active customer purchase patterns, prioritize high-leverage opportunities:
            </p>
          </div>

          <button
            onClick={() => navigate('/marketing')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
          >
            <Sparkles size={14} />
            <span>Open Marketing Playbooks</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-white border border-slate-200/80 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Protect VIP Revenue (81.6%)
            </div>
            <p className="text-slate-600 leading-relaxed">
              1,320 high-value customers contribute over £7.2M. Ensure order fulfillment excellence and offer VIP loyalty perks.
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200/80 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-rose-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              Re-engage Lapsed Buyers (981)
            </div>
            <p className="text-slate-600 leading-relaxed">
              981 customers haven't purchased in ~8.5 months. Launch a win-back email sequence with a limited-time incentive.
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200/80 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Accelerate Second Orders (2,037)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Occasional buyers average 2 orders. Recommend complementary items within 30 days of purchase to build repeat habits.
            </p>
          </div>
        </div>
      </SaasCard>
    </div>
  );
};

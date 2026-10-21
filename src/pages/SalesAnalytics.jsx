import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Calendar,
  Users,
  Repeat,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SaasCard } from '../components/ui/SaasCard';
import { MetricCard } from '../components/ui/MetricCard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart as RechartsPie,
  Pie,
  Legend
} from 'recharts';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent
} from '../utils/formatters';

export const SalesAnalytics = () => {
  const { summary, salesTimeline, customers } = useData();
  const [timelineRange, setTimelineRange] = useState('all'); // '3m' | '6m' | 'all'

  // Filter timeline
  const filteredTimeline = useMemo(() => {
    if (!salesTimeline || salesTimeline.length === 0) return [];
    if (timelineRange === '3m') return salesTimeline.slice(-3);
    if (timelineRange === '6m') return salesTimeline.slice(-6);
    return salesTimeline;
  }, [salesTimeline, timelineRange]);

  // Compute Frequency distribution brackets
  const frequencyBrackets = useMemo(() => {
    if (!customers || customers.length === 0) return [];
    const brackets = [
      { name: '1 Order', count: 0, color: '#94A3B8' },
      { name: '2 Orders', count: 0, color: '#059669' },
      { name: '3–5 Orders', count: 0, color: '#3B82F6' },
      { name: '6–10 Orders', count: 0, color: '#2563EB' },
      { name: '11+ Orders', count: 0, color: '#1E40AF' },
    ];

    customers.forEach(c => {
      const f = c.frequency;
      if (f === 1) brackets[0].count++;
      else if (f === 2) brackets[1].count++;
      else if (f >= 3 && f <= 5) brackets[2].count++;
      else if (f >= 6 && f <= 10) brackets[3].count++;
      else brackets[4].count++;
    });

    return brackets;
  }, [customers]);

  // Compute Spending distribution brackets
  const spendingBrackets = useMemo(() => {
    if (!customers || customers.length === 0) return [];
    const brackets = [
      { range: 'Under £250', count: 0 },
      { range: '£250–£500', count: 0 },
      { range: '£500–£1k', count: 0 },
      { range: '£1k–£2.5k', count: 0 },
      { range: '£2.5k–£5k', count: 0 },
      { range: '£5k+', count: 0 },
    ];

    customers.forEach(c => {
      const m = c.monetary;
      if (m < 250) brackets[0].count++;
      else if (m < 500) brackets[1].count++;
      else if (m < 1000) brackets[2].count++;
      else if (m < 2500) brackets[3].count++;
      else if (m < 5000) brackets[4].count++;
      else brackets[5].count++;
    });

    return brackets;
  }, [customers]);

  // Repeat vs One-time cohort
  const repeatStats = useMemo(() => {
    if (!customers || customers.length === 0) return [];
    const oneTime = customers.filter(c => c.frequency === 1);
    const repeat = customers.filter(c => c.frequency > 1);

    const oneTimeRev = oneTime.reduce((acc, c) => acc + c.monetary, 0);
    const repeatRev = repeat.reduce((acc, c) => acc + c.monetary, 0);

    return [
      { name: 'One-Time Buyers', customers: oneTime.length, revenue: oneTimeRev, color: '#94A3B8' },
      { name: 'Repeat Buyers (2+)', customers: repeat.length, revenue: repeatRev, color: '#2563EB' }
    ];
  }, [customers]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gross Sales"
          value={formatCompactCurrency(summary?.totalRevenue)}
          caption={`Total: ${formatCurrency(summary?.totalRevenue, 2)}`}
          icon={DollarSign}
          badge="Revenue"
          badgeType="positive"
        />
        <MetricCard
          title="Total Order Volume"
          value={formatNumber(summary?.totalOrders)}
          caption="Completed invoice transactions"
          icon={ShoppingBag}
          badge="Orders"
          badgeType="neutral"
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(summary?.avgOrderValue, 2)}
          caption="Spend per checkout"
          icon={TrendingUp}
          badge="AOV"
          badgeType="neutral"
        />
        <MetricCard
          title="Repeat Customer Share"
          value={`${summary?.repeatCustomerRate || 0}%`}
          caption="Accounts with 2+ purchases"
          icon={Repeat}
          badge="Retention"
          badgeType="brand"
        />
      </div>

      {/* Sales Timeline Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <SaasCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Revenue Over Time
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly gross sales volume.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
              <button
                onClick={() => setTimelineRange('3m')}
                className={`px-2 py-0.5 rounded-md ${timelineRange === '3m' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                3M
              </button>
              <button
                onClick={() => setTimelineRange('6m')}
                className={`px-2 py-0.5 rounded-md ${timelineRange === '6m' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                6M
              </button>
              <button
                onClick={() => setTimelineRange('all')}
                className={`px-2 py-0.5 rounded-md ${timelineRange === 'all' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                All
              </button>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SaasCard>

        {/* Order Count Over Time */}
        <SaasCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Order Count Over Time
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Completed invoice checkouts per month.
              </p>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  formatter={(val) => [formatNumber(val), 'Orders']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="orders" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SaasCard>
      </div>

      {/* Customer Purchase Frequency & Spending Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frequency Distribution */}
        <SaasCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Customer Purchase Frequency Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of accounts by lifetime order count.
              </p>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyBrackets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  formatter={(val) => [formatNumber(val), 'Customers']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {frequencyBrackets.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SaasCard>

        {/* New vs Returning Buyers */}
        <SaasCard>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Buyer Retention Split
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                One-time vs Repeat customer revenue impact.
              </p>
            </div>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={repeatStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="customers"
                >
                  {repeatStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name, props) => [`${formatNumber(val)} customers (${formatCurrency(props.payload.revenue, 0)})`, name]} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            {repeatStats.map(stat => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-slate-600">{stat.name}:</span>
                </div>
                <div className="font-semibold text-slate-900 tabular-numbers">
                  {formatNumber(stat.customers)} ({formatCompactCurrency(stat.revenue)})
                </div>
              </div>
            ))}
          </div>
        </SaasCard>
      </div>

      {/* Spending Distribution Brackets */}
      <SaasCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Customer Lifetime Spending Brackets
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of customer accounts across total spend tiers.
            </p>
          </div>
        </div>

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingBrackets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="range" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
              <Tooltip
                formatter={(val) => [formatNumber(val), 'Customers']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SaasCard>
    </div>
  );
};

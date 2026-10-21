import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Sparkles,
  Gift,
  RotateCcw,
  ShoppingBag,
  Users,
  Download,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SaasCard } from '../components/ui/SaasCard';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent
} from '../utils/formatters';

export const MarketingOpportunities = () => {
  const { customers, segments, summary } = useData();
  const navigate = useNavigate();

  // Campaign Simulator state
  const [selectedCohort, setSelectedCohort] = useState('0');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [targetReachPct, setTargetReachPct] = useState(50);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  // Dynamically calculate explainable rule cohorts from active customer data
  const marketingRules = useMemo(() => {
    if (!customers || customers.length === 0) return [];

    // 1. VIP Premier Reward: Top Spenders with repeat orders
    const vipAccounts = customers.filter(c => c.monetary >= 1500 && c.frequency >= 3);
    const vipSpend = vipAccounts.reduce((acc, c) => acc + c.monetary, 0);

    // 2. Churn Prevention / Win-Back: Inactive for >120 days
    const atRiskAccounts = customers.filter(c => c.recency > 120);
    const atRiskSpend = atRiskAccounts.reduce((acc, c) => acc + c.monetary, 0);

    // 3. Second-Order Nudge: One-time buyers who bought recently (<90 days)
    const secondOrderAccounts = customers.filter(c => c.frequency === 1 && c.recency <= 90);
    const secondOrderSpend = secondOrderAccounts.reduce((acc, c) => acc + c.monetary, 0);

    // 4. Basket Expansion: Repeat buyers with 2–3 orders
    const expansionAccounts = customers.filter(c => c.frequency >= 2 && c.frequency <= 3 && c.recency <= 60);
    const expansionSpend = expansionAccounts.reduce((acc, c) => acc + c.monetary, 0);

    return [
      {
        id: 'vip',
        title: 'VIP Premier Retention & Loyalty Tier',
        tagline: 'Protect your highest-margin accounts',
        badge: 'Top VIPs',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        rule: 'Spend ≥ £1,500 AND Orders ≥ 3',
        accountsCount: vipAccounts.length,
        totalHistoricalSpend: vipSpend,
        strategy: 'Institute an exclusive loyalty tier with early catalog access, free priority shipping, and personal order support. Avoid steep discounts.',
        accountsList: vipAccounts
      },
      {
        id: 'winback',
        title: 'Lapsed Customer Win-Back Campaign',
        tagline: 'Re-engage accounts before permanent churn',
        badge: 'At-Risk',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        rule: 'Days Since Purchase > 120 days',
        accountsCount: atRiskAccounts.length,
        totalHistoricalSpend: atRiskSpend,
        strategy: 'Deploy a structured 2-step win-back email sequence: 1) "We Miss You" check-in, 2) Limited-time 15% discount code valid for 14 days.',
        accountsList: atRiskAccounts
      },
      {
        id: 'second_order',
        title: 'Second-Order Conversion Accelerator',
        tagline: 'Turn recent one-time buyers into repeat customers',
        badge: 'High Potential',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rule: 'Orders = 1 AND Days Since Purchase ≤ 90 days',
        accountsCount: secondOrderAccounts.length,
        totalHistoricalSpend: secondOrderSpend,
        strategy: 'Send curated product recommendations based on their first purchase item, paired with free gift packaging on their second order.',
        accountsList: secondOrderAccounts
      },
      {
        id: 'expansion',
        title: 'Occasional Buyer Basket Expansion',
        tagline: 'Increase order size among active repeat buyers',
        badge: 'Growth Cohort',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        rule: 'Orders between 2 and 3 AND Recency ≤ 60 days',
        accountsCount: expansionAccounts.length,
        totalHistoricalSpend: expansionSpend,
        strategy: 'Promote category bundles (e.g. "Buy 3 complementary SKUs and save £15") to lift average order value while engagement is high.',
        accountsList: expansionAccounts
      }
    ];
  }, [customers]);

  // Handle CSV export of a specific rule cohort
  const handleExportCohortCSV = (cohort) => {
    const headers = ['CustomerID', 'LastPurchase', 'TotalOrders', 'TotalSpend', 'RecencyDays'];
    const rows = cohort.accountsList.map(c => [
      c.id,
      c.lastPurchase,
      c.frequency,
      c.monetary,
      c.recency
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `retailiq_campaign_cohort_${cohort.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Campaign Simulator Calculations
  const activeSimSegment = segments.find(s => s.clusterId === Number(selectedCohort)) || segments[0];
  const targetedAudience = Math.round((activeSimSegment.customerCount * targetReachPct) / 100);
  const avgBasket = activeSimSegment.medianSpending;
  const estimatedGrossReturn = targetedAudience * avgBasket * 0.15; // 15% conversion benchmark
  const discountSpend = estimatedGrossReturn * (discountPercent / 100);
  const netEstimatedMargin = estimatedGrossReturn - discountSpend;

  const handleSimulate = (e) => {
    e.preventDefault();
    setSimulationSuccess(true);
    setTimeout(() => setSimulationSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Customer Marketing Opportunities & Playbooks
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Data-driven marketing recommendations triggered by specific customer purchasing thresholds.
        </p>
      </div>

      {/* 4 Rule-Based Playbook Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {marketingRules.map((rule) => (
          <SaasCard key={rule.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rule.badgeColor}`}>
                    {rule.badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">
                    {rule.title}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 tabular-numbers">
                    {formatNumber(rule.accountsCount)}
                  </div>
                  <span className="text-[10px] text-slate-500">accounts</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 my-3 text-xs flex items-center justify-between">
                <span className="text-slate-500">Qualification Rule:</span>
                <code className="text-slate-800 font-mono text-[11px] font-semibold">{rule.rule}</code>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <strong className="text-slate-800 block mb-0.5">Historical Cohort Value:</strong>
                  <span className="text-slate-600 tabular-numbers">
                    Generated {formatCurrency(rule.totalHistoricalSpend, 0)} across all past orders.
                  </span>
                </div>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Recommended Marketing Strategy:</strong>
                  <p className="text-slate-600 leading-relaxed">
                    {rule.strategy}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleExportCohortCSV(rule)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
                title="Download CSV of customer IDs in this cohort"
              >
                <Download size={13} className="text-slate-500" />
                <span>Export Audience ({rule.accountsCount})</span>
              </button>

              <button
                onClick={() => navigate('/customers')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Browse</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </SaasCard>
        ))}
      </div>

      {/* Campaign Budget & ROI Planning Sandbox */}
      <SaasCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Campaign Simulator
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Tactical Campaign Budget & Return Planner
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Model audience reach, discount depth, and potential sales leverage before executing a promotion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <form onSubmit={handleSimulate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Customer Segment:
              </label>
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {segments.map(s => (
                  <option key={s.clusterId} value={s.clusterId}>
                    Cohort #{s.clusterId}: {s.name} ({s.customerCount} customers)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Audience Reach:</span>
                <span className="font-bold text-blue-600 tabular-numbers">{targetReachPct}% ({formatNumber(targetedAudience)} accounts)</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={targetReachPct}
                onChange={(e) => setTargetReachPct(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Discount Depth:</span>
                <span className="font-bold text-slate-900 tabular-numbers">{discountPercent}% voucher</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Simulate Campaign Return</span>
            </button>

            {simulationSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Campaign plan modeled successfully against cohort baselines.</span>
              </div>
            )}
          </form>

          {/* Model Projections Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Audience Reach</span>
              <div className="text-2xl font-bold text-slate-900 tabular-numbers mt-1">
                {formatNumber(targetedAudience)}
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                {targetReachPct}% of {activeSimSegment.name}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Cohort Median Basket</span>
              <div className="text-2xl font-bold text-blue-600 tabular-numbers mt-1">
                {formatCurrency(avgBasket)}
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                Historical spend benchmark
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Modeled Discount Cost</span>
              <div className="text-2xl font-bold text-rose-600 tabular-numbers mt-1">
                {formatCurrency(discountSpend)}
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                Incentive budget at {discountPercent}% rate
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Projected Net Leverage</span>
              <div className="text-2xl font-bold text-emerald-600 tabular-numbers mt-1">
                {formatCurrency(netEstimatedMargin)}
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                Est. gross sales minus voucher cost
              </span>
            </div>

            <div className="sm:col-span-2 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Operational Note:</strong> Projections provide a standard planning framework based on historical cohort spending and a baseline 15% conversion assumption. Export the audience CSV to import into your email or SMS marketing provider (e.g. Klaviyo, Mailchimp, Shopify).
            </div>
          </div>
        </div>
      </SaasCard>
    </div>
  );
};

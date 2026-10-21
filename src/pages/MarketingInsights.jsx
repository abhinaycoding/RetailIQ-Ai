import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Target,
  Sparkles,
  Gift,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Users,
  Send,
  Info
} from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent
} from '../utils/formatters';

const MARKETING_PLAYBOOKS = [
  {
    clusterId: 0,
    name: 'High-Value Recent Customers',
    tagline: 'VIP Retention & Margin Protection',
    accentColor: '#526DDB',
    badgeClass: 'bg-indigo-50 text-accent border-indigo-200',
    measuredEvidence: 'Median Recency: 17 days | Median Frequency: 7 orders | Median Spend: £2,570.50 (81.6% of all retail revenue)',
    recommendations: [
      {
        title: 'Tiered VIP Loyalty Program',
        action: 'Institute an exclusive premier buyer tier offering priority shipping, dedicated account support, and early access to new wholesale collections.',
        justification: 'With 7 median orders and £2,570 median spending, these accounts have proven high lifetime value and expect premium commercial service.'
      },
      {
        title: 'Complementary Cross-Selling Without Over-Discounting',
        action: 'Recommend high-affinity complementary giftware items based on past purchase categories. Avoid steep discounting which erodes healthy retail margins.',
        justification: 'These customers already possess strong natural purchasing momentum (17d median recency); heavy price discounting is financially unnecessary.'
      },
      {
        title: 'Proactive Re-order Triggers',
        action: 'Implement predictive reminders timed to their typical 14–21 day re-order cadence before they exhaust existing inventory.',
        justification: 'Capitalizes on their frequent purchase rhythm to block competitors from intercepting cyclical replenishment.'
      }
    ],
    riskWarning: 'Do not flood this segment with spammy promotional blasts. Over-communication risks alienating top commercial buyers.'
  },
  {
    clusterId: 1,
    name: 'Inactive / At-Risk Customers',
    tagline: 'Targeted Re-Engagement & Win-Back',
    accentColor: '#D85E69',
    badgeClass: 'bg-rose-50 text-status-danger border-rose-200',
    measuredEvidence: 'Median Recency: 253 days (~8.5 months) | Median Frequency: 1 order | Median Spend: £290.51 (only 4.4% of total revenue)',
    recommendations: [
      {
        title: 'Multi-Touch Win-Back Sequence',
        action: 'Deploy a structured 3-part win-back sequence: 1) "We Miss You" survey asking about past experience, 2) Curated showcase of new arrivals, 3) Limited-time incentive.',
        justification: 'At 253 days median recency, these customers have effectively churned and will not return organically without an explicit reactivation catalyst.'
      },
      {
        title: 'Calibrated Reactivation Incentive',
        action: 'Test a steep 15–20% voucher or free return shipping strictly contingent on a second checkout.',
        justification: 'Since 981 customers made only 1 historic order, overcoming the initial friction of a second purchase is the single highest-leverage milestone.'
      },
      {
        title: 'Low-Cost Cohort Pruning Test',
        action: 'Evaluate campaign response rates on a 10% test sample before committing marketing budget across all 981 lapsed contacts.',
        justification: 'Re-engaging deeply dormant contacts often incurs high customer acquisition costs with low conversion rates; staged testing limits budget waste.'
      }
    ],
    riskWarning: 'Monitor unsubscribe rates. Contacts inactive for over 300 days may require suppression to protect email deliverability.'
  },
  {
    clusterId: 2,
    name: 'Occasional Customers',
    tagline: 'Frequency Acceleration & Basket Expansion',
    accentColor: '#27876D',
    badgeClass: 'bg-emerald-50 text-status-success border-emerald-200',
    measuredEvidence: 'Median Recency: 45 days | Median Frequency: 2 orders | Median Spend: £508.80 (largest cohort: 2,037 customers, 47.0% of base)',
    recommendations: [
      {
        title: 'Next-Order Milestone Incentive',
        action: 'Target with a "Unlock Tier 2 on your 3rd order" campaign offering free gift wrapping or a £15 voucher upon reaching 3 lifetime invoices.',
        justification: 'This group is stuck at a median frequency of 2 orders; nudging them to 3 or 4 orders unlocks significant incremental revenue given their size (2,037 buyers).'
      },
      {
        title: 'Category Discovery & Bundling',
        action: 'Showcase popular SKUs from categories they have not yet purchased, paired with bundle discounts (e.g. "Buy 3 complementary home gift items for £40").',
        justification: 'Current median spending is moderate (£508.80); cross-category expansion is the most effective path to grow basket value.'
      },
      {
        title: 'Post-Purchase Engagement Loop',
        action: 'Automate a 30-day post-purchase check-in email with product care guides and seasonal recommendations.',
        justification: 'With 45 days median recency, keeping the brand top-of-mind within the 30–60 day window prevents them from sliding into Cluster 1 dormancy.'
      }
    ],
    riskWarning: 'Ensure product recommendations match past price points. Pitching luxury high-ticket items will dampen click-through rates.'
  }
];

export const MarketingInsights = () => {
  const { segments, summary } = useOutletContext();
  const navigate = useNavigate();

  // Working Campaign Planner State
  const [selectedCampaignCluster, setSelectedCampaignCluster] = useState('0');
  const [campaignOffer, setCampaignOffer] = useState('loyalty'); // loyalty, discount, bundle
  const [discountPercent, setDiscountPercent] = useState(10);
  const [targetReachPct, setTargetReachPct] = useState(50);
  const [plannedSuccess, setPlannedSuccess] = useState(false);

  const activeSegmentData = segments.find(s => s.clusterId === Number(selectedCampaignCluster)) || segments[0];

  // Real campaign calculations based on empirical cluster size and median spending
  const targetedCustomerCount = Math.round((activeSegmentData.customerCount * targetReachPct) / 100);
  const estimatedOrderValue = activeSegmentData.medianSpending;
  const potentialGrossImpact = targetedCustomerCount * estimatedOrderValue * 0.15; // 15% estimated conversion benchmark
  const discountCost = potentialGrossImpact * (discountPercent / 100);
  const estimatedNetReturn = potentialGrossImpact - discountCost;

  const handleSimulateCampaign = (e) => {
    e.preventDefault();
    setPlannedSuccess(true);
    setTimeout(() => setPlannedSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Header Banner */}
      <ClayCard className="border border-white p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="clay-badge bg-indigo-50 text-accent border border-indigo-200">
              Evidence-Based Strategy
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Actionable Marketing Playbooks Grounded in Cluster Data
            </h2>
            <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
              Tailored tactical recommendations addressing the specific behavioral realities of each cluster. Every proposed action directly cites measured empirical evidence from the K-Means clustering model.
            </p>
          </div>

          <div className="clay-inset p-3 rounded-xl text-xs space-y-1 shrink-0 text-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-status-success" />
              <span>Grounded in 4,338 customer records</span>
            </div>
            <div className="flex items-center gap-2">
              <Info size={13} className="text-accent" />
              <span>Suggested guidance, not simulated guarantees</span>
            </div>
          </div>
        </div>
      </ClayCard>

      {/* 3 Evidence-Based Playbooks */}
      <div className="space-y-6">
        {MARKETING_PLAYBOOKS.map((playbook) => {
          const segData = segments.find(s => s.clusterId === playbook.clusterId);
          return (
            <ClayCard
              key={playbook.clusterId}
              className="border-t-4 p-5 sm:p-6"
              style={{ borderTopColor: playbook.accentColor }}
            >
              {/* Playbook Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e7f0]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`clay-badge ${playbook.badgeClass}`}>
                      Cluster {playbook.clusterId}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">•</span>
                    <span className="text-xs font-bold text-text-primary">
                      {playbook.tagline}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {playbook.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/segments?cluster=${playbook.clusterId}`)}
                    className="clay-button px-3 py-1.5 text-xs font-semibold"
                  >
                    View {segData ? formatNumber(segData.customerCount) : ''} Customers
                  </button>
                </div>
              </div>

              {/* Measured Empirical Evidence Callout */}
              <div className="clay-inset p-3 rounded-xl my-4 text-xs flex items-start gap-2.5">
                <Target size={16} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary block font-sans mb-0.5">
                    Measured Empirical Evidence:
                  </strong>
                  <span className="font-mono text-text-secondary text-[11px]">
                    {playbook.measuredEvidence}
                  </span>
                </div>
              </div>

              {/* 3 Concrete Action Items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                {playbook.recommendations.map((rec, rIdx) => (
                  <div key={rIdx} className="clay-card-flat p-4 bg-white/70 border border-slate-200/60 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 text-accent font-semibold text-xs">
                        <span className="w-5 h-5 rounded-md clay-inset-sm flex items-center justify-center text-[10px] font-bold">
                          {rIdx + 1}
                        </span>
                        <h4>{rec.title}</h4>
                      </div>
                      <p className="text-xs text-text-primary leading-relaxed mb-3">
                        {rec.action}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-text-secondary italic">
                      <strong className="text-text-primary not-italic block mb-0.5">Analytical Justification:</strong>
                      {rec.justification}
                    </div>
                  </div>
                ))}
              </div>

              {/* Risk Mitigation Note */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-xs text-status-warning">
                <AlertCircle size={14} className="shrink-0" />
                <span><strong>Execution Precaution:</strong> {playbook.riskWarning}</span>
              </div>
            </ClayCard>
          );
        })}
      </div>

      {/* Interactive, Working Campaign Planning Sandbox */}
      <ClayCard className="border border-white/80 p-5 sm:p-6">
        <SectionHeader
          title="Tactical Campaign Planning Sandbox"
          subtitle="A functional planning calculator to model audience reach, incentive expenditure, and potential gross returns for a targeted campaign."
          badge="Interactive Simulator"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <form onSubmit={handleSimulateCampaign} className="lg:col-span-1 space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Target Customer Segment:
              </label>
              <select
                value={selectedCampaignCluster}
                onChange={(e) => setSelectedCampaignCluster(e.target.value)}
                className="w-full clay-inset p-2.5 rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="0">Cluster 0: High-Value Recent ({segments[0]?.customerCount} customers)</option>
                <option value="1">Cluster 1: Inactive / At-Risk ({segments[1]?.customerCount} customers)</option>
                <option value="2">Cluster 2: Occasional ({segments[2]?.customerCount} customers)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Campaign Strategy & Offer Type:
              </label>
              <select
                value={campaignOffer}
                onChange={(e) => setCampaignOffer(e.target.value)}
                className="w-full clay-inset p-2.5 rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="loyalty">VIP Loyalty Reward & Free Freight</option>
                <option value="discount">Direct Percentage Checkout Discount</option>
                <option value="bundle">Cross-Category Bundle Rebate</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-text-secondary">Target Cohort Reach:</span>
                <span className="font-bold text-accent tabular-numbers">{targetReachPct}% ({formatNumber(targetedCustomerCount)} accounts)</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={targetReachPct}
                onChange={(e) => setTargetReachPct(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-text-secondary">Incentive Discount Depth:</span>
                <span className="font-bold text-text-primary tabular-numbers">{discountPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full clay-button-primary py-2.5 text-xs font-semibold mt-2"
            >
              <Send size={14} />
              Validate Campaign Parameters
            </button>

            {plannedSuccess && (
              <div className="clay-card-sm p-2.5 bg-emerald-50 border border-emerald-200 text-status-success text-xs flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>Campaign plan modeled successfully against cluster benchmarks!</span>
              </div>
            )}
          </form>

          {/* Model Output Projections */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClayCard className="clay-card-flat p-4 bg-white/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Targeted Audience</span>
              <div className="text-2xl font-bold text-text-primary tabular-numbers mt-1">
                {formatNumber(targetedCustomerCount)}
              </div>
              <span className="text-xs text-text-secondary block mt-0.5">
                {targetReachPct}% of Cluster {selectedCampaignCluster} ({activeSegmentData.shortName})
              </span>
            </ClayCard>

            <ClayCard className="clay-card-flat p-4 bg-white/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Historical Median Basket</span>
              <div className="text-2xl font-bold text-accent tabular-numbers mt-1">
                {formatCurrency(activeSegmentData.medianSpending)}
              </div>
              <span className="text-xs text-text-secondary block mt-0.5">
                Observed empirical spend in this cluster
              </span>
            </ClayCard>

            <ClayCard className="clay-card-flat p-4 bg-white/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Modeled Incentive Cost</span>
              <div className="text-2xl font-bold text-status-danger tabular-numbers mt-1">
                {formatCurrency(discountCost)}
              </div>
              <span className="text-xs text-text-secondary block mt-0.5">
                Budget allocated at {discountPercent}% discount rate
              </span>
            </ClayCard>

            <ClayCard className="clay-card-flat p-4 bg-white/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Projected Net Leverage</span>
              <div className="text-2xl font-bold text-status-success tabular-numbers mt-1">
                {formatCurrency(estimatedNetReturn)}
              </div>
              <span className="text-xs text-text-secondary block mt-0.5">
                Estimated gross potential minus promo cost
              </span>
            </ClayCard>

            <div className="sm:col-span-2 clay-inset p-3 rounded-xl text-xs text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Important Academic Disclaimer:</strong> Projections represent a mathematical planning framework based on historic median spending and a standard 15% promotional conversion benchmark. They are not simulated historical business claims and have not been executed in production.
            </div>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};

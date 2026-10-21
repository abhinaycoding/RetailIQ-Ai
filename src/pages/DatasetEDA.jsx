import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Database,
  FileSpreadsheet,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Globe2,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MissingValuesChart } from '../components/charts/MissingValuesChart';
import { CountryRevenueChart } from '../components/charts/CountryRevenueChart';
import { RFMDistributionChart } from '../components/charts/RFMDistributionChart';
import {
  DATASET_OVERVIEW,
  DATA_DICTIONARY,
  TRANSACTION_QUANTITY_SUMMARY,
  UNIT_PRICE_SUMMARY
} from '../data/edaMetadata';
import { formatNumber, formatPercent } from '../utils/formatters';

export const DatasetEDA = () => {
  const { distributions } = useOutletContext();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Dataset Statistics Matrix: Original vs Cleaned */}
      <div>
        <SectionHeader
          title="UCI Online Retail Dataset Overview"
          subtitle="Empirical comparison of original raw transactional records versus cleaned customer-level RFM vectors."
          badge="Data Audit"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <ClayCard className="p-3 text-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Raw Records</span>
            <div className="text-base sm:text-lg font-bold text-text-primary tabular-numbers mt-0.5">
              {formatNumber(DATASET_OVERVIEW.originalRecords)}
            </div>
            <span className="text-[10px] text-text-secondary">Transactions</span>
          </ClayCard>

          <ClayCard className="p-3 text-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Features</span>
            <div className="text-base sm:text-lg font-bold text-text-primary tabular-numbers mt-0.5">
              {DATASET_OVERVIEW.originalFeatures}
            </div>
            <span className="text-[10px] text-text-secondary">Variables</span>
          </ClayCard>

          <ClayCard className="p-3 text-center border-amber-200/60">
            <span className="text-[10px] font-bold text-status-warning uppercase">Missing Cust ID</span>
            <div className="text-base sm:text-lg font-bold text-status-warning tabular-numbers mt-0.5">
              {formatNumber(DATASET_OVERVIEW.originalMissingCustomerID)}
            </div>
            <span className="text-[10px] text-text-secondary">24.93% rows</span>
          </ClayCard>

          <ClayCard className="p-3 text-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Missing Desc</span>
            <div className="text-base sm:text-lg font-bold text-text-primary tabular-numbers mt-0.5">
              {formatNumber(DATASET_OVERVIEW.originalMissingDescription)}
            </div>
            <span className="text-[10px] text-text-secondary">0.27% rows</span>
          </ClayCard>

          <ClayCard className="p-3 text-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Duplicates</span>
            <div className="text-base sm:text-lg font-bold text-text-primary tabular-numbers mt-0.5">
              {formatNumber(DATASET_OVERVIEW.originalDuplicateRows)}
            </div>
            <span className="text-[10px] text-text-secondary">Exact dupes</span>
          </ClayCard>

          <ClayCard className="p-3 text-center border-emerald-200/60">
            <span className="text-[10px] font-bold text-status-success uppercase">Cleaned Rows</span>
            <div className="text-base sm:text-lg font-bold text-status-success tabular-numbers mt-0.5">
              {formatNumber(DATASET_OVERVIEW.cleanedTransactions)}
            </div>
            <span className="text-[10px] text-text-secondary">Positive valid</span>
          </ClayCard>

          <ClayCard className="p-3 text-center border-indigo-200/60">
            <span className="text-[10px] font-bold text-accent uppercase">RFM Customers</span>
            <div className="text-base sm:text-lg font-bold text-accent tabular-numbers mt-0.5">
              {formatNumber(DATASET_OVERVIEW.rfmCustomers)}
            </div>
            <span className="text-[10px] text-text-secondary">Unique buyers</span>
          </ClayCard>

          <ClayCard className="p-3 text-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Time Horizon</span>
            <div className="text-base sm:text-lg font-bold text-text-primary mt-0.5 text-xs">
              1y 8d
            </div>
            <span className="text-[10px] text-text-secondary">2010–2011</span>
          </ClayCard>
        </div>
      </div>

      {/* EDA Charts Row 1: Missing Values & Country Dominance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClayCard>
          <SectionHeader
            title="Missing Data Proportion by Column"
            subtitle="CustomerID is the primary data quality vulnerability (24.93% missing from guest transactions)."
            badge="Data Quality"
          />
          <MissingValuesChart />
          <div className="mt-3 p-3 clay-inset rounded-xl text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Examiner Viva Note:</strong> Transactions lacking a <code>CustomerID</code> cannot be tracked across time to compute Recency and Frequency. Imputation is methodologically unsound for identity variables, necessitating their exclusion from customer-level RFM modeling.
          </div>
        </ClayCard>

        <ClayCard>
          <SectionHeader
            title="Revenue Distribution by Geographic Region"
            subtitle="The United Kingdom accounts for 83.9% of net positive transaction value and 91% of customers."
            badge="Geographic Skew"
          />
          <CountryRevenueChart />
          <div className="mt-3 p-3 clay-inset rounded-xl text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Analytical Finding:</strong> The customer base is heavily localized to the UK, but international wholesale buyers in the Netherlands, EIRE, Germany, and France contribute meaningful average basket volumes despite low buyer counts.
          </div>
        </ClayCard>
      </div>

      {/* EDA Distribution Row 2: Customer RFM Histograms */}
      <ClayCard>
        <SectionHeader
          title="Customer RFM Feature Distributions (Derived from CSV)"
          subtitle="Empirical distributions of Recency (days), Frequency (invoices), and Monetary Spending (£) across the 4,338 customers."
          badge="RFM Distributions"
        />
        <RFMDistributionChart distributions={distributions} />
      </ClayCard>

      {/* Parametric Skewness Analysis: Quantity & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClayCard>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={18} className="text-accent" />
            <h3 className="text-sm font-bold text-text-primary">
              {TRANSACTION_QUANTITY_SUMMARY.metric}
            </h3>
          </div>
          <div className="clay-inset p-3.5 rounded-xl space-y-2 text-xs mb-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Distribution Skewness:</span>
              <strong className="text-status-danger">{TRANSACTION_QUANTITY_SUMMARY.skewness}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Interquartile Range:</span>
              <strong className="text-text-primary tabular-numbers">Q1: {TRANSACTION_QUANTITY_SUMMARY.q25} | Median: {TRANSACTION_QUANTITY_SUMMARY.median} | Q3: {TRANSACTION_QUANTITY_SUMMARY.q75}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Observed Extreme Max:</span>
              <strong className="text-text-primary tabular-numbers">{formatNumber(TRANSACTION_QUANTITY_SUMMARY.max)} units</strong>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {TRANSACTION_QUANTITY_SUMMARY.insight}
          </p>
        </ClayCard>

        <ClayCard>
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet size={18} className="text-accent" />
            <h3 className="text-sm font-bold text-text-primary">
              {UNIT_PRICE_SUMMARY.metric}
            </h3>
          </div>
          <div className="clay-inset p-3.5 rounded-xl space-y-2 text-xs mb-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Typical Price Range (IQR):</span>
              <strong className="text-text-primary tabular-numbers">£{UNIT_PRICE_SUMMARY.q25.toFixed(2)} – £{UNIT_PRICE_SUMMARY.q75.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Median Unit Price:</span>
              <strong className="text-text-primary tabular-numbers">£{UNIT_PRICE_SUMMARY.median.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Raw Outliers Filtered:</span>
              <strong className="text-status-warning">Manual bad-debt writeoffs (up to £38,970)</strong>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {UNIT_PRICE_SUMMARY.insight}
          </p>
        </ClayCard>
      </div>

      {/* Comprehensive Data Dictionary */}
      <ClayCard>
        <SectionHeader
          title="UCI Online Retail Data Dictionary"
          subtitle="Formal schema definitions and field characteristics for all 8 raw transactional attributes."
          badge="Feature Specification"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-secondary/70 text-text-secondary border-b border-[#d8dde7]">
                <th className="py-2.5 px-3.5 font-semibold">Field Name</th>
                <th className="py-2.5 px-3.5 font-semibold">Data Type</th>
                <th className="py-2.5 px-3.5 font-semibold">Missing Count</th>
                <th className="py-2.5 px-3.5 font-semibold">Representative Example</th>
                <th className="py-2.5 px-3.5 font-semibold">Analytical Meaning & Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6ebf3]">
              {DATA_DICTIONARY.map((field) => (
                <tr key={field.field} className="hover:bg-white/50 transition-colors">
                  <td className="py-2.5 px-3.5 font-mono font-bold text-accent">
                    {field.field}
                  </td>
                  <td className="py-2.5 px-3.5 text-text-secondary">
                    {field.type}
                  </td>
                  <td className="py-2.5 px-3.5 tabular-numbers font-medium">
                    {field.missingCount > 0 ? (
                      <span className="text-status-danger font-semibold">
                        {formatNumber(field.missingCount)} ({formatPercent((field.missingCount / DATASET_OVERVIEW.originalRecords) * 100)})
                      </span>
                    ) : (
                      <span className="text-status-success font-semibold">0 (Complete)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-[11px] text-text-muted">
                    {field.example}
                  </td>
                  <td className="py-2.5 px-3.5 text-text-secondary leading-snug">
                    {field.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClayCard>
    </div>
  );
};

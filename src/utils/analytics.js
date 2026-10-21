/**
 * Analytics and statistical calculation helpers
 */

export const CLUSTER_DEFINITIONS = {
  0: {
    id: 0,
    name: "High-Value Recent Customers",
    shortName: "High-Value",
    tagline: "Frequent high-spenders who bought recently",
    color: "#526DDB",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-300",
    description: "Dominant revenue driver. Low recency, high frequency, and high total spending. Often wholesale or repeat commercial buyers.",
    characteristics: "Median Recency ~17d | Median Frequency ~7 orders | Median Spending ~£2,570.50"
  },
  1: {
    id: 1,
    name: "Inactive / At-Risk Customers",
    shortName: "At-Risk",
    tagline: "Lapsed one-time buyers with high recency",
    color: "#D85E69",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-300",
    description: "High recency (over 8 months since last purchase) with single small orders. At imminent risk of permanent churn.",
    characteristics: "Median Recency ~253d | Median Frequency ~1 order | Median Spending ~£290.51"
  },
  2: {
    id: 2,
    name: "Occasional Customers",
    shortName: "Occasional",
    tagline: "Moderate recency and low-to-medium basket size",
    color: "#27876D",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Largest customer cohort. Purchased within last 1–3 months with 2 invoices on average. Prime candidates for repeat engagement.",
    characteristics: "Median Recency ~45d | Median Frequency ~2 orders | Median Spending ~£508.80"
  }
};

/**
 * Computes histogram bins for an array of numbers
 */
export const computeHistogram = (values, binCount = 10, labelPrefix = "") => {
  if (!values || values.length === 0) return [];
  const cleanVals = values.filter(v => v !== null && !isNaN(v) && v >= 0);
  if (cleanVals.length === 0) return [];
  
  const min = Math.min(...cleanVals);
  const max = Math.max(...cleanVals);
  
  if (min === max) {
    return [{ bin: `${min}`, count: cleanVals.length, range: [min, max] }];
  }
  
  const step = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    binStart: min + i * step,
    binEnd: min + (i + 1) * step,
    bin: `${labelPrefix}${Math.round(min + i * step)}–${Math.round(min + (i + 1) * step)}`,
    count: 0
  }));
  
  cleanVals.forEach(v => {
    let idx = Math.floor((v - min) / step);
    if (idx >= binCount) idx = binCount - 1;
    bins[idx].count++;
  });
  
  return bins;
};

/**
 * Quantiles helper
 */
export const computeQuantile = (sortedArr, q) => {
  if (!sortedArr.length) return 0;
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  }
  return sortedArr[base];
};

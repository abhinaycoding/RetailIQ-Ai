/**
 * Documented EDA Metadata & Preprocessing Statistics
 * Derived strictly from the UCI Online Retail dataset and Colab ML experiment.
 */

export const DATASET_OVERVIEW = {
  name: "Online Retail Dataset",
  source: "UCI Machine Learning Repository",
  citationUrl: "https://archive.ics.uci.edu/dataset/352/online+retail",
  timeframe: "01/12/2010 – 09/12/2011 (1 year 8 days)",
  businessContext: "UK-based registered non-store online retail selling unique all-occasion gift-ware. Many customers are wholesalers.",
  originalRecords: 541909,
  originalFeatures: 8,
  originalMissingCustomerID: 135080,
  originalMissingDescription: 1454,
  originalDuplicateRows: 5268,
  cleanedTransactions: 392692,
  rfmCustomers: 4338,
  currency: "GBP (£)",
  referenceDateDerived: "2011-12-10", // max purchase date + 1 day
};

export const DATA_DICTIONARY = [
  {
    field: "InvoiceNo",
    type: "Nominal / String",
    description: "6-digit integral number uniquely assigned to each transaction. Codes starting with 'C' indicate a cancellation.",
    missingCount: 0,
    example: "536365, C536379"
  },
  {
    field: "StockCode",
    type: "Nominal / String",
    description: "5-digit integral number uniquely assigned to each distinct product/SKU.",
    missingCount: 0,
    example: "85123A, 71053"
  },
  {
    field: "Description",
    type: "Nominal / Text",
    description: "Product (item) name. 1,454 records in raw dataset had missing description.",
    missingCount: 1454,
    example: "WHITE HANGING HEART T-LIGHT HOLDER"
  },
  {
    field: "Quantity",
    type: "Numeric / Integer",
    description: "The quantities of each product per transaction. Negative values indicate cancellations or stock adjustments.",
    missingCount: 0,
    example: "6, 24, 80995"
  },
  {
    field: "InvoiceDate",
    type: "Datetime",
    description: "The day and time when each transaction was generated. Spans from 2010-12-01 08:26 to 2011-12-09 12:50.",
    missingCount: 0,
    example: "2010-12-01 08:26:00"
  },
  {
    field: "UnitPrice",
    type: "Numeric / Float",
    description: "Product price per unit in sterling (£). Cleaned to exclude non-positive/zero pricing adjustments.",
    missingCount: 0,
    example: "£2.55, £3.39"
  },
  {
    field: "CustomerID",
    type: "Nominal / Integer",
    description: "5-digit integral number uniquely assigned to each customer. 135,080 missing in raw data (unregistered guest checkouts).",
    missingCount: 135080,
    example: "17850, 13047"
  },
  {
    field: "Country",
    type: "Nominal / Category",
    description: "The name of the country where each customer resides. 38 unique countries represented in total.",
    missingCount: 0,
    example: "United Kingdom, Germany, France"
  }
];

export const MISSING_VALUES_ANALYSIS = [
  { column: "CustomerID", missing: 135080, pct: 24.93, status: "Critical — Required customer-level identification" },
  { column: "Description", missing: 1454, pct: 0.27, status: "Minor — Product metadata absence" },
  { column: "InvoiceNo", missing: 0, pct: 0.0, status: "Complete" },
  { column: "StockCode", missing: 0, pct: 0.0, status: "Complete" },
  { column: "Quantity", missing: 0, pct: 0.0, status: "Complete" },
  { column: "InvoiceDate", missing: 0, pct: 0.0, status: "Complete" },
  { column: "UnitPrice", missing: 0, pct: 0.0, status: "Complete" },
  { column: "Country", missing: 0, pct: 0.0, status: "Complete" }
];

export const PREPROCESSING_PIPELINE = [
  {
    step: 1,
    name: "Raw Transaction Dataset",
    description: "Initial import of UCI Online Retail transaction logs.",
    inputCount: 541909,
    outputCount: 541909,
    removedCount: 0,
    rationale: "Original transactional logs across 38 countries."
  },
  {
    step: 2,
    name: "Duplicate Removal",
    description: "Identification and removal of exact identical transaction records.",
    inputCount: 541909,
    outputCount: 536641,
    removedCount: 5268,
    rationale: "Eliminates accidental re-submissions and duplicate system logging."
  },
  {
    step: 3,
    name: "Missing CustomerID Filter",
    description: "Removal of transactions without a registered customer identifier.",
    inputCount: 536641,
    outputCount: 401604,
    removedCount: 135037,
    rationale: "RFM customer-level segmentation requires tracking repeat customer purchase history over time."
  },
  {
    step: 4,
    name: "Cancellation Invoice Filtering",
    description: "Removal of invoices starting with 'C' (cancellations and returns).",
    inputCount: 401604,
    outputCount: 397272,
    removedCount: 4332,
    rationale: "Ensures customer monetary and frequency metrics reflect completed, positive purchases."
  },
  {
    step: 5,
    name: "Non-Positive Quantity & UnitPrice Filter",
    description: "Filtering records where Quantity <= 0 or UnitPrice <= 0.",
    inputCount: 397272,
    outputCount: 392692,
    removedCount: 4580,
    rationale: "Discards bad debts, damaged inventory adjustments, and free sample giveaways."
  },
  {
    step: 6,
    name: "Revenue Calculation & Monetary Aggregation",
    description: "Calculated Revenue = Quantity × UnitPrice per line item.",
    inputCount: 392692,
    outputCount: 392692,
    removedCount: 0,
    rationale: "Establishes gross transactional value for each basket."
  },
  {
    step: 7,
    name: "Customer-Level RFM Aggregation",
    description: "Aggregated 392,692 transactions into 4,338 unique customer profiles.",
    inputCount: 392692,
    outputCount: 4338,
    removedCount: 0,
    rationale: "Recency (days to 2011-12-10), Frequency (count of distinct invoices), Monetary (sum of total revenue)."
  },
  {
    step: 8,
    name: "Log Transformation & Standard Scaling",
    description: "Applied np.log1p to correct high positive skewness, followed by StandardScaler (mean=0, std=1).",
    inputCount: 4338,
    outputCount: 4338,
    removedCount: 0,
    rationale: "Distance-based clustering algorithms (Euclidean distance in K-Means/Hierarchical) are otherwise heavily distorted by extreme monetary outliers."
  }
];

export const COUNTRY_REVENUE_DISTRIBUTION = [
  { country: "United Kingdom", revenue: 7458142, pct: 83.9, customers: 3950 },
  { country: "Netherlands", revenue: 285446, pct: 3.2, customers: 9 },
  { country: "EIRE", revenue: 263276, pct: 2.9, customers: 3 },
  { country: "Germany", revenue: 228867, pct: 2.5, customers: 95 },
  { country: "France", revenue: 209715, pct: 2.3, customers: 87 },
  { country: "Australia", revenue: 138521, pct: 1.5, customers: 9 },
  { country: "Switzerland", revenue: 56443, pct: 0.6, customers: 21 },
  { country: "Spain", revenue: 54774, pct: 0.6, customers: 31 },
  { country: "Belgium", revenue: 41196, pct: 0.5, customers: 25 },
  { country: "Sweden", revenue: 38378, pct: 0.4, customers: 8 },
  { country: "Other (28 Countries)", revenue: 145000, pct: 1.6, customers: 100 }
];

export const TRANSACTION_QUANTITY_SUMMARY = {
  metric: "Transaction Quantity Distribution",
  skewness: "Extremely right-skewed (+458.2 in raw, +28.4 in cleaned)",
  min: 1,
  q25: 1,
  median: 3,
  q75: 10,
  max: 80995,
  insight: "Wholesale retail pattern: 75% of purchases are 10 items or fewer, while a small group of commercial buyers make bulk wholesale orders in hundreds or thousands of units."
};

export const UNIT_PRICE_SUMMARY = {
  metric: "Unit Price Distribution",
  currency: "£",
  min: 0.001,
  q25: 1.25,
  median: 2.08,
  q75: 4.13,
  max: 38970.0,
  insight: "The vast majority of SKUs are giftware priced under £5. Extreme prices in raw data (e.g. £38,970) represented manual accounting adjustments or Amazon fees, which were successfully filtered."
};

/**
 * RetailIQ Customer Segmentation & Analytics Engine
 * Calculates Recency, Frequency, and Monetary (RFM) metrics from raw transactions
 * and segments customers into actionable business cohorts.
 */

export const BUSINESS_SEGMENTS = {
  highValue: {
    id: 0,
    name: 'High-Value Customers',
    shortName: 'High-Value VIPs',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    color: '#2563EB',
    tagline: 'Top spending accounts with repeat order frequency',
    description: 'Your most valuable customer cohort. They shop frequently and generate the bulk of total revenue.',
    action: 'Reward with VIP loyalty perks, early access to new lines, and dedicated premier support.'
  },
  atRisk: {
    id: 1,
    name: 'At-Risk / Inactive Customers',
    shortName: 'At-Risk Buyers',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    color: '#E11D48',
    tagline: 'Lapsed accounts that haven\'t purchased in several months',
    description: 'Customers whose purchase frequency has dropped and who are at imminent risk of permanent churn.',
    action: 'Send win-back campaigns, feedback surveys, or limited-time reactivation discounts.'
  },
  occasional: {
    id: 2,
    name: 'Occasional / Growing Customers',
    shortName: 'Occasional Buyers',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    color: '#059669',
    tagline: 'Moderate recency with potential to become repeat buyers',
    description: 'Your largest customer group. They have purchased recently with 1–2 orders and have high expansion potential.',
    action: 'Encourage a 2nd or 3rd purchase through bundle discounts and product recommendations.'
  }
};

/**
 * Helper to parse various date formats (ISO, YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY HH:mm)
 */
export const parseDateString = (rawDate) => {
  if (!rawDate) return null;
  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) return rawDate;

  const str = String(rawDate).trim();

  // Handle DD-MM-YYYY or DD/MM/YYYY with optional time (common in UK / European CSVs)
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const [, day, month, year, hour = 0, min = 0, sec = 0] = dmyMatch;
    const parsed = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(min, 10), parseInt(sec, 10));
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Fallback to standard JavaScript date parsing (e.g. YYYY-MM-DD, ISO 8601)
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Parses and processes raw transactional data into customer RFM profiles and business cohorts
 */
export const processTransactions = (rawRows, columnMapping) => {
  const {
    customerIdCol,
    orderIdCol,
    dateCol,
    quantityCol,
    unitPriceCol,
    totalAmountCol
  } = columnMapping;

  const customerMap = new Map();
  let latestTimestamp = 0;
  let earliestTimestamp = Infinity;
  let totalValidOrders = new Set();
  let totalRevenue = 0;
  const monthlyRevenueMap = new Map();

  let validRowsCount = 0;
  let invalidRowsCount = 0;

  for (const row of rawRows) {
    const rawCustId = row[customerIdCol];
    if (rawCustId === undefined || rawCustId === null || String(rawCustId).trim() === '') {
      invalidRowsCount++;
      continue;
    }

    const customerId = String(rawCustId).trim();
    const orderId = row[orderIdCol] ? String(row[orderIdCol]).trim() : `ORD-${customerId}`;
    
    // Determine line total: support either direct Total Amount OR Quantity * Unit Price
    let lineTotal = 0;
    if (totalAmountCol && row[totalAmountCol] !== undefined && row[totalAmountCol] !== null && String(row[totalAmountCol]).trim() !== '') {
      lineTotal = Number(row[totalAmountCol]);
      if (isNaN(lineTotal) || lineTotal <= 0) {
        invalidRowsCount++;
        continue;
      }
    } else {
      const qty = Number(row[quantityCol]);
      const price = Number(row[unitPriceCol]);

      if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
        invalidRowsCount++;
        continue;
      }
      lineTotal = qty * price;
    }

    // Parse date
    const dateObj = parseDateString(row[dateCol]);
    const isValidDate = dateObj !== null;
    const timestamp = isValidDate ? dateObj.getTime() : Date.now();

    if (timestamp > latestTimestamp) latestTimestamp = timestamp;
    if (timestamp < earliestTimestamp) earliestTimestamp = timestamp;

    totalRevenue += lineTotal;
    totalValidOrders.add(orderId);
    validRowsCount++;

    // Monthly revenue aggregation
    if (isValidDate) {
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyRevenueMap.get(monthKey) || { revenue: 0, orders: new Set() };
      existing.revenue += lineTotal;
      existing.orders.add(orderId);
      monthlyRevenueMap.set(monthKey, existing);
    }

    // Customer aggregation
    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        id: customerId,
        orders: new Set(),
        totalSpend: 0,
        latestDate: timestamp,
        firstDate: timestamp
      });
    }

    const cust = customerMap.get(customerId);
    cust.orders.add(orderId);
    cust.totalSpend += lineTotal;
    if (timestamp > cust.latestDate) cust.latestDate = timestamp;
    if (timestamp < cust.firstDate) cust.firstDate = timestamp;
  }

  if (customerMap.size === 0) {
    throw new Error(
      `No valid customer records could be extracted from the uploaded CSV (${rawRows.length.toLocaleString()} rows checked). ` +
      `Please ensure Customer ID, and either (Quantity & Unit Price) or Total Amount are mapped to columns containing valid, positive values.`
    );
  }

  // Anchor date: 1 day after the latest purchase date
  const anchorDate = new Date(latestTimestamp + 24 * 60 * 60 * 1000);
  const anchorTime = anchorDate.getTime();

  // Convert map to customer list and compute RFM
  const customerList = [];
  customerMap.forEach((cust) => {
    const daysSinceLast = Math.max(0, Math.floor((anchorTime - cust.latestDate) / (1000 * 60 * 60 * 24)));
    const orderCount = cust.orders.size;
    const monetary = Math.round(cust.totalSpend * 100) / 100;

    customerList.push({
      id: cust.id,
      recency: daysSinceLast,
      frequency: orderCount,
      monetary: monetary,
      lastPurchase: new Date(cust.latestDate).toISOString().slice(0, 10),
      firstPurchase: new Date(cust.firstDate).toISOString().slice(0, 10),
      avgOrderValue: orderCount > 0 ? Math.round((monetary / orderCount) * 100) / 100 : monetary
    });
  });

  // Perform dynamic business segmentation using standard thresholds
  // Sort monetary and recency to calculate cohort cutoffs
  const sortedMonetary = [...customerList.map(c => c.monetary)].sort((a, b) => a - b);
  const sortedRecency = [...customerList.map(c => c.recency)].sort((a, b) => a - b);

  const p75Monetary = sortedMonetary[Math.floor(sortedMonetary.length * 0.75)] || 1000;
  const p60Recency = sortedRecency[Math.floor(sortedRecency.length * 0.60)] || 90;

  const segmentedCustomers = customerList.map((c) => {
    let segmentKey = 'occasional';

    if (c.monetary >= p75Monetary || (c.frequency >= 4 && c.recency <= p60Recency)) {
      segmentKey = 'highValue';
    } else if (c.recency > p60Recency && c.frequency <= 2) {
      segmentKey = 'atRisk';
    } else {
      segmentKey = 'occasional';
    }

    const segInfo = BUSINESS_SEGMENTS[segmentKey];

    return {
      ...c,
      cluster: segInfo.id,
      segmentKey,
      segmentName: segInfo.name,
      segmentShortName: segInfo.shortName,
      segmentBadge: segInfo.badgeClass,
      segmentColor: segInfo.color,
      logMonetary: c.monetary > 0 ? Math.log10(c.monetary) : 0,
    };
  });

  // Calculate segment level metrics
  const segments = Object.entries(BUSINESS_SEGMENTS).map(([key, info]) => {
    const cohort = segmentedCustomers.filter(c => c.segmentKey === key);
    const count = cohort.length;
    const cohortRevenue = cohort.reduce((acc, c) => acc + c.monetary, 0);
    
    // Calculate medians
    const sortedRec = [...cohort.map(c => c.recency)].sort((a, b) => a - b);
    const sortedFreq = [...cohort.map(c => c.frequency)].sort((a, b) => a - b);
    const sortedSpend = [...cohort.map(c => c.monetary)].sort((a, b) => a - b);
    const mid = Math.floor(count / 2);

    return {
      clusterId: info.id,
      key,
      name: info.name,
      shortName: info.shortName,
      tagline: info.tagline,
      badgeClass: info.badgeClass,
      color: info.color,
      description: info.description,
      action: info.action,
      customerCount: count,
      pctOfCustomers: customerList.length > 0 ? (count / customerList.length) * 100 : 0,
      totalSpending: Math.round(cohortRevenue * 100) / 100,
      pctOfRevenue: totalRevenue > 0 ? (cohortRevenue / totalRevenue) * 100 : 0,
      medianRecency: count > 0 ? sortedRec[mid] : 0,
      medianFrequency: count > 0 ? sortedFreq[mid] : 0,
      medianSpending: count > 0 ? sortedSpend[mid] : 0,
    };
  });

  // Format sales timeline sorted by month
  const salesTimeline = Array.from(monthlyRevenueMap.entries())
    .map(([month, data]) => ({
      date: month,
      revenue: Math.round(data.revenue),
      orders: data.orders.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Repeat customer rate (customers with >1 order)
  const repeatCustomersCount = customerList.filter(c => c.frequency > 1).length;
  const repeatRate = customerList.length > 0 ? (repeatCustomersCount / customerList.length) * 100 : 0;
  const totalOrdersCount = totalValidOrders.size;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  return {
    customers: segmentedCustomers,
    segments,
    salesTimeline,
    summary: {
      totalCustomers: customerList.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: totalOrdersCount,
      repeatCustomerRate: Math.round(repeatRate * 10) / 10,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      referenceDate: anchorDate.toISOString().slice(0, 10),
      minDate: new Date(earliestTimestamp).toISOString().slice(0, 10),
      maxDate: new Date(latestTimestamp).toISOString().slice(0, 10),
      validRowsCount,
      invalidRowsCount
    }
  };
};

/**
 * Processes pre-aggregated customer RFM summary datasets (e.g. from CRM exports or retailiq_customers.csv)
 */
export const processCustomerRFM = (rawRows, columnMapping) => {
  const {
    customerIdCol,
    monetaryCol,
    frequencyCol,
    recencyCol,
    lastPurchaseCol,
    clusterCol
  } = columnMapping;

  const customerList = [];
  let totalRevenue = 0;
  let totalOrders = 0;
  let latestTimestamp = 0;
  let earliestTimestamp = Infinity;
  const monthlyRevenueMap = new Map();

  let validRowsCount = 0;
  let invalidRowsCount = 0;

  for (const row of rawRows) {
    const rawId = row[customerIdCol];
    if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
      invalidRowsCount++;
      continue;
    }

    const id = String(rawId).trim();
    const monetary = Math.max(0, Math.round((Number(row[monetaryCol]) || 0) * 100) / 100);
    const frequency = Math.max(1, Math.round(Number(row[frequencyCol]) || 1));

    let recency = Number(row[recencyCol]);
    let lastPurchaseStr = row[lastPurchaseCol] ? String(row[lastPurchaseCol]).slice(0, 10) : '';

    if (isNaN(recency) && lastPurchaseStr) {
      const d = parseDateString(lastPurchaseStr);
      if (d) {
        const time = d.getTime();
        if (time > latestTimestamp) latestTimestamp = time;
        if (time < earliestTimestamp) earliestTimestamp = time;
        recency = Math.max(0, Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24)));
      } else {
        recency = 30;
      }
    } else if (isNaN(recency)) {
      recency = 30;
    }

    if (!lastPurchaseStr) {
      const d = new Date(Date.now() - recency * 86400000);
      lastPurchaseStr = d.toISOString().slice(0, 10);
      const time = d.getTime();
      if (time > latestTimestamp) latestTimestamp = time;
      if (time < earliestTimestamp) earliestTimestamp = time;
    }

    totalRevenue += monetary;
    totalOrders += frequency;
    validRowsCount++;

    const monthKey = lastPurchaseStr.slice(0, 7);
    if (monthKey && monthKey.length === 7) {
      const existing = monthlyRevenueMap.get(monthKey) || { revenue: 0, orders: 0 };
      existing.revenue += monetary;
      existing.orders += frequency;
      monthlyRevenueMap.set(monthKey, existing);
    }

    const rawCluster = clusterCol && row[clusterCol] !== undefined ? Number(row[clusterCol]) : undefined;

    customerList.push({
      id,
      recency,
      frequency,
      monetary,
      lastPurchase: lastPurchaseStr,
      firstPurchase: lastPurchaseStr,
      avgOrderValue: frequency > 0 ? Math.round((monetary / frequency) * 100) / 100 : monetary,
      rawCluster
    });
  }

  if (customerList.length === 0) {
    throw new Error(
      `No valid customer records could be extracted from the uploaded CSV (${rawRows.length.toLocaleString()} rows checked). ` +
      `Please ensure Customer ID, Monetary, and Frequency columns are correctly selected.`
    );
  }

  // Calculate cutoffs
  const sortedMonetary = [...customerList.map(c => c.monetary)].sort((a, b) => a - b);
  const sortedRecency = [...customerList.map(c => c.recency)].sort((a, b) => a - b);
  const p75Monetary = sortedMonetary[Math.floor(sortedMonetary.length * 0.75)] || 1000;
  const p60Recency = sortedRecency[Math.floor(sortedRecency.length * 0.60)] || 90;

  const clusterIdToKey = { 0: 'highValue', 1: 'atRisk', 2: 'occasional' };

  const segmentedCustomers = customerList.map(c => {
    let segmentKey = 'occasional';
    if (c.rawCluster !== undefined && clusterIdToKey[c.rawCluster]) {
      segmentKey = clusterIdToKey[c.rawCluster];
    } else if (c.monetary >= p75Monetary || (c.frequency >= 4 && c.recency <= p60Recency)) {
      segmentKey = 'highValue';
    } else if (c.recency > p60Recency && c.frequency <= 2) {
      segmentKey = 'atRisk';
    } else {
      segmentKey = 'occasional';
    }

    const segInfo = BUSINESS_SEGMENTS[segmentKey];
    return {
      ...c,
      cluster: segInfo.id,
      segmentKey,
      segmentName: segInfo.name,
      segmentShortName: segInfo.shortName,
      segmentBadge: segInfo.badgeClass,
      segmentColor: segInfo.color,
      logMonetary: c.monetary > 0 ? Math.log10(c.monetary) : 0
    };
  });

  // Calculate segment level metrics
  const segments = Object.entries(BUSINESS_SEGMENTS).map(([key, info]) => {
    const cohort = segmentedCustomers.filter(c => c.segmentKey === key);
    const count = cohort.length;
    const cohortRevenue = cohort.reduce((acc, c) => acc + c.monetary, 0);

    const sortedRec = [...cohort.map(c => c.recency)].sort((a, b) => a - b);
    const sortedFreq = [...cohort.map(c => c.frequency)].sort((a, b) => a - b);
    const sortedSpend = [...cohort.map(c => c.monetary)].sort((a, b) => a - b);
    const mid = Math.floor(count / 2);

    return {
      clusterId: info.id,
      key,
      name: info.name,
      shortName: info.shortName,
      tagline: info.tagline,
      badgeClass: info.badgeClass,
      color: info.color,
      description: info.description,
      action: info.action,
      customerCount: count,
      pctOfCustomers: customerList.length > 0 ? (count / customerList.length) * 100 : 0,
      totalSpending: Math.round(cohortRevenue * 100) / 100,
      pctOfRevenue: totalRevenue > 0 ? (cohortRevenue / totalRevenue) * 100 : 0,
      medianRecency: count > 0 ? sortedRec[mid] : 0,
      medianFrequency: count > 0 ? sortedFreq[mid] : 0,
      medianSpending: count > 0 ? sortedSpend[mid] : 0
    };
  });

  const salesTimeline = Array.from(monthlyRevenueMap.entries())
    .map(([month, data]) => ({
      date: month,
      revenue: Math.round(data.revenue),
      orders: data.orders
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const repeatCustomersCount = customerList.filter(c => c.frequency > 1).length;
  const repeatRate = customerList.length > 0 ? (repeatCustomersCount / customerList.length) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    customers: segmentedCustomers,
    segments,
    salesTimeline,
    summary: {
      totalCustomers: customerList.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      repeatCustomerRate: Math.round(repeatRate * 10) / 10,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      referenceDate: new Date(latestTimestamp || Date.now()).toISOString().slice(0, 10),
      minDate: earliestTimestamp !== Infinity ? new Date(earliestTimestamp).toISOString().slice(0, 10) : '2010-12-01',
      maxDate: latestTimestamp ? new Date(latestTimestamp).toISOString().slice(0, 10) : '2011-12-09',
      validRowsCount,
      invalidRowsCount
    }
  };
};

/**
 * Universal Dataset Processor that dynamically delegates to transaction or customer summary pipelines
 */
export const processDataset = (rawRows, columnMapping, datasetMode = 'auto') => {
  if (datasetMode === 'customer_rfm') {
    return processCustomerRFM(rawRows, columnMapping);
  }
  return processTransactions(rawRows, columnMapping);
};

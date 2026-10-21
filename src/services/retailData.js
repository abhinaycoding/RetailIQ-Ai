import Papa from 'papaparse';
import { BUSINESS_SEGMENTS } from './segmentationService';

/**
 * Parses a CSV file from URL or File object using PapaParse
 */
export const parseCSVAsync = (source) => {
  return new Promise((resolve, reject) => {
    Papa.parse(source, {
      download: typeof source === 'string',
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn('CSV parsing notices:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

/**
 * Loads the default verified Online Retail Demo dataset
 */
export const loadDemoRetailData = async () => {
  try {
    const [rawCustomers, rawSegments, rawModels] = await Promise.all([
      parseCSVAsync('/data/retailiq_customers.csv'),
      parseCSVAsync('/data/retailiq_segments.csv'),
      parseCSVAsync('/data/retailiq_model_comparison.csv')
    ]);

    if (!rawCustomers || rawCustomers.length === 0) {
      throw new Error('Demo customers dataset (/data/retailiq_customers.csv) is missing or empty.');
    }

    // Map Cluster numbers to Seller Business Segments
    // 0: High-Value VIPs, 1: At-Risk Inactive, 2: Occasional
    const clusterToSegment = {
      0: BUSINESS_SEGMENTS.highValue,
      1: BUSINESS_SEGMENTS.atRisk,
      2: BUSINESS_SEGMENTS.occasional
    };

    let totalOrdersAccumulator = 0;
    const monthlyRevenueMap = new Map();

    const customers = rawCustomers.map((row, idx) => {
      const customerId = row.CustomerID !== undefined ? String(row.CustomerID) : `CUST-${idx}`;
      const recency = Number(row.Recency) || 0;
      const frequency = Number(row.Frequency) || 1;
      const monetary = Number(row.Monetary) || 0;
      const cluster = Number(row.Cluster) !== undefined ? Number(row.Cluster) : 0;
      const lastPurchase = row.LastPurchase ? String(row.LastPurchase).slice(0, 10) : '2011-12-09';
      
      const segInfo = clusterToSegment[cluster] || BUSINESS_SEGMENTS.occasional;
      totalOrdersAccumulator += frequency;

      // Extract month for sales timeline
      if (lastPurchase && lastPurchase.length >= 7) {
        const month = lastPurchase.slice(0, 7);
        const existing = monthlyRevenueMap.get(month) || { revenue: 0, orders: 0 };
        existing.revenue += monetary;
        existing.orders += frequency;
        monthlyRevenueMap.set(month, existing);
      }

      return {
        id: customerId,
        lastPurchase,
        recency,
        frequency,
        monetary,
        cluster,
        segmentKey: cluster === 0 ? 'highValue' : cluster === 1 ? 'atRisk' : 'occasional',
        segmentName: segInfo.name,
        segmentShortName: segInfo.shortName,
        segmentBadge: segInfo.badgeClass,
        segmentColor: segInfo.color,
        logMonetary: monetary > 0 ? Math.log10(monetary) : 0,
        avgOrderValue: frequency > 0 ? Math.round((monetary / frequency) * 100) / 100 : monetary
      };
    });

    const totalCustomers = customers.length;
    const totalRevenue = Math.round(customers.reduce((acc, c) => acc + c.monetary, 0) * 100) / 100;
    const repeatCustomersCount = customers.filter(c => c.frequency > 1).length;
    const repeatCustomerRate = totalCustomers > 0 ? Math.round((repeatCustomersCount / totalCustomers) * 1000) / 10 : 0;
    const avgOrderValue = totalOrdersAccumulator > 0 ? Math.round((totalRevenue / totalOrdersAccumulator) * 100) / 100 : 0;

    // Build segments
    const segments = (rawSegments || []).map((row) => {
      const clusterId = Number(row.Cluster);
      const segInfo = clusterToSegment[clusterId] || BUSINESS_SEGMENTS.occasional;
      const count = Number(row.Customer_Count) || 0;
      const totalSpending = Number(row.Total_Spending) || 0;

      return {
        clusterId,
        name: segInfo.name,
        shortName: segInfo.shortName,
        tagline: segInfo.tagline,
        badgeClass: segInfo.badgeClass,
        color: segInfo.color,
        description: segInfo.description,
        action: segInfo.action,
        customerCount: count,
        pctOfCustomers: totalCustomers > 0 ? (count / totalCustomers) * 100 : 0,
        totalSpending: totalSpending,
        pctOfRevenue: totalRevenue > 0 ? (totalSpending / totalRevenue) * 100 : 0,
        medianRecency: Number(row.Median_Recency) || 0,
        medianFrequency: Number(row.Median_Frequency) || 0,
        medianSpending: Number(row.Median_Spending) || 0,
      };
    });

    // Sales timeline monthly data
    const salesTimeline = Array.from(monthlyRevenueMap.entries())
      .map(([month, data]) => ({
        date: month,
        revenue: Math.round(data.revenue),
        orders: data.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Models benchmark (preserved for technical drill-down in Settings / Model Details)
    const models = (rawModels || []).map(row => ({
      modelName: row.Model || 'Unknown',
      clusters: Number(row.Clusters) || 0,
      noisePct: Number(row['Noise (%)'] !== undefined ? row['Noise (%)'] : row.Noise) || 0,
      runtime: Number(row['Runtime (seconds)'] !== undefined ? row['Runtime (seconds)'] : row.Runtime) || 0,
      silhouette: Number(row.Silhouette) || 0,
      daviesBouldin: Number(row['Davies-Bouldin'] !== undefined ? row['Davies-Bouldin'] : row.DaviesBouldin) || 0,
      calinskiHarabasz: Number(row['Calinski-Harabasz'] !== undefined ? row['Calinski-Harabasz'] : row.CalinskiHarabasz) || 0,
      isBest: row.Model === 'K-Means'
    }));

    return {
      success: true,
      source: 'demo',
      datasetName: 'Online Retail Demo Data',
      importedAt: null,
      customers,
      segments,
      models,
      salesTimeline,
      summary: {
        totalCustomers,
        totalRevenue,
        totalOrders: totalOrdersAccumulator,
        repeatCustomerRate,
        avgOrderValue,
        segmentCount: segments.length,
        referenceDate: '2011-12-10',
        minDate: '2010-12-01',
        maxDate: '2011-12-09',
        bestSilhouette: 0.4157,
        bestModelName: 'K-Means'
      }
    };
  } catch (error) {
    console.error('RetailIQ Demo Data Loading Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to load demo dataset.'
    };
  }
};

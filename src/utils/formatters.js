/**
 * Formatting utilities for currency, numbers, percentages, and dates
 */

export const formatCurrency = (amount, decimals = 2) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '£0.00';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

export const formatCompactCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '£0';
  if (Math.abs(amount) >= 1_000_000) {
    return `£${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `£${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(amount, 0);
};

export const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatPercent = (val, decimals = 1) => {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${Number(val).toFixed(decimals)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

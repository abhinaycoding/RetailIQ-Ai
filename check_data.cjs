const fs = require('fs');
const lines = fs.readFileSync('public/data/retailiq_customers.csv', 'utf8').trim().split('\n');
const header = lines[0].trim().split(',');
console.log('Header:', header);
const data = lines.slice(1).map(l => {
  const parts = l.trim().split(',');
  return {
    id: parts[0],
    lastPurchase: parts[1],
    frequency: Number(parts[2]),
    monetary: Number(parts[3]),
    recency: Number(parts[4]),
    cluster: Number(parts[5])
  };
});
console.log('Total customers:', data.length);
const dates = data.map(d => d.lastPurchase).sort();
console.log('Min date:', dates[0]);
console.log('Max date:', dates[dates.length - 1]);
const totalSpending = data.reduce((acc, d) => acc + d.monetary, 0);
console.log('Total positive monetary: £' + totalSpending.toFixed(2));
console.log('Avg customer monetary: £' + (totalSpending / data.length).toFixed(2));

const clusterStats = {};
[0, 1, 2].forEach(c => {
  const subset = data.filter(d => d.cluster === c);
  const recs = subset.map(d => d.recency).sort((a,b)=>a-b);
  const freqs = subset.map(d => d.frequency).sort((a,b)=>a-b);
  const spends = subset.map(d => d.monetary).sort((a,b)=>a-b);
  const median = (arr) => arr[Math.floor(arr.length / 2)];
  const total = subset.reduce((acc, d) => acc + d.monetary, 0);
  clusterStats[c] = {
    count: subset.length,
    percentage: ((subset.length / data.length) * 100).toFixed(1) + '%',
    medianRecency: median(recs),
    medianFrequency: median(freqs),
    medianMonetary: median(spends),
    totalSpending: total.toFixed(2),
    pctSpending: ((total / totalSpending) * 100).toFixed(1) + '%'
  };
});
console.log('Cluster stats:', JSON.stringify(clusterStats, null, 2));

// Calculate reference date
// In RFM, reference date is usually max date + 1 day
const maxD = new Date(dates[dates.length - 1]);
console.log('Max purchase date in dataset:', dates[dates.length - 1]);
console.log('Derived reference date (max + 1 day):', new Date(maxD.getTime() + 86400000).toISOString().split('T')[0]);

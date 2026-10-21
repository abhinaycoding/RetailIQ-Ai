import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { ClayCard } from '../ui/ClayCard';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

export const CustomerTable = ({
  customers = [],
  initialFilterCluster = 'all',
  initialSearch = ''
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCluster, setSelectedCluster] = useState(initialFilterCluster);
  const [sortField, setSortField] = useState('monetary');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter & Search logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Cluster filter
      if (selectedCluster !== 'all' && c.cluster !== Number(selectedCluster)) {
        return false;
      }
      // Search filter (Customer ID)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        if (!c.id.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [customers, selectedCluster, search]);

  // Sorting logic
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'id') {
        aVal = Number(aVal) || aVal;
        bVal = Number(bVal) || bVal;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(start, start + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // CSV Export feature
  const handleExportCSV = () => {
    const headers = ['CustomerID', 'LastPurchase', 'Frequency', 'Monetary', 'Recency', 'Cluster', 'ClusterName'];
    const rows = sortedCustomers.map(c => [
      c.id,
      c.lastPurchase,
      c.frequency,
      c.monetary,
      c.recency,
      c.cluster,
      `"${c.clusterName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `retailiq_filtered_customers_${selectedCluster}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Cluster Filter, Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search by Customer ID */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Customer ID (e.g. 12347)..."
              className="w-full clay-inset text-xs py-2 pl-8 pr-4 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-text-muted" />
          </div>

          {/* Segment Selector */}
          <div className="flex items-center gap-1.5 clay-inset-sm p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Clusters' },
              { id: '0', label: 'C0: High-Value' },
              { id: '1', label: 'C1: At-Risk' },
              { id: '2', label: 'C2: Occasional' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCluster(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  selectedCluster === tab.id
                    ? 'clay-nav-active font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="clay-button px-3.5 py-2 text-xs font-semibold self-start sm:self-auto"
          title="Download filtered records as CSV"
        >
          <Download size={14} className="text-accent" />
          Export CSV ({filteredCustomers.length})
        </button>
      </div>

      {/* Table Card */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          title="No Matching Customers"
          description={`No customer records match "${search}" with current cluster filter.`}
          onReset={() => {
            setSearch('');
            setSelectedCluster('all');
          }}
        />
      ) : (
        <ClayCard className="p-0 overflow-hidden border border-white/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-secondary/80 text-text-secondary border-b border-[#d8dde7]">
                  <th
                    onClick={() => handleSort('id')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Customer ID
                      <ArrowUpDown size={12} className={sortField === 'id' ? 'text-accent' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('cluster')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Assigned Segment
                      <ArrowUpDown size={12} className={sortField === 'cluster' ? 'text-accent' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('recency')}
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Recency (Days)
                      <ArrowUpDown size={12} className={sortField === 'recency' ? 'text-accent' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('frequency')}
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Frequency (Invoices)
                      <ArrowUpDown size={12} className={sortField === 'frequency' ? 'text-accent' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('monetary')}
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Monetary Spending
                      <ArrowUpDown size={12} className={sortField === 'monetary' ? 'text-accent' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('lastPurchase')}
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Last Purchase
                      <ArrowUpDown size={12} className={sortField === 'lastPurchase' ? 'text-accent' : 'opacity-40'} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ebf3]">
                {paginatedCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-white/60 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-medium text-text-primary tabular-numbers">
                      #{c.id}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`clay-badge ${c.cluster === 0 ? 'bg-indigo-50 text-accent border border-indigo-200' : c.cluster === 1 ? 'bg-rose-50 text-status-danger border border-rose-200' : 'bg-emerald-50 text-status-success border border-emerald-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.clusterColor }} />
                        Cluster {c.cluster} ({c.clusterName.split(' ')[0]})
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-numbers text-text-primary font-medium">
                      {c.recency}d
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-numbers text-text-primary">
                      {formatNumber(c.frequency)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-numbers font-semibold text-text-primary">
                      {formatCurrency(c.monetary)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-numbers text-text-secondary text-[11px]">
                      {c.lastPurchase.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 bg-surface-secondary/40 border-t border-[#d8dde7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
            <div>
              Showing <strong className="text-text-primary tabular-numbers">{((currentPage - 1) * pageSize) + 1}</strong> to{' '}
              <strong className="text-text-primary tabular-numbers">{Math.min(currentPage * pageSize, filteredCustomers.length)}</strong> of{' '}
              <strong className="text-text-primary tabular-numbers">{formatNumber(filteredCustomers.length)}</strong> records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg clay-button flex items-center justify-center text-text-primary disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="px-2 text-text-primary font-medium tabular-numbers">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg clay-button flex items-center justify-center text-text-primary disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </ClayCard>
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Users,
  DollarSign,
  Clock,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SaasCard } from '../components/ui/SaasCard';
import { CustomerDrawer } from '../components/customers/CustomerDrawer';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const Customers = () => {
  const { customers, segments } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const initialSearch = searchParams.get('search') || '';
  const initialSegment = searchParams.get('segment') || 'all';

  const [search, setSearch] = useState(initialSearch);
  const [selectedSegment, setSelectedSegment] = useState(initialSegment);
  const [sortField, setSortField] = useState('monetary');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const pageSize = 12;

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
    const seg = searchParams.get('segment');
    if (seg !== null) setSelectedSegment(seg);
  }, [searchParams]);

  const handleSegmentChange = (segId) => {
    setSelectedSegment(segId);
    if (segId === 'all') {
      searchParams.delete('segment');
    } else {
      searchParams.set('segment', segId);
    }
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // Filter & Search logic
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter((c) => {
      // Segment filter
      if (selectedSegment !== 'all' && c.cluster !== Number(selectedSegment)) {
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
  }, [customers, selectedSegment, search]);

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
    const headers = ['CustomerID', 'LastPurchase', 'TotalOrders', 'TotalSpend', 'RecencyDays', 'CohortID', 'CohortName'];
    const rows = sortedCustomers.map(c => [
      c.id,
      c.lastPurchase,
      c.frequency,
      c.monetary,
      c.recency,
      c.cluster,
      `"${c.segmentName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `retailiq_customers_${selectedSegment}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search, Filter & Export Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search by Customer ID */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Customer ID (e.g. 12347)..."
              className="w-full text-xs py-2 pl-8 pr-4 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>

          {/* Segment Selector Tabs */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shadow-xs overflow-x-auto">
            <button
              onClick={() => handleSegmentChange('all')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedSegment === 'all'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({customers?.length || 0})
            </button>
            {segments.map((seg) => (
              <button
                key={seg.clusterId}
                onClick={() => handleSegmentChange(String(seg.clusterId))}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  selectedSegment === String(seg.clusterId)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span>{seg.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto shrink-0"
          title="Download customer list as CSV"
        >
          <Download size={14} className="text-slate-500" />
          <span>Export CSV ({filteredCustomers.length})</span>
        </button>
      </div>

      {/* Customer Directory Table */}
      {filteredCustomers.length === 0 ? (
        <SaasCard className="py-12 text-center">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <Users size={20} />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            No Customers Found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No accounts match "{search}" in the selected segment.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSegment('all');
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset Filters
          </button>
        </SaasCard>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 text-slate-600 border-b border-slate-200 font-semibold">
                  <th
                    onClick={() => handleSort('id')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1.5">
                      Customer ID
                      <ArrowUpDown size={12} className={sortField === 'id' ? 'text-blue-600' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('cluster')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1.5">
                      Segment Cohort
                      <ArrowUpDown size={12} className={sortField === 'cluster' ? 'text-blue-600' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('monetary')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Total Spend
                      <ArrowUpDown size={12} className={sortField === 'monetary' ? 'text-blue-600' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('frequency')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Orders
                      <ArrowUpDown size={12} className={sortField === 'frequency' ? 'text-blue-600' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('recency')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Recency
                      <ArrowUpDown size={12} className={sortField === 'recency' ? 'text-blue-600' : 'opacity-40'} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('lastPurchase')}
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Last Order
                      <ArrowUpDown size={12} className={sortField === 'lastPurchase' ? 'text-blue-600' : 'opacity-40'} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900 tabular-numbers">
                      #{c.id}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${c.segmentBadge}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.segmentColor }} />
                        {c.segmentName}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-numbers font-semibold text-slate-900">
                      {formatCurrency(c.monetary)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-numbers text-slate-700">
                      {formatNumber(c.frequency)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-numbers text-slate-600">
                      {c.recency}d ago
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-numbers text-slate-500 font-mono text-[11px]">
                      {c.lastPurchase}
                    </td>
                    <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Customer Profile"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-900 tabular-numbers">{((currentPage - 1) * pageSize) + 1}</strong> to{' '}
              <strong className="text-slate-900 tabular-numbers">{Math.min(currentPage * pageSize, filteredCustomers.length)}</strong> of{' '}
              <strong className="text-slate-900 tabular-numbers">{formatNumber(filteredCustomers.length)}</strong> accounts
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="px-2 font-medium tabular-numbers text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};

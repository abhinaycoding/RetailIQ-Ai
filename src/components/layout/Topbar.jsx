import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, Search, UploadCloud, Calendar, Database, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

const PAGE_META = {
  '/': {
    title: 'Store Overview',
    desc: 'Monitor key customer engagement metrics, sales trends, and retention cohorts.',
    crumb: 'Overview'
  },
  '/customers': {
    title: 'Customer Directory',
    desc: 'Explore individual customer purchase histories, lifetime spending, and segment assignments.',
    crumb: 'Customers'
  },
  '/segments': {
    title: 'Customer Segments',
    desc: 'Analyze business cohorts categorized by purchasing habits, frequency, and churn risk.',
    crumb: 'Segments'
  },
  '/sales': {
    title: 'Sales & Revenue Analytics',
    desc: 'Track sales performance, order frequency distributions, and transaction volume trends.',
    crumb: 'Sales Analytics'
  },
  '/marketing': {
    title: 'Marketing Opportunities',
    desc: 'Actionable customer retention playbooks and campaign planning based on purchase behavior.',
    crumb: 'Marketing Opportunities'
  },
  '/import': {
    title: 'Import Transaction Data',
    desc: 'Upload your store order history via CSV to automatically generate customer segments and analytics.',
    crumb: 'Import Data'
  },
  '/settings': {
    title: 'Store Settings & Diagnostics',
    desc: 'Manage store configurations, reset demo datasets, and inspect underlying model specifications.',
    crumb: 'Settings'
  }
};

export const Topbar = ({ onOpenMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { summary, datasetName, source } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const currentMeta = PAGE_META[location.pathname] || {
    title: 'Store Analytics',
    desc: 'Customer intelligence for retail growth.',
    crumb: 'Analytics'
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/customers?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Title & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
            aria-label="Open mobile menu"
          >
            <Menu size={16} />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <span>RetailIQ</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold">{currentMeta.crumb}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight mt-0.5">
              {currentMeta.title}
            </h1>
          </div>
        </div>

        {/* Right: Working Search + Import Button + Dataset Indicator */}
        <div className="flex items-center gap-3">
          {/* Customer Search Lookup */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lookup Customer ID..."
              className="text-xs py-1.5 pl-8 pr-7 w-56 rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
            <Search size={13} className="absolute left-2.5 text-slate-400" />
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-2 text-blue-600 hover:text-blue-700"
                title="Search customer"
              >
                <ArrowRight size={12} />
              </button>
            )}
          </form>

          {/* Reference Date Indicator */}
          {summary?.referenceDate && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600">
              <Calendar size={13} className="text-slate-400" />
              <span className="text-slate-400">Period:</span>
              <span className="font-semibold text-slate-800 tabular-numbers">
                {summary.referenceDate}
              </span>
            </div>
          )}

          {/* Active Data Source Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500">{source === 'demo' ? 'Demo' : 'Uploaded'}:</span>
            <span className="font-semibold text-slate-700 truncate max-w-[130px]" title={datasetName}>
              {datasetName}
            </span>
          </div>

          {/* Prominent Import Data Button */}
          <Link
            to="/import"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            <UploadCloud size={14} />
            <span>Import CSV</span>
          </Link>
        </div>
      </div>
      
      {/* Subheader description */}
      <p className="text-xs text-slate-500 mt-0.5 hidden sm:block max-w-3xl">
        {currentMeta.desc}
      </p>
    </header>
  );
};

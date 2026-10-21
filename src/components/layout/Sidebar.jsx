import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PieChart,
  TrendingUp,
  Target,
  UploadCloud,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/segments', label: 'Segments', icon: PieChart },
  { path: '/sales', label: 'Sales Analytics', icon: TrendingUp },
  { path: '/marketing', label: 'Marketing Opportunities', icon: Target },
  { path: '/import', label: 'Import Data', icon: UploadCloud },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { storeSettings, datasetName, source, summary } = useData();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Rail */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-200 flex flex-col justify-between ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shadow-sm`}
      >
        <div>
          {/* Top Brand & Store Switcher */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19V5M9 19V11M14 19V7M19 19V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {!collapsed && (
                <div className="truncate">
                  <div className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                    <span>RetailIQ</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      SaaS
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Customer Intelligence
                  </div>
                </div>
              )}
            </div>

            {/* Collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 items-center justify-center transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Store Context Switcher */}
          {!collapsed ? (
            <div className="p-3 border-b border-slate-100">
              <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/70 rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <Store size={13} />
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {storeSettings?.storeName || 'My Store'}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{source === 'demo' ? 'Demo Store' : 'Active Store'}</span>
                    </div>
                  </div>
                </div>
                <ChevronDown size={13} className="text-slate-400 shrink-0" />
              </div>
            </div>
          ) : (
            <div className="py-2 border-b border-slate-100 flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600" title={storeSettings?.storeName || 'My Store'}>
                <Store size={15} />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={17} className="shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Dataset Status Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {!collapsed ? (
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Dataset
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {summary?.totalCustomers?.toLocaleString()} cust.
                </span>
              </div>
              <div className="text-[11px] text-slate-600 truncate font-medium">
                {datasetName}
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={datasetName}>
              <CheckCircle2 size={15} className="text-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

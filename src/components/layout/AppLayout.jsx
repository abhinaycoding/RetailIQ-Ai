import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useData } from '../../context/DataContext';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, error, resetToDemo, datasetName } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Loader2 size={20} className="animate-spin" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Loading Store Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Initializing customer transaction profiles and segments...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-rose-200 rounded-xl p-8 max-w-md w-full shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Data Loading Notice
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {error}
              </p>
              <button
                onClick={resetToDemo}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={13} />
                Load Sample Store Dataset
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'
        }`}
      >
        <Topbar onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1550px] w-full mx-auto">
          <Outlet />
        </main>

        <footer className="px-6 py-3.5 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            RetailIQ Customer Intelligence Platform • Active Dataset: <span className="font-medium text-slate-700">{datasetName}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by Automated Customer Segmentation
          </div>
        </footer>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Calendar, ShoppingBag, DollarSign, Clock, Sparkles, Download, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const CustomerDrawer = ({ customer, onClose }) => {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${customer.segmentBadge}`}>
                {customer.segmentName}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">ID: #{customer.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Customer #{customer.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Top 3 KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <DollarSign size={13} className="text-slate-400" />
                <span>Total Lifetime Spend</span>
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-numbers">
                {formatCurrency(customer.monetary)}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <ShoppingBag size={13} className="text-slate-400" />
                <span>Total Orders</span>
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-numbers">
                {formatNumber(customer.frequency)} {customer.frequency === 1 ? 'order' : 'orders'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock size={13} className="text-slate-400" />
                <span>Days Since Purchase</span>
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-numbers">
                {customer.recency} days ago
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Calendar size={13} className="text-slate-400" />
                <span>Average Order Value</span>
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-numbers">
                {formatCurrency(customer.avgOrderValue)}
              </div>
            </div>
          </div>

          {/* Timeline info */}
          <div className="border border-slate-100 rounded-xl p-4 bg-white space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Last Order Date:</span>
              <strong className="text-slate-900 font-mono">{customer.lastPurchase}</strong>
            </div>
            {customer.firstPurchase && (
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">First Order Date:</span>
                <strong className="text-slate-900 font-mono">{customer.firstPurchase}</strong>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Assigned Cohort:</span>
              <strong className="text-slate-900">{customer.segmentName}</strong>
            </div>
          </div>

          {/* Recommended Seller Action */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-xs">
              <Sparkles size={15} />
              <span>Recommended Seller Action</span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed">
              {customer.cluster === 0 && (
                <>High-value VIP account with strong loyalty momentum. Reward with exclusive catalog previews, loyalty perks, or personal checkout support. Avoid heavy margin-eroding discounts.</>
              )}
              {customer.cluster === 1 && (
                <>Dormant account at risk of churn ({customer.recency} days inactive). Target with an automated win-back campaign or a 15% reactivation voucher to trigger a repeat purchase.</>
              )}
              {customer.cluster === 2 && (
                <>Occasional buyer with moderate order history. Send curated product recommendations based on their purchase category to nudge them toward a second or third order.</>
              )}
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

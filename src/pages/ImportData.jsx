import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Info,
  X,
  FileText,
  Check,
  ShoppingCart,
  Receipt,
  Users,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import Papa from 'papaparse';
import { useData } from '../context/DataContext';
import { SaasCard } from '../components/ui/SaasCard';
import { processDataset, parseDateString } from '../services/segmentationService';
import { formatNumber, formatCurrency } from '../utils/formatters';

// Available data schemas supported by RetailIQ
const DATASET_MODES = [
  {
    id: 'itemized',
    name: 'Itemized Transactions',
    badge: 'Basket Items (Qty × Price)',
    description: 'Line-item retail records with separate Quantity and Unit Price columns (e.g. Online Retail, Shopify).',
    icon: ShoppingCart,
    fields: [
      { key: 'customerIdCol', label: 'Customer ID', required: true, expectedType: 'id', hints: ['customer', 'cust_id', 'customerid', 'user_id', 'client_id', 'client', 'account', 'email', 'buyer', 'member_id', 'id'] },
      { key: 'orderIdCol', label: 'Order / Invoice ID', required: true, expectedType: 'id', hints: ['invoice', 'order', 'invoiceno', 'order_id', 'transaction_id', 'trans_id', 'receipt', 'bill'] },
      { key: 'dateCol', label: 'Order Date', required: true, expectedType: 'date', hints: ['date', 'invoicedate', 'order_date', 'timestamp', 'created_at', 'purchase_date', 'time'] },
      { key: 'quantityCol', label: 'Item Quantity', required: true, expectedType: 'numeric', hints: ['quantity', 'qty', 'units', 'items', 'count', 'volume'] },
      { key: 'unitPriceCol', label: 'Unit Price / Amount', required: true, expectedType: 'numeric', hints: ['unitprice', 'price', 'item_price', 'rate', 'cost', 'amount'] },
      { key: 'totalAmountCol', label: 'Line Total (Optional Override)', required: false, expectedType: 'numeric', hints: ['total', 'line_total', 'linetotal', 'subtotal', 'sales', 'spend'] }
    ]
  },
  {
    id: 'order_total',
    name: 'Order-Level Transactions',
    badge: 'Single Amount per Order',
    description: 'Flat invoice or order records containing a single Total Amount column (e.g. Stripe, Square, PayPal, QuickBooks).',
    icon: Receipt,
    fields: [
      { key: 'customerIdCol', label: 'Customer ID', required: true, expectedType: 'id', hints: ['customer', 'cust_id', 'customerid', 'user_id', 'client_id', 'client', 'account', 'email', 'buyer', 'member_id', 'id'] },
      { key: 'orderIdCol', label: 'Order / Invoice ID', required: true, expectedType: 'id', hints: ['invoice', 'order', 'invoiceno', 'order_id', 'transaction_id', 'trans_id', 'receipt', 'bill'] },
      { key: 'dateCol', label: 'Order Date', required: true, expectedType: 'date', hints: ['date', 'invoicedate', 'order_date', 'timestamp', 'created_at', 'purchase_date', 'time'] },
      { key: 'totalAmountCol', label: 'Order Total Amount', required: true, expectedType: 'numeric', hints: ['total', 'amount', 'total_amount', 'spend', 'sales', 'revenue', 'order_total', 'value', 'gross_amount', 'net_amount', 'price'] },
      { key: 'quantityCol', label: 'Order Item Quantity', required: false, expectedType: 'numeric', hints: ['quantity', 'qty', 'units', 'items', 'count'] }
    ]
  },
  {
    id: 'customer_rfm',
    name: 'Customer Summary (RFM)',
    badge: 'Pre-Aggregated Profile',
    description: 'Pre-computed customer metrics table with Monetary, Frequency, and Recency/Last Purchase (e.g. CRM exports).',
    icon: Users,
    fields: [
      { key: 'customerIdCol', label: 'Customer ID', required: true, expectedType: 'id', hints: ['customerid', 'customer', 'cust_id', 'user_id', 'client_id', 'account', 'email', 'id'] },
      { key: 'monetaryCol', label: 'Cumulative Spend / Monetary', required: true, expectedType: 'numeric', hints: ['monetary', 'totalspend', 'spend', 'total_spend', 'revenue', 'sales', 'value', 'total'] },
      { key: 'frequencyCol', label: 'Frequency / Order Count', required: true, expectedType: 'numeric', hints: ['frequency', 'orders', 'order_count', 'total_orders', 'transactions', 'count'] },
      { key: 'recencyCol', label: 'Recency (Days Since Purchase)', required: false, expectedType: 'numeric', hints: ['recency', 'days_since_last', 'days_since_purchase', 'inactivity', 'days'] },
      { key: 'lastPurchaseCol', label: 'Last Purchase Date', required: false, expectedType: 'date', hints: ['lastpurchase', 'last_purchase', 'date', 'latest_date', 'recent_date'] },
      { key: 'clusterCol', label: 'Pre-assigned Segment / Cluster', required: false, expectedType: 'numeric', hints: ['cluster', 'segment', 'cohort', 'group', 'class'] }
    ]
  }
];

export const ImportData = () => {
  const { applyCustomDataset, resetToDemo, datasetName, source } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Upload workflow state
  const [file, setFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [columnMetadata, setColumnMetadata] = useState({});
  const [datasetMode, setDatasetMode] = useState('itemized');
  const [autoMatchedFields, setAutoMatchedFields] = useState({});
  const [columnMapping, setColumnMapping] = useState({});
  const [mappingErrors, setMappingErrors] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Analyze dataset columns to detect data types, fill rates, and valid sample values
  const inspectColumns = (cols, rows) => {
    const meta = {};
    const sampleRows = rows.slice(0, 100);

    cols.forEach(col => {
      const nonEmpties = [];
      let numCount = 0;
      let dateCount = 0;
      let validCount = 0;

      for (const r of sampleRows) {
        const v = r[col];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          validCount++;
          const strVal = String(v).trim();
          if (!nonEmpties.includes(strVal) && nonEmpties.length < 3) {
            nonEmpties.push(strVal);
          }

          // Test numeric
          if (!isNaN(Number(v))) {
            numCount++;
          }

          // Test date
          if (typeof v === 'string' && v.length >= 6 && parseDateString(v) !== null) {
            dateCount++;
          }
        }
      }

      const fillRate = sampleRows.length > 0 ? Math.round((validCount / sampleRows.length) * 100) : 0;
      let inferredType = 'text';
      if (dateCount >= validCount * 0.7 && validCount > 0) {
        inferredType = 'date';
      } else if (numCount >= validCount * 0.75 && validCount > 0) {
        inferredType = 'numeric';
      }

      meta[col] = {
        name: col,
        fillRate,
        samples: nonEmpties,
        inferredType,
        validCount
      };
    });

    return meta;
  };

  // Automatically detect the most fitting dataset schema mode
  const detectDatasetMode = (cols) => {
    const cleanCols = cols.map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Check for Customer RFM summary
    const hasMonetary = cleanCols.some(c => ['monetary', 'totalspend', 'spend', 'revenue'].some(h => c.includes(h)));
    const hasFrequency = cleanCols.some(c => ['frequency', 'orders', 'ordercount'].some(h => c.includes(h)));
    const hasRecency = cleanCols.some(c => ['recency', 'lastpurchase'].some(h => c.includes(h)));
    if (hasMonetary && hasFrequency && hasRecency) {
      return 'customer_rfm';
    }

    // Check for Itemized Transactions (separate Quantity and Unit Price)
    const hasQty = cleanCols.some(c => ['quantity', 'qty', 'units', 'items'].some(h => c.includes(h)));
    const hasUnitPrice = cleanCols.some(c => ['unitprice', 'price', 'itemprice', 'rate'].some(h => c.includes(h)));
    if (hasQty && hasUnitPrice) {
      return 'itemized';
    }

    // Check for Order Totals (single amount)
    const hasTotal = cleanCols.some(c => ['total', 'amount', 'totalamount', 'sales', 'revenue'].some(h => c.includes(h)));
    if (hasTotal) {
      return 'order_total';
    }

    return 'itemized';
  };

  // Auto-map columns to fields based on mode definitions and inferred types
  const autoMapColumnsForMode = (modeId, cols) => {
    const modeConfig = DATASET_MODES.find(m => m.id === modeId) || DATASET_MODES[0];
    const mapping = {};
    const autoMatched = {};
    const usedCols = new Set();

    modeConfig.fields.forEach(field => {
      // Find candidate columns matching hints
      const candidate = cols.find(col => {
        if (usedCols.has(col) && field.required) return false;
        const cleanCol = col.toLowerCase().replace(/[^a-z0-9]/g, '');
        return field.hints.some(h => cleanCol.includes(h.toLowerCase().replace(/[^a-z0-9]/g, '')));
      });

      if (candidate) {
        mapping[field.key] = candidate;
        autoMatched[field.key] = candidate;
        usedCols.add(candidate);
      } else {
        mapping[field.key] = '';
      }
    });

    return { mapping, autoMatched };
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Parse CSV file with PapaParse
  const processSelectedFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setProcessError('Please upload a valid CSV file (.csv extension).');
      return;
    }

    setFile(selectedFile);
    setFileDetails({
      name: selectedFile.name,
      size: (selectedFile.size / 1024).toFixed(1) + ' KB',
      sizeBytes: selectedFile.size
    });
    setProcessError(null);
    setMappingErrors([]);
    setImportSuccess(false);

    Papa.parse(selectedFile, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setProcessError('The selected CSV file appears to be empty.');
          return;
        }

        const detectedCols = results.meta.fields || Object.keys(results.data[0] || {});
        const meta = inspectColumns(detectedCols, results.data);
        const detectedMode = detectDatasetMode(detectedCols, meta);
        const { mapping, autoMatched } = autoMapColumnsForMode(detectedMode, detectedCols, meta);

        setColumns(detectedCols);
        setColumnMetadata(meta);
        setParsedRows(results.data);
        setDatasetMode(detectedMode);
        setColumnMapping(mapping);
        setAutoMatchedFields(autoMatched);
      },
      error: (err) => {
        setProcessError(`Failed to parse CSV file: ${err.message}`);
      }
    });
  };

  // Handle switching dataset mode dynamically
  const handleSwitchMode = (newModeId) => {
    setDatasetMode(newModeId);
    setProcessError(null);
    setMappingErrors([]);
    const { mapping, autoMatched } = autoMapColumnsForMode(newModeId, columns, columnMetadata);
    setColumnMapping(mapping);
    setAutoMatchedFields(autoMatched);
  };

  // Handle individual field column change
  const handleFieldChange = (fieldKey, selectedColumn) => {
    setColumnMapping(prev => ({ ...prev, [fieldKey]: selectedColumn }));
    setProcessError(null);
    setMappingErrors([]);
  };

  // Validate mapping and execute customer segmentation
  const handleConfirmImport = () => {
    const currentModeConfig = DATASET_MODES.find(m => m.id === datasetMode) || DATASET_MODES[0];
    const errors = [];

    currentModeConfig.fields.forEach(f => {
      if (f.required && !columnMapping[f.key]) {
        errors.push(`Please select a column for "${f.label}".`);
      }
    });

    // Special validation for customer RFM mode: requires at least recencyCol OR lastPurchaseCol
    if (datasetMode === 'customer_rfm' && !columnMapping.recencyCol && !columnMapping.lastPurchaseCol) {
      errors.push('Please select at least one of "Recency" or "Last Purchase Date".');
    }

    if (errors.length > 0) {
      setMappingErrors(errors);
      return;
    }

    setMappingErrors([]);
    setProcessing(true);
    setProcessError(null);

    try {
      // Process through dynamic dataset pipeline
      const processed = processDataset(parsedRows, columnMapping, datasetMode);
      
      // Update global application context
      applyCustomDataset(processed, fileDetails.name);
      setImportSuccess(true);
      setProcessing(false);

      // Navigate to overview after brief confirmation
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setProcessError(err.message || 'An error occurred while processing the customer dataset.');
      setProcessing(false);
    }
  };

  const handleResetFile = () => {
    setFile(null);
    setFileDetails(null);
    setParsedRows([]);
    setColumns([]);
    setColumnMetadata({});
    setColumnMapping({});
    setAutoMatchedFields({});
    setProcessError(null);
    setMappingErrors([]);
  };

  const activeModeConfig = DATASET_MODES.find(m => m.id === datasetMode) || DATASET_MODES[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Import Store Transaction Data
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload any customer or order history CSV to recalculate customer segments, RFM scores, and playbooks.
          </p>
        </div>

        {source === 'custom' && (
          <button
            onClick={() => {
              resetToDemo();
              handleResetFile();
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <RefreshCw size={13} className="text-slate-500" />
            <span>Reset to Demo Data</span>
          </button>
        )}
      </div>

      {/* Active Data Status Notice */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-blue-600" />
          <span>Currently Active: <strong className="text-slate-900">{datasetName}</strong> ({source === 'demo' ? 'Sample dataset' : 'Uploaded CSV'})</span>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          Session persisted in browser
        </span>
      </div>

      {/* Upload Zone */}
      {!file ? (
        <SaasCard className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Drag and drop your transaction CSV here
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Compatible with exports from Shopify, WooCommerce, Square, Stripe, or standard customer accounting software.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Browse Computer Files
          </button>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Supports: Itemized line items, order totals, and customer RFM tables</span>
            <span>•</span>
            <span>Automatic schema detection</span>
          </div>
        </SaasCard>
      ) : (
        /* File Uploaded & Dynamic Column Mapping View */
        <div className="space-y-6">
          {/* File Selected Badge */}
          <SaasCard className="p-4 flex items-center justify-between bg-white border-blue-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>{fileDetails?.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {fileDetails?.size}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Parsed <strong className="text-slate-800">{formatNumber(parsedRows.length)}</strong> rows across <strong className="text-slate-800">{columns.length}</strong> parameters.
                </div>
              </div>
            </div>

            <button
              onClick={handleResetFile}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Change file"
            >
              <X size={16} />
            </button>
          </SaasCard>

          {/* Dynamic Column Mapping Section */}
          <SaasCard className="p-6">
            {/* Header & Schema Mode Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">
                    Map CSV Columns to Customer Intelligence Fields
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <Sparkles size={11} /> Auto-detected: {activeModeConfig.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {activeModeConfig.description}
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto shrink-0">
                {DATASET_MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleSwitchMode(mode.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-all ${
                        datasetMode === mode.id
                          ? 'bg-white text-slate-900 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={12} className={datasetMode === mode.id ? 'text-blue-600' : 'text-slate-400'} />
                      <span>{mode.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Field Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeModeConfig.fields.map((field) => {
                const selectedCol = columnMapping[field.key];
                const colInfo = selectedCol ? columnMetadata[selectedCol] : null;
                const isAutoMatched = autoMatchedFields[field.key] === selectedCol && selectedCol;

                // Validate if selected column type matches field expectation
                const isTypeMismatch = colInfo && field.expectedType === 'numeric' && colInfo.inferredType === 'text';

                return (
                  <div key={field.key} className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <span>{field.label}</span>
                        {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      
                      {selectedCol ? (
                        <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
                          isAutoMatched
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          <Check size={10} /> {isAutoMatched ? '✨ Auto-detected' : '✓ Mapped'}
                        </span>
                      ) : (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                          field.required ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {field.required ? 'Required' : 'Optional'}
                        </span>
                      )}
                    </div>

                    <select
                      value={columnMapping[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className={`w-full text-xs p-2 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                        columnMapping[field.key]
                          ? isTypeMismatch ? 'border-amber-400 bg-amber-50/10' : 'border-slate-300'
                          : field.required ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                      }`}
                    >
                      <option value="">-- Select Column ({field.required ? 'Required' : 'Optional'}) --</option>
                      {columns.map(col => {
                        const meta = columnMetadata[col];
                        const typeEmoji = meta?.inferredType === 'numeric' ? '🔢' : meta?.inferredType === 'date' ? '📅' : '🔤';
                        const samplePreview = meta?.samples?.[0] ? `(e.g. ${meta.samples[0]})` : '';
                        return (
                          <option key={col} value={col}>
                            {typeEmoji} {col} {samplePreview}
                          </option>
                        );
                      })}
                    </select>

                    {/* Rich Data Information Box for Selected Column */}
                    {colInfo ? (
                      <div className="text-[11px] bg-white border border-slate-200/80 rounded-md p-2 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400 text-[10px]">Type:</span>
                            <span className="font-semibold text-slate-800">
                              {colInfo.inferredType === 'numeric' ? '🔢 Numeric' : colInfo.inferredType === 'date' ? '📅 Date / Time' : '🔤 Text / ID'}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {colInfo.fillRate}% filled
                          </span>
                        </div>

                        {colInfo.samples && colInfo.samples.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            <span className="text-[10px] text-slate-400">Samples:</span>
                            {colInfo.samples.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono text-[10px] rounded border border-slate-200 max-w-[130px] truncate" title={s}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {isTypeMismatch && (
                          <div className="text-[10px] text-amber-700 flex items-center gap-1 pt-0.5 font-medium">
                            <AlertTriangle size={11} />
                            <span>Warning: This field expects numbers, but selected column contains text.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic px-1 pt-0.5">
                        Choose the parameter representing {field.label.toLowerCase()} in your CSV.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Validation Errors */}
            {mappingErrors.length > 0 && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle size={14} /> Missing Required Mappings
                </div>
                {mappingErrors.map((err, i) => (
                  <div key={i} className="pl-5">• {err}</div>
                ))}
              </div>
            )}

            {processError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{processError}</span>
              </div>
            )}
          </SaasCard>

          {/* Preview of First 5 Rows */}
          <SaasCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">
                Data Preview (First 5 Rows)
              </h4>
              <span className="text-[11px] text-slate-400">
                Verify row parameters look correct
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    {columns.slice(0, 8).map(col => (
                      <th key={col} className="py-2.5 px-3 font-semibold text-[11px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      {columns.slice(0, 8).map(col => (
                        <td key={col} className="py-2 px-3 text-slate-700 font-mono text-[11px] truncate max-w-[150px]">
                          {row[col] !== undefined && row[col] !== null ? String(row[col]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SaasCard>

          {/* Action Confirmation Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleResetFile}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={processing || importSuccess}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {processing ? (
                <>Processing RFM Segments...</>
              ) : importSuccess ? (
                <>
                  <Check size={14} /> Import Successful!
                </>
              ) : (
                <>
                  <span>Confirm & Run Segmentation</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

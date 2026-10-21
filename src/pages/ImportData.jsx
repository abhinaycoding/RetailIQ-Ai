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
  Check
} from 'lucide-react';
import Papa from 'papaparse';
import { useData } from '../context/DataContext';
import { SaasCard } from '../components/ui/SaasCard';
import { processTransactions } from '../services/segmentationService';
import { formatNumber, formatCurrency } from '../utils/formatters';

const CANONICAL_FIELDS = [
  { key: 'customerIdCol', label: 'Customer ID', required: true, hints: ['customer', 'cust_id', 'customerid', 'user_id', 'client_id'] },
  { key: 'orderIdCol', label: 'Order / Invoice ID', required: true, hints: ['invoice', 'order', 'invoiceno', 'order_id', 'transaction_id'] },
  { key: 'dateCol', label: 'Order Date', required: true, hints: ['date', 'invoicedate', 'order_date', 'timestamp', 'created_at'] },
  { key: 'quantityCol', label: 'Item Quantity', required: true, hints: ['quantity', 'qty', 'units', 'items'] },
  { key: 'unitPriceCol', label: 'Unit Price / Amount', required: true, hints: ['price', 'unitprice', 'amount', 'item_price', 'total', 'rate'] }
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
  const [columnMapping, setColumnMapping] = useState({
    customerIdCol: '',
    orderIdCol: '',
    dateCol: '',
    quantityCol: '',
    unitPriceCol: ''
  });
  const [mappingErrors, setMappingErrors] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);

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
        setColumns(detectedCols);
        setParsedRows(results.data);

        // Auto-detect column mappings using fuzzy hints
        const autoMap = {
          customerIdCol: '',
          orderIdCol: '',
          dateCol: '',
          quantityCol: '',
          unitPriceCol: ''
        };

        CANONICAL_FIELDS.forEach(field => {
          const matched = detectedCols.find(col => {
            const cleanCol = col.toLowerCase().replace(/[^a-z0-9]/g, '');
            return field.hints.some(h => cleanCol.includes(h.toLowerCase().replace(/[^a-z0-9]/g, '')));
          });
          if (matched) {
            autoMap[field.key] = matched;
          }
        });

        setColumnMapping(autoMap);
      },
      error: (err) => {
        setProcessError(`Failed to parse CSV file: ${err.message}`);
      }
    });
  };

  // Validate mapping and execute customer segmentation
  const handleConfirmImport = () => {
    const errors = [];
    CANONICAL_FIELDS.forEach(f => {
      if (f.required && !columnMapping[f.key]) {
        errors.push(`Please select a column for "${f.label}".`);
      }
    });

    if (errors.length > 0) {
      setMappingErrors(errors);
      return;
    }

    setMappingErrors([]);
    setProcessing(true);
    setProcessError(null);

    try {
      // Process transactions through the segmentation engine
      const processed = processTransactions(parsedRows, columnMapping);
      
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
    setProcessError(null);
    setMappingErrors([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Import Store Transaction Data
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your order history CSV to recalculate customer segments, metrics, and playbooks.
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
            Compatible with exports from Shopify, WooCommerce, Square, Stripe, or standard accounting software.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Browse Computer Files
          </button>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Required: Customer ID, Order ID, Date, Quantity, Unit Price</span>
            <span>•</span>
            <span>Max recommended file: 25 MB</span>
          </div>
        </SaasCard>
      ) : (
        /* File Uploaded & Column Mapping View */
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
                  Parsed <strong className="text-slate-800">{formatNumber(parsedRows.length)}</strong> transaction rows across <strong className="text-slate-800">{columns.length}</strong> columns.
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

          {/* Column Mapping Section */}
          <SaasCard className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Map CSV Columns to Customer Intelligence Fields
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                We've automatically detected potential column matches. Please confirm or adjust each field below:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CANONICAL_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>{field.label} {field.required && <span className="text-rose-500">*</span>}</span>
                    {columnMapping[field.key] && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-normal">
                        <Check size={11} /> Mapped
                      </span>
                    )}
                  </label>
                  <select
                    value={columnMapping[field.key]}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className={`w-full text-xs p-2 rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                      columnMapping[field.key] ? 'border-slate-300' : 'border-amber-300 bg-amber-50/20'
                    }`}
                  >
                    <option value="">-- Select Column --</option>
                    {columns.map(col => (
                      <option key={col} value={col}>
                        {col} {parsedRows[0]?.[col] !== undefined ? `(e.g. ${String(parsedRows[0][col]).slice(0, 15)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
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
                Verify row values look correct
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

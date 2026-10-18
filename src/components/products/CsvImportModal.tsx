import React, { useState } from 'react';
import { Upload, Download, X, Check, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { Product, Category, Store, Supplier } from '../../types/pos';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newProducts: Product[]) => void;
  categories: Category[];
  stores: Store[];
  suppliers: Supplier[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  categories,
  stores,
  suppliers,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Partial<Product>[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const sampleCsvContent = `name,sku,barcode,category,costPrice,sellingPrice,stock,minStockAlert,expirationDate,unit
"Cold Pressed Orange Juice 300ml","BEV-OJ-004","012000000199","Beverages",1.40,3.50,40,10,"2026-11-30","bottle"
"Cheddar Cheese Block 250g","GRO-CH-004","052159700088","Fresh Grocery",2.20,4.90,25,8,"2026-12-15","pack"
"Steel Cut Oats 1kg","PAN-OT-004","074312001555","Pantry & Grains",1.80,3.95,30,10,"2027-06-01","bag"
"Type-C to Lightning Adapter","ELE-AD-003","840056123999","Tech & Electronics",3.00,8.99,15,5,"2030-01-01","pcs"`;

  const downloadSampleTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aurapos_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    setErrorMsg(null);
    setSuccessCount(null);
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setErrorMsg('CSV must contain a header row and at least one data row.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const rows: Partial<Product>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        for (let charIndex = 0; charIndex < line.length; charIndex++) {
          const char = line[charIndex];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        const rowObj: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowObj[header] = (values[index] || '').replace(/^"|"$/g, '');
        });

        const matchedCategory = categories.find(
          (c) => c.name.toLowerCase() === (rowObj['category'] || '').toLowerCase()
        ) || categories[0];

        const defaultStoreId = stores[0]?.id || 'store-1';
        const defaultSupplierId = suppliers[0]?.id || 'sup-1';

        rows.push({
          id: 'prod_' + Math.random().toString(36).substring(2, 9),
          name: rowObj['name'] || `Product ${i}`,
          sku: rowObj['sku'] || `SKU-${Date.now()}-${i}`,
          barcode: rowObj['barcode'] || `BAR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          categoryId: matchedCategory.id,
          costPrice: parseFloat(rowObj['costPrice']) || 1.0,
          sellingPrice: parseFloat(rowObj['sellingPrice']) || 2.0,
          stock: parseInt(rowObj['stock'], 10) || 10,
          minStockAlert: parseInt(rowObj['minStockAlert'], 10) || 5,
          expirationDate: rowObj['expirationDate'] || '2027-12-31',
          supplierId: defaultSupplierId,
          storeId: defaultStoreId,
          unit: rowObj['unit'] || 'pcs',
          taxRate: 0.16,
        });
      }

      setParsedRows(rows);
    } catch {
      setErrorMsg('Failed to parse CSV format. Please ensure valid comma-separated format.');
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows as Product[]);
    setSuccessCount(parsedRows.length);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import Products via CSV</h3>
              <p className="text-xs text-slate-500">Batch upload inventory catalog and barcodes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-slate-800">Need a CSV template?</p>
              <p className="text-[11px] text-slate-500">
                Download the standardized layout with pre-populated sample rows.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Download Template
            </button>
          </div>

          {/* File Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500/80 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-upload"
            />
            <label
              htmlFor="csv-file-upload"
              className="flex flex-col items-center justify-center cursor-pointer space-y-2"
            >
              <div className="p-3 bg-emerald-100/80 text-emerald-700 rounded-full">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drop your CSV file here
              </p>
              <p className="text-[11px] text-slate-400">Supports .csv files up to 10MB</p>
            </label>
          </div>

          {/* Direct CSV Textarea Paste */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Or Paste Raw CSV Data:
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parseCsv(e.target.value);
              }}
              placeholder={`name,sku,barcode,category,costPrice,sellingPrice,stock,minStockAlert,expirationDate,unit...`}
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Successfully imported {successCount} products!</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-800 mb-2">
                Parsed Products Preview ({parsedRows.length} items ready):
              </p>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-mono sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Barcode</th>
                      <th className="p-2 text-right">Cost</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {parsedRows.slice(0, 8).map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-900 truncate max-w-[140px]">{p.name}</td>
                        <td className="p-2 font-mono text-slate-500">{p.sku}</td>
                        <td className="p-2 font-mono text-slate-500">{p.barcode}</td>
                        <td className="p-2 text-right font-mono">${p.costPrice?.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-700">
                          ${p.sellingPrice?.toFixed(2)}
                        </td>
                        <td className="p-2 text-center font-mono font-bold">{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Import ({parsedRows.length} Products)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

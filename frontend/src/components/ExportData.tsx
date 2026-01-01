'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ExportOptions {
  type: 'failure-patterns' | 'success-patterns' | 'audit-trails' | 'all';
  format: 'json' | 'csv' | 'yaml';
  startDate?: string;
  endDate?: string;
}

export function ExportData() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<ExportOptions['type']>('all');
  const [format, setFormat] = useState<ExportOptions['format']>('json');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = async () => {
    if (!user?.id) return;

    setExporting(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      
      // Get auth token
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      let url = `${API_BASE_URL}/export/${exportType}?format=${format}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${exportType}-${Date.now()}.${format === 'yaml' ? 'yaml' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Export Institutional Memory
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Export your failure patterns, success patterns, and audit trails. Note: Exports contain partial value - pattern matching and recognition capabilities are proprietary.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Type
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as ExportOptions['type'])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Data</option>
            <option value="failure-patterns">Failure Patterns</option>
            <option value="success-patterns">Success Patterns</option>
            <option value="audit-trails">Audit Trails</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportOptions['format'])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            {exportType === 'success-patterns' && <option value="yaml">YAML</option>}
          </select>
        </div>

        {exportType === 'audit-trails' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date (optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exporting ? 'Exporting...' : 'Export Data'}
        </button>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Exported data has partial value. Pattern matching algorithms and prevention rules are proprietary and cannot be exported. Switching to alternatives will lose these capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}

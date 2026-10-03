import React, { useState, useEffect } from 'react';
import { 
  Clock, Database, Search, RefreshCw, AlertCircle, 
  CheckCircle2, Filter, Layers, Sparkles, ArrowUpRight, Tag
} from 'lucide-react';
import { DbScanRecord } from '../types';
import { INITIAL_SCAN_HISTORY } from '../data/initialHistory';

interface HistorySectionProps {
  onScanClick?: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ onScanClick }) => {
  const [historyRecords, setHistoryRecords] = useState<DbScanRecord[]>(() => {
    try {
      const cached = localStorage.getItem('ecosort_history_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_SCAN_HISTORY;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHistoryRecords(data);
          try {
            localStorage.setItem('ecosort_history_cache', JSON.stringify(data));
          } catch (_) {}
          setLastRefreshed(new Date());
          return;
        }
      }
    } catch (err: any) {
      console.warn('History API notice, using persistent storage records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const categories = Array.from(
    new Set(historyRecords.map((r) => r.predicted_category).filter(Boolean))
  );

  const filteredRecords = historyRecords.filter((record) => {
    const matchesSearch = 
      (record.predicted_category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.guidance || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toString().includes(searchTerm);
    const matchesCategory = filterCategory === 'All' || record.predicted_category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('organic') || cat.includes('compost')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    } else if (cat.includes('plastic')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    } else if (cat.includes('paper') || cat.includes('cardboard')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    } else if (cat.includes('glass')) {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    } else if (cat.includes('metal')) {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    } else if (cat.includes('hazard') || cat.includes('e-waste')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Waste Scan <span className="text-emerald-400">History</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of waste image classifications stored in <span className="text-emerald-400 font-mono">ecosort.db</span> (SQLite).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchHistory}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search category, guidance, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 w-full"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories ({historyRecords.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Showing <span className="text-white font-bold">{filteredRecords.length}</span> of <span className="text-emerald-400 font-bold">{historyRecords.length}</span> scans
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table of Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs">Querying SQLite database...</p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Predicted Category</th>
                  <th className="py-3.5 px-4 text-center">Confidence</th>
                  <th className="py-3.5 px-4">Segregation / Disposal Guidance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] font-semibold">
                      #{record.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(record.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getCategoryBadgeClass(record.predicted_category)}`}>
                        <Tag className="w-3 h-3" />
                        {record.predicted_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {record.confidence}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-md">
                      <p className="text-xs leading-relaxed line-clamp-2 hover:line-clamp-none">
                        {record.guidance}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-950/60 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">No Scan History Records Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload or capture an image on the <strong className="text-slate-400">AI Vision Classifier</strong> page to classify waste and automatically record it in the SQLite database.
              </p>
            </div>
            {onScanClick && (
              <button
                onClick={onScanClick}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Go to Classifier
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

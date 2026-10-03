import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, PieChart as PieIcon, Layers, Download, Search, 
  Database, Sparkles, FileText, CheckCircle2, Info, ArrowUpRight,
  ShieldCheck, RefreshCw, TrendingUp, Clock, Tag
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { ClassificationResult, DbScanRecord, BackendStats } from '../types';
import { DATASET_CLASSES, RAW_DATASET_REPORT } from '../data/datasetStats';
import { INITIAL_SCAN_HISTORY } from '../data/initialHistory';

interface AnalyticsDashboardProps {
  sessionScans: ClassificationResult[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ sessionScans }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeLogTab, setActiveLogTab] = useState<'database' | 'session'>('database');

  // Backend SQLite stats and history state
  const [dbHistory, setDbHistory] = useState<DbScanRecord[]>(() => {
    try {
      const cached = localStorage.getItem('ecosort_history_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_SCAN_HISTORY;
  });
  const [dbStats, setDbStats] = useState<BackendStats | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);

  const fetchDatabaseData = async () => {
    setIsLoadingDb(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch('/api/stats').catch(() => null),
        fetch('/api/history').catch(() => null)
      ]);

      if (historyRes && historyRes.ok) {
        const historyData = await historyRes.json();
        if (Array.isArray(historyData) && historyData.length > 0) {
          setDbHistory(historyData);
          try {
            localStorage.setItem('ecosort_history_cache', JSON.stringify(historyData));
          } catch (_) {}
        }
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setDbStats(statsData);
      }
    } catch (err) {
      console.warn('Backend DB stats notice, utilizing local storage records:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, [sessionScans]);

  // Compute dynamic totals combined with live session scans
  const { totalAnalyzed, classData, streamData, recyclablesPercentage } = useMemo(() => {
    const totalSessionCount = sessionScans.length;
    const combinedTotal = RAW_DATASET_REPORT.totalImages + totalSessionCount;

    // Count session items per dataset class key
    const sessionClassCounts: Record<string, number> = {};
    sessionScans.forEach((scan) => {
      const cat = (scan.category || '').toLowerCase();
      let matchedKey = 'trash';
      if (cat.includes('cloth') || cat.includes('textile')) matchedKey = 'clothes';
      else if (cat.includes('shoe') || cat.includes('footwear')) matchedKey = 'shoes';
      else if (cat.includes('paper')) matchedKey = 'paper';
      else if (cat.includes('cardboard')) matchedKey = 'cardboard';
      else if (cat.includes('plastic')) matchedKey = 'plastic';
      else if (cat.includes('glass')) {
        if (cat.includes('green')) matchedKey = 'green-glass';
        else if (cat.includes('brown')) matchedKey = 'brown-glass';
        else matchedKey = 'white-glass';
      } else if (cat.includes('metal')) matchedKey = 'metal';
      else if (cat.includes('bio') || cat.includes('compost') || cat.includes('organic')) matchedKey = 'biological';
      else if (cat.includes('battery') || cat.includes('e-waste') || cat.includes('hazard')) matchedKey = 'battery';

      sessionClassCounts[matchedKey] = (sessionClassCounts[matchedKey] || 0) + 1;
    });

    // Update class counts and percentages dynamically
    const updatedClasses = DATASET_CLASSES.map((cls) => {
      const added = sessionClassCounts[cls.rawKey] || 0;
      const count = cls.count + added;
      const percentage = Number(((count / combinedTotal) * 100).toFixed(2));
      return {
        ...cls,
        count,
        percentage
      };
    });

    // Sort classes by count descending
    updatedClasses.sort((a, b) => b.count - a.count);

    // Calculate Stream Breakdown
    const recyclableCount = updatedClasses
      .filter((c) => c.stream === 'Recyclable')
      .reduce((acc, c) => acc + c.count, 0);

    const textilesCount = updatedClasses
      .filter((c) => c.stream === 'Textiles')
      .reduce((acc, c) => acc + c.count, 0);

    const organicCount = updatedClasses
      .filter((c) => c.stream === 'Organic')
      .reduce((acc, c) => acc + c.count, 0);

    const hazardousCount = updatedClasses
      .filter((c) => c.stream === 'Hazardous')
      .reduce((acc, c) => acc + c.count, 0);

    const residualCount = updatedClasses
      .filter((c) => c.stream === 'Residual')
      .reduce((acc, c) => acc + c.count, 0);

    const streams = [
      { name: 'Textiles & Apparel', count: textilesCount, percentage: Number(((textilesCount / combinedTotal) * 100).toFixed(2)), color: '#8b5cf6' },
      { name: 'Recyclable Materials', count: recyclableCount, percentage: Number(((recyclableCount / combinedTotal) * 100).toFixed(2)), color: '#2563eb' },
      { name: 'Organic & Biological', count: organicCount, percentage: Number(((organicCount / combinedTotal) * 100).toFixed(2)), color: '#16a34a' },
      { name: 'Hazardous & Batteries', count: hazardousCount, percentage: Number(((hazardousCount / combinedTotal) * 100).toFixed(2)), color: '#dc2626' },
      { name: 'Residual Trash', count: residualCount, percentage: Number(((residualCount / combinedTotal) * 100).toFixed(2)), color: '#64748b' }
    ];

    const recPct = Number(((recyclableCount / combinedTotal) * 100).toFixed(1));

    return {
      totalAnalyzed: combinedTotal,
      classData: updatedClasses,
      streamData: streams,
      recyclablesPercentage: recPct
    };
  }, [sessionScans]);

  // Filter active session scans
  const filteredSessionScans = useMemo(() => {
    return sessionScans.filter((log) => {
      const matchesSearch = (log.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (log.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || log.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sessionScans, searchTerm, filterCategory]);

  // Filter SQLite DB history records
  const filteredDbRecords = useMemo(() => {
    return dbHistory.filter((rec) => {
      const matchesSearch = (rec.predicted_category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (rec.guidance || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rec.id.toString().includes(searchTerm);
      const matchesCategory = filterCategory === 'All' || rec.predicted_category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [dbHistory, searchTerm, filterCategory]);

  const handleExportCSV = () => {
    if (activeLogTab === 'database' && dbHistory.length > 0) {
      const rows = [
        ['ID', 'Timestamp', 'Predicted Category', 'Confidence (%)', 'Guidance'],
        ...dbHistory.map(r => [
          r.id.toString(),
          r.created_at,
          `"${r.predicted_category}"`,
          r.confidence.toString(),
          `"${r.guidance.replace(/"/g, '""')}"`
        ])
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `EcoSort_DB_History_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (sessionScans.length > 0) {
      const rows = [
        ['Scan ID', 'Timestamp', 'Item Name', 'Category', 'Target Bin', 'Confidence (%)'],
        ...sessionScans.map(s => [
          s.id,
          s.timestamp,
          `"${s.itemName}"`,
          `"${s.category}"`,
          `"${s.primaryBin}"`,
          (s.confidence ?? 95).toString()
        ])
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `EcoSort_Session_Scans_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const rows = [
        ['Class Name', 'Stream', 'Image Count', 'Percentage of Total'],
        ...classData.map(c => [c.name, c.stream, c.count.toString(), `${c.percentage}%`])
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `EcoSort_Dataset_Analytics.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              EcoSort <span className="text-emerald-400">Eco Insights & Analytics</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics powered by SQLite database (<span className="text-emerald-400 font-mono">ecosort.db</span>) and MobileNetV2.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDatabaseData}
            disabled={isLoadingDb}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
            Sync DB Stats
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards: Database & Model Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total SQLite DB Scans */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total Database Scans</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {(dbStats?.total_scans ?? dbHistory.length).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            Recorded in <span className="text-emerald-400 font-mono">ecosort.db (scan_history)</span>
          </p>
        </div>

        {/* Card 2: Most Frequently Detected Category */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Most Detected Category</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-teal-400 tracking-tight truncate">
            {dbStats?.most_detected_category || (dbHistory.length > 0 ? dbHistory[0].predicted_category : 'Awaiting Scans')}
          </p>
          <p className="text-[11px] text-slate-400">
            Highest frequency waste stream in DB
          </p>
        </div>

        {/* Card 3: Waste Categories Tracked */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Waste Categories Tracked</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {dbStats?.category_counts ? Object.keys(dbStats.category_counts).length : 8}
          </p>
          <p className="text-[11px] text-slate-400">
            Active classification categories with guidance
          </p>
        </div>

        {/* Card 4: Active Session Scans */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Active Session Scans</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {sessionScans.length}
          </p>
          <p className="text-[11px] text-slate-400">
            Classifications processed in current tab
          </p>
        </div>

      </div>

      {/* Database Category Breakdown Summary Cards */}
      {dbStats && dbStats.category_counts && Object.keys(dbStats.category_counts).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              SQLite Database Waste-Category Counts (/api/stats)
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Total DB Scans: {dbStats.total_scans}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(dbStats.category_counts).map(([catName, count]) => (
              <div key={catName} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
                <span className="text-[11px] text-slate-300 font-medium truncate block">{catName}</span>
                <p className="text-xl font-extrabold text-emerald-400 font-mono">{count}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {dbStats.total_scans > 0 ? ((count / dbStats.total_scans) * 100).toFixed(1) : 0}% of scans
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Image Distribution Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Category Image Distribution
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Total: {totalAnalyzed.toLocaleString()} images</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  interval={0} 
                  angle={-30} 
                  textAnchor="end" 
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} images (${item.payload.percentage}%)`,
                    `Class: ${item.payload.name}`
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 font-mono">
            <span>Largest class: <strong className="text-purple-400">Clothes (5,325 / 34.3%)</strong></span>
            <span>Smallest class: <strong className="text-amber-400">Brown Glass (607 / 3.9%)</strong></span>
          </div>
        </div>

        {/* Stream Composition Pie */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Material Stream Breakdown
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">5 Stream Categories</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={streamData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {streamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} images (${item.payload.percentage}%)`,
                    item.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend List */}
          <div className="space-y-1.5 text-xs">
            {streamData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="font-mono text-slate-400 shrink-0">
                  <span className="text-slate-200 font-semibold mr-1.5">{item.count.toLocaleString()}</span>
                  <span>({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* History Records View (Toggle between Database Scan History and Session Scans) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Scan History & Audit Logs
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              View persistent scan history stored in SQLite (<span className="text-emerald-400 font-mono">ecosort.db</span>) or current active session logs.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveLogTab('database')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeLogTab === 'database'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SQLite Database ({dbHistory.length})
            </button>
            <button
              onClick={() => setActiveLogTab('session')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeLogTab === 'session'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Session Log ({sessionScans.length})
            </button>
          </div>
        </div>

        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search category, guidance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 w-full"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            {classData.map(c => (
              <option key={c.rawKey} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Database Table View */}
        {activeLogTab === 'database' ? (
          dbHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Predicted Category</th>
                    <th className="py-3 px-3 text-center">Confidence</th>
                    <th className="py-3 px-3">Segregation / Disposal Guidance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDbRecords.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px] font-semibold">
                        #{log.id}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400 border border-slate-700 font-medium">
                          {log.predicted_category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-400 font-semibold">
                        {log.confidence}%
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-md">
                        <p className="text-xs leading-relaxed line-clamp-2 hover:line-clamp-none">
                          {log.guidance}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-8 text-center space-y-3 text-slate-500">
              <Database className="w-6 h-6 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-slate-300">No SQLite Database Scans Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Run a waste scan using the <strong className="text-slate-400">AI Vision Classifier</strong> to record it in <strong className="text-slate-400">ecosort.db</strong>.
                </p>
              </div>
            </div>
          )
        ) : (
          /* Session Table View */
          sessionScans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Item Identification</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Target Bin</th>
                    <th className="py-3 px-3 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSessionScans.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {log.itemName}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium" style={{ color: log.binColor }}>
                        {log.primaryBin}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">
                        {log.confidence ?? 95}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-8 text-center space-y-3 text-slate-500">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-slate-300">No Active Session Scans Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Scans performed in this browser tab will appear here.
                </p>
              </div>
            </div>
          )
        )}

      </div>

    </div>
  );
};

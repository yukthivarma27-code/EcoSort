import React, { useState } from 'react';
import { 
  BarChart3, PieChart as PieIcon, TrendingUp, ShieldCheck, 
  Leaf, Download, Search, Filter, Layers, FileText
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { ClassificationResult } from '../types';

interface AnalyticsDashboardProps {
  sessionScans: ClassificationResult[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ sessionScans }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Aggregated Static Enterprise Demo Data + Live Session Data
  const streamData = [
    { name: 'Recyclable Plastics', value: 34, color: '#2563eb' },
    { name: 'Paper & Cardboard', value: 26, color: '#eab308' },
    { name: 'Compostable Organic', value: 22, color: '#16a34a' },
    { name: 'E-Waste & Electronics', value: 8, color: '#dc2626' },
    { name: 'Glass & Metals', value: 7, color: '#06b6d4' },
    { name: 'Landfill Residuals', value: 3, color: '#4b5563' },
  ];

  const monthlyTrends = [
    { month: 'Jan', recycled: 1240, composted: 890, landfill: 210 },
    { month: 'Feb', recycled: 1420, composted: 950, landfill: 180 },
    { month: 'Mar', recycled: 1680, composted: 1120, landfill: 160 },
    { month: 'Apr', recycled: 1890, composted: 1340, landfill: 140 },
    { month: 'May', recycled: 2150, composted: 1560, landfill: 120 },
    { month: 'Jun', recycled: 2480, composted: 1820, landfill: 95 },
  ];

  // Combined mock + actual session history
  const defaultHistory: ClassificationResult[] = [
    {
      id: 'demo-101',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      itemName: 'High-Density Polyethylene Jug (HDPE #2)',
      category: 'Recyclable Plastics',
      primaryBin: 'Blue Bin (Recycling)',
      binColor: '#2563eb',
      confidence: 98,
      recyclabilityScore: 95,
      contaminationRisk: 'Low',
      composition: [{ material: 'HDPE Plastic', percentage: 100 }],
      segregationSteps: ['Rinse liquid residue', 'Keep cap attached'],
      impact: { co2SavedKg: 0.24, energySavedKwh: 0.45, waterSavedLiters: 1.8, decompositionYears: 100 },
      upcyclingIdeas: ['Planter container'],
      localDisposalNotice: 'Curbside recyclable.'
    },
    {
      id: 'demo-102',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      itemName: 'Printed Circuit Motherboard Assembly',
      category: 'E-Waste & Electronics',
      primaryBin: 'Red Bin (E-Waste / Hazardous)',
      binColor: '#dc2626',
      confidence: 96,
      recyclabilityScore: 88,
      contaminationRisk: 'High',
      composition: [{ material: 'Copper & Silicon', percentage: 70 }, { material: 'Solder', percentage: 30 }],
      segregationSteps: ['Insulate terminals with tape', 'Drop off at kiosk'],
      impact: { co2SavedKg: 1.85, energySavedKwh: 5.2, waterSavedLiters: 22.0, decompositionYears: 1000 },
      upcyclingIdeas: ['Extract rare earth minerals'],
      localDisposalNotice: 'Hazardous e-waste facility mandatory.'
    },
    {
      id: 'demo-103',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      itemName: 'Raw Coffee Grounds & Filters',
      category: 'Compostable & Organic',
      primaryBin: 'Green Bin (Compost/Organics)',
      binColor: '#16a34a',
      confidence: 99,
      recyclabilityScore: 100,
      contaminationRisk: 'Low',
      composition: [{ material: 'Organic Carbon Matter', percentage: 100 }],
      segregationSteps: ['Place directly in green organics caddy'],
      impact: { co2SavedKg: 0.38, energySavedKwh: 0.10, waterSavedLiters: 0.5, decompositionYears: 0.1 },
      upcyclingIdeas: ['Direct nitrogen soil amendment'],
      localDisposalNotice: 'Compost bin compliant.'
    },
    {
      id: 'demo-104',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      itemName: 'Corrugated Cardboard Transit Box',
      category: 'Paper & Cardboard',
      primaryBin: 'Yellow Bin (Paper/Cardboard)',
      binColor: '#eab308',
      confidence: 97,
      recyclabilityScore: 94,
      contaminationRisk: 'Low',
      composition: [{ material: 'Kraft Wood Pulp', percentage: 100 }],
      segregationSteps: ['Strip adhesive tape', 'Flatten flat'],
      impact: { co2SavedKg: 0.42, energySavedKwh: 0.92, waterSavedLiters: 8.2, decompositionYears: 0.2 },
      upcyclingIdeas: ['Mulch sheet for garden beds'],
      localDisposalNotice: 'Paper container compliant.'
    }
  ];

  const allLogs = [...sessionScans, ...defaultHistory];

  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch = log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || log.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
              Enterprise <span className="text-emerald-400">Waste Intelligence</span> Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time material diversion telemetry, carbon footprint accounting, and ISO 14001 compliance logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Telemetry Online
          </span>
          <button 
            onClick={() => alert('Exporting full enterprise CSV audit report...')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Telemetry CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Landfill Diversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono tracking-tight">
            88.4<span className="text-emerald-400 text-xl">%</span>
          </p>
          <p className="text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">+4.2%</span> vs prior quarter benchmark
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total Items Classified</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono tracking-tight">
            14,280
          </p>
          <p className="text-[11px] text-slate-400">
            Across 12 connected processing facilities
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Carbon Offsets (CO2e)</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono tracking-tight">
            3,420 <span className="text-xs font-normal text-slate-400">kg</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Equivalent to planting ~165 mature trees
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Contamination Rate</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white font-mono tracking-tight">
            2.1<span className="text-amber-400 text-xl">%</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Industry average baseline is 18.5%
          </p>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Stream Breakdown Pie */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Waste Stream Composition
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Q2 Audit Data</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={streamData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {streamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {streamData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name}</span>
                <span className="font-mono text-slate-400 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Diversion Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Monthly Diversion Volume (Tons)
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Recycled</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Composted</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Landfill</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="recycled" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="composted" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="landfill" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Landfill residue volume reduced by <span className="text-emerald-400 font-semibold">54.7%</span> since EcoSort AI integration.
          </p>
        </div>

      </div>

      {/* Segregation History Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Verified Segregation Records
            </h2>
            <p className="text-xs text-slate-400">
              Audit trail of items processed during active session and historical benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search material or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Recyclable Plastics">Plastics</option>
              <option value="Paper & Cardboard">Paper/Cardboard</option>
              <option value="Compostable & Organic">Organics</option>
              <option value="E-Waste & Electronics">E-Waste</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Item Identification</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Target Container</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-right">CO2 Offsets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
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
                  <td className="py-3 px-3 text-center font-mono text-emerald-400">
                    {log.confidence}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200">
                    +{log.impact.co2SavedKg} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

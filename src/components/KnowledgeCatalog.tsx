import React, { useState } from 'react';
import { 
  BookOpen, Search, CheckCircle2, AlertCircle, 
  Trash2, ShieldAlert, Sparkles, Filter 
} from 'lucide-react';
import { CATALOG_ITEMS } from '../data/catalog';

export const KnowledgeCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Recyclable Plastics',
    'Paper & Cardboard',
    'Compostable & Organic',
    'Metal & Aluminum',
    'E-Waste & Electronics',
    'Glass & Glassware'
  ];

  const filteredItems = CATALOG_ITEMS.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.commonExamples.some((ex) => ex.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Waste Segregation <span className="text-emerald-400">Materials Knowledge Hub</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Comprehensive enterprise guidelines for material identification, decontamination protocols, regional bin routing standards, and contamination risk mitigation.
        </p>
      </div>

      {/* Controls Bar: Search & Category Pills */}
      <div className="space-y-4">
        
        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search material type, e.g. PET, battery, pizza box, aluminum foil, glass..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Catalog Material Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 transition-all hover:shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {item.name}
                  </h3>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {item.recyclable && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Recyclable
                    </span>
                  )}
                  {item.compostable && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Compostable
                    </span>
                  )}
                </div>
              </div>

              {/* Recommended Container */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Container:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  {item.recommendedBin}
                </span>
              </div>

              {/* Examples */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-mono text-slate-400 uppercase">Common Items:</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.commonExamples.map((ex, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-800/80 text-slate-300">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preparation Steps */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <p className="text-[11px] font-mono text-slate-400 uppercase">Preparation Guidelines:</p>
                <ul className="space-y-1 text-xs text-slate-300">
                  {item.preparationTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Contamination Mistake Alert */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                <p className="font-semibold flex items-center gap-1 text-[11px] uppercase font-mono">
                  <ShieldAlert className="w-3.5 h-3.5" /> Common Contamination Error:
                </p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {item.commonMistakes}
                </p>
              </div>

            </div>

            {/* Footer duration */}
            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Decomposition:</span>
              <span className="text-white font-medium">{item.decompositionTime}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

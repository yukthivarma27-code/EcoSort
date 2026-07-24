import React from 'react';
import { Leaf, Cpu, BarChart3, BookOpen, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'classifier' | 'analytics' | 'catalog' | 'enterprise';
  setActiveTab: (tab: 'classifier' | 'analytics' | 'catalog' | 'enterprise') => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenContact }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Branding */}
          <div 
            onClick={() => setActiveTab('classifier')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white font-mono">
                  EcoSort<span className="text-emerald-400">.AI</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  v2.4 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                AI Vision Waste Intelligence Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            <button
              id="nav-classifier"
              onClick={() => setActiveTab('classifier')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'classifier'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              AI Vision Classifier
            </button>

            <button
              id="nav-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Enterprise Analytics
            </button>

            <button
              id="nav-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Materials Hub
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              id="btn-header-contact"
              onClick={onOpenContact}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Enterprise API
            </button>

            <button
              id="btn-header-classify"
              onClick={() => setActiveTab('classifier')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-950/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Item</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900 px-2 py-1.5 justify-around">
        <button
          onClick={() => setActiveTab('classifier')}
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium rounded-lg ${
            activeTab === 'classifier' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4 mb-0.5" />
          Classifier
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium rounded-lg ${
            activeTab === 'analytics' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium rounded-lg ${
            activeTab === 'catalog' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          Catalog
        </button>
      </div>
    </header>
  );
};

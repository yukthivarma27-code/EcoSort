import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WasteClassifier } from './components/WasteClassifier';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { KnowledgeCatalog } from './components/KnowledgeCatalog';
import { LegalModals } from './components/LegalModals';
import { ClassificationResult } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'classifier' | 'analytics' | 'catalog' | 'enterprise'>('classifier');
  const [scanHistory, setScanHistory] = useState<ClassificationResult[]>([]);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  const handleScanComplete = (result: ClassificationResult) => {
    setScanHistory((prev) => [result, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenContact={() => setActiveModal('contact')}
      />

      {/* Main App Content View Router */}
      <main className="flex-1">
        {activeTab === 'classifier' && (
          <WasteClassifier 
            onScanComplete={handleScanComplete}
            history={scanHistory}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            sessionScans={scanHistory}
          />
        )}

        {activeTab === 'catalog' && (
          <KnowledgeCatalog />
        )}
      </main>

      {/* Corporate Footer */}
      <Footer 
        onOpenPrivacy={() => setActiveModal('privacy')}
        onOpenTerms={() => setActiveModal('terms')}
        onOpenContact={() => setActiveModal('contact')}
      />

      {/* Privacy Policy, Terms, and Contact Modals */}
      <LegalModals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

    </div>
  );
}

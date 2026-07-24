import React, { useState } from 'react';
import { X, Shield, FileText, Mail, CheckCircle2, Send, Building } from 'lucide-react';

interface LegalModalsProps {
  activeModal: 'privacy' | 'terms' | 'contact' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });

  if (!activeModal) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {activeModal === 'privacy' && <Shield className="w-4 h-4" />}
              {activeModal === 'terms' && <FileText className="w-4 h-4" />}
              {activeModal === 'contact' && <Mail className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Service'}
                {activeModal === 'contact' && 'Enterprise API & Solutions Request'}
              </h3>
              <p className="text-xs text-slate-400">
                EcoSort AI Technologies Inc. Corporate Governance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          
          {/* Privacy Policy Content */}
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <p>
                <strong>Last Updated: January 2026</strong>
              </p>
              <p>
                At EcoSort AI Technologies Inc., we are committed to upholding rigorous standards of data privacy and computer vision telemetry security. This Privacy Policy outlines how image frame data and metadata are processed through our AI vision classification models.
              </p>
              
              <h4 className="font-bold text-white text-sm">1. Image & Telemetry Data Processing</h4>
              <p>
                Images captured or uploaded to EcoSort AI Studio are processed ephemerally solely for the purpose of material classification, bounding box detection, and environmental impact calculation. We do not store raw personally identifiable biometric information.
              </p>

              <h4 className="font-bold text-white text-sm">2. AI Model Training & Anonymization</h4>
              <p>
                Telemetry logs utilized for continuous model improvement are strictly anonymized and aggregated into high-dimensional feature vectors. Enterprise clients maintaining private dedicated models enjoy zero-retention data boundaries.
              </p>

              <h4 className="font-bold text-white text-sm">3. Security Compliance</h4>
              <p>
                All data in transit is encrypted using TLS 1.3 standards. Our serverless architecture complies with SOC-2 Type II standards and ISO 27001 cybersecurity directives.
              </p>
            </div>
          )}

          {/* Terms of Service Content */}
          {activeModal === 'terms' && (
            <div className="space-y-4">
              <p>
                <strong>Effective Date: January 2026</strong>
              </p>
              <p>
                Welcome to EcoSort AI. By accessing or integrating our AI Vision Classification APIs, SaaS dashboard, or smart bin hardware integrations, you agree to comply with these Terms of Service.
              </p>

              <h4 className="font-bold text-white text-sm">1. Commercial License & API Usage</h4>
              <p>
                EcoSort AI grants enterprise users a non-exclusive, non-transferable license to query our waste intelligence endpoint for automated sorting, recycling verification, and municipal waste auditing.
              </p>

              <h4 className="font-bold text-white text-sm">2. Classification Accuracy Disclaimer</h4>
              <p>
                While our neural vision models maintain &gt;98.5% benchmark precision, local disposal policies and municipal guidelines vary. Users should verify specialized hazardous material routing (e.g. chemical waste, lithium-ion battery banks) with regional waste authorities.
              </p>

              <h4 className="font-bold text-white text-sm">3. Service Level Agreements (SLA)</h4>
              <p>
                Enterprise subscribers are guaranteed 99.9% API uptime with sub-400ms global inference latency.
              </p>
            </div>
          )}

          {/* Contact Enterprise Form */}
          {activeModal === 'contact' && (
            <div>
              {contactSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Enterprise Request Received</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Thank you. An EcoSort AI sustainability engineer will contact your team within 24 hours to coordinate API keys and pilot integration.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <p className="text-slate-400">
                    Connect with our solution engineers to integrate EcoSort AI Vision into your smart bins, recycling facilities, or ESG compliance pipeline.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-400">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sarah@sustainabilitycorp.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400">Organization / Municipality *</label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Apex Recycling Solutions LLC"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400">Integration Requirements *</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your daily tonnage, smart bin fleet size, or camera hardware integration needs..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Enterprise Request
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Leaf, Shield, FileText, Mail, Github, Linkedin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms, onOpenContact }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white font-mono tracking-tight">
                EcoSort<span className="text-emerald-400">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering organizations, municipalities, and industries with real-time AI computer vision for precise waste segregation, compliance tracking, and automated carbon accounting.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                id="link-github"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                id="link-linkedin"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Technology Solutions
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">
                AI Vision Waste Scanner
              </li>
              <li className="text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">
                Smart Bin Sensor Integration
              </li>
              <li className="text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">
                Municipal Contamination Analytics
              </li>
              <li className="text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">
                ISO 14001 ESG Reporting API
              </li>
              <li className="text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">
                Circular Economy Material Auditing
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate & Legal */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Corporate & Governance
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  id="footer-privacy-link"
                  onClick={onOpenPrivacy}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-terms-link"
                  onClick={onOpenTerms}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  id="footer-contact-link"
                  onClick={onOpenContact}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact Enterprise Team
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform Security */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              System Infrastructure
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              EcoSort AI vision architecture runs on SOC-2 compliant serverless cloud nodes. High-throughput neural processing ensures &lt;400ms inference times.
            </p>
            <div className="pt-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span>Status: All Systems Operational</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 EcoSort AI Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy</span>
            <span>•</span>
            <span>Security</span>
            <span>•</span>
            <span>API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Server,
  Brain,
  Bell,
  Users,
  ChevronRight
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<
    'general' | 'security' | 'relay' | 'ai-guardrails' | 'rbac' | 'notifications'
  >('general');

  // Toggle States
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [aiAutonomousApproval, setAiAutonomousApproval] = useState(false);

  const categories = [
    { id: 'general', label: 'General & Display', icon: Settings },
    { id: 'security', label: 'Security & TLS Encryption', icon: Shield },
    { id: 'relay', label: 'Network & Relay Servers', icon: Server },
    { id: 'ai-guardrails', label: 'AI Agent Guardrails', icon: Brain },
    { id: 'rbac', label: 'Team & Access Control (RBAC)', icon: Users },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell }
  ];

  return (
    <div className="p-6 overflow-y-auto max-w-7xl mx-auto space-y-6">
      {/* Top Header - Google Account Style */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center font-bold">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Mimir Enterprise Platform Settings</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Manage global security preferences, relay servers, AI agent safety boundaries, and authentication policies.
          </p>
        </div>
      </div>

      {/* Main Settings Split View (Categories Left, Cards Right) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Categories Menu */}
        <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-1 self-start">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#80868B]">
            Settings Menu
          </div>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-[#E8F0FE] text-[#1A73E8]'
                    : 'text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#202124]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`} />
                  <span>{cat.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#1A73E8]' : 'text-[#80868B]'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Settings Cards Panel */}
        <div className="md:col-span-3 space-y-6">
          {activeCategory === 'general' && (
            <>
              {/* Card 1: Performance & Rendering */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
                <h3 className="text-sm font-bold text-[#202124]">Performance &amp; Hardware Acceleration</h3>
                <p className="text-xs text-[#5F6368]">
                  Optimize remote desktop frame rates and canvas rendering efficiency.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                  <div>
                    <div className="text-xs font-semibold text-[#202124]">GPU Hardware Acceleration</div>
                    <div className="text-[11px] text-[#5F6368]">Use WebGL / Direct3D for 60 FPS remote screen rendering.</div>
                  </div>
                  <button
                    onClick={() => setHardwareAcceleration(!hardwareAcceleration)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      hardwareAcceleration ? 'bg-[#1A73E8]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        hardwareAcceleration ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card 2: Preferred Display Resolution */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
                <h3 className="text-sm font-bold text-[#202124]">Default Screen Stream Quality</h3>

                <div className="grid grid-cols-3 gap-3">
                  {['Adaptive 1080p', 'Native Monitor DPI', 'Lossless 4K'].map((res) => (
                    <label
                      key={res}
                      className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] flex items-center space-x-2 cursor-pointer hover:bg-white hover:border-[#1A73E8]"
                    >
                      <input type="radio" name="res" defaultChecked={res.includes('1080p')} className="accent-[#1A73E8]" />
                      <span className="text-xs font-semibold text-[#202124]">{res}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeCategory === 'security' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
              <h3 className="text-sm font-bold text-[#202124]">Zero-Trust Cryptographic Policy</h3>
              <p className="text-xs text-[#5F6368]">Enforce TLS 1.3 and AES-256 end-to-end encryption for all remote sessions.</p>

              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#202124]">TLS 1.3 Mutual Authentication</div>
                    <div className="text-[11px] text-[#34A853] font-semibold">Strict RSA-4096 / Ed25519 Certificate Pinning</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#E6F4EA] text-[#34A853] text-xs font-bold">Enforced</span>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'ai-guardrails' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
              <h3 className="text-sm font-bold text-[#202124]">AI Agent Autonomous Safety Guardrails</h3>
              <p className="text-xs text-[#5F6368]">Set approval thresholds for Mimir AI execution engine.</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                <div>
                  <div className="text-xs font-semibold text-[#202124]">Require Admin Sign-off for High-Risk Commands</div>
                  <div className="text-[11px] text-[#5F6368]">Blocks destructive shell commands automatically until manual approval.</div>
                </div>
                <button
                  onClick={() => setAiAutonomousApproval(!aiAutonomousApproval)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    !aiAutonomousApproval ? 'bg-[#34A853]' : 'bg-[#E5E7EB]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      !aiAutonomousApproval ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeCategory === 'relay' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
              <h3 className="text-sm font-bold text-[#202124]">Custom RustDesk Relay &amp; Signal Servers</h3>
              <p className="text-xs text-[#5F6368]">Configure self-hosted hbbs / hbbr relay server clusters.</p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#5F6368] uppercase block mb-1">ID / Signal Server Host</label>
                  <input
                    type="text"
                    defaultValue="us-east-1.mimir.net:21116"
                    className="w-full bg-[#F8F9FA] text-xs font-mono text-[#202124] px-3 py-2 rounded-xl border border-[#E5E7EB]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#5F6368] uppercase block mb-1">Relay Server Host</label>
                  <input
                    type="text"
                    defaultValue="us-east-1-relay.mimir.net:21117"
                    className="w-full bg-[#F8F9FA] text-xs font-mono text-[#202124] px-3 py-2 rounded-xl border border-[#E5E7EB]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'rbac' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
              <h3 className="text-sm font-bold text-[#202124]">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-[#5F6368]">Manage user privileges and enterprise SSO integration.</p>
              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] text-xs text-[#202124]">
                Google Workspace SAML 2.0 Single Sign-On Active. Enforcing FIDO2 WebAuthn YubiKey MFA.
              </div>
            </div>
          )}

          {activeCategory === 'notifications' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
              <h3 className="text-sm font-bold text-[#202124]">Notification Channels</h3>
              <p className="text-xs text-[#5F6368]">Configure Slack, PagerDuty, and Email alerts for pending approvals.</p>
              <div className="p-4 bg-[#E6F4EA] rounded-xl border border-[#34A853]/30 text-xs text-[#202124]">
                Slack Webhook Connected: #mimir-security-approvals
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

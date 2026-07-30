import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ProfileView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-google-sm flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-xl font-bold">
          AC
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Alex Chen</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">Principal Infrastructure &amp; Security Administrator</p>
          <span className="inline-block mt-2 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#E8F0FE] text-[#1A73E8]">
            Super Admin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
          <h3 className="text-sm font-bold text-[#202124]">Identity &amp; Enterprise Role</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <span className="text-[#5F6368]">Email</span>
              <span className="font-semibold text-[#202124]">alex.chen@mimir.corp</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <span className="text-[#5F6368]">Organization</span>
              <span className="font-semibold text-[#202124]">Mimir Enterprise Global</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <span className="text-[#5F6368]">SSO Provider</span>
              <span className="font-semibold text-[#1A73E8]">Google Workspace SAML</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-4">
          <h3 className="text-sm font-bold text-[#202124]">Security Keys &amp; MFA Status</h3>
          <div className="p-3 bg-[#E6F4EA] border border-[#34A853]/30 rounded-xl text-xs text-[#202124] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#34A853]" />
              <span>YubiKey 5 NFC Hardware Key Active</span>
            </div>
            <span className="font-bold text-[#34A853]">FIDO2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

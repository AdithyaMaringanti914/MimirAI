import React, { useState, useEffect } from 'react';
import { useConnectionManager } from '../hooks/useConnectionManager';
import { ShieldAlert, ShieldCheck, User, Laptop2, X, Check } from 'lucide-react';
import { type RequestPayload } from '../services/connection/types/socket';

export const IncomingConnectionDialog: React.FC = () => {
  const { manager } = useConnectionManager();
  const [incomingRequest, setIncomingRequest] = useState<RequestPayload & { sourceId: string } | null>(null);

  useEffect(() => {
    const unsubReq = manager.on('incoming_request', (req: any) => {
      setIncomingRequest(req);
    });
    const unsubCancel = manager.on('incoming_cancel', () => {
      setIncomingRequest(null);
    });
    return () => {
      unsubReq();
      unsubCancel();
    };
  }, [manager]);

  const acceptConnection = () => {
    if (incomingRequest) {
      manager.approveConnection(incomingRequest.sourceId);
      setIncomingRequest(null);
    }
  };

  const rejectConnection = () => {
    if (incomingRequest) {
      manager.rejectConnection(incomingRequest.sourceId);
      setIncomingRequest(null);
    }
  };

  if (!incomingRequest) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center space-x-3 bg-[#F8F9FA]">
          <div className="w-10 h-10 rounded-full bg-[#E8F0FE] flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#1A73E8]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#202124]">Incoming Connection</h2>
            <p className="text-[11px] text-[#5F6368]">Someone is requesting to control your device.</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <User className="w-4 h-4 text-[#5F6368]" />
              <span className="font-semibold text-[#202124]">{incomingRequest.deviceName}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <Laptop2 className="w-4 h-4 text-[#5F6368]" />
              <span className="text-[#5F6368]">{incomingRequest.platform}</span>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <span className="font-mono text-xs text-[#5F6368] bg-[#F3F4F6] px-2 py-0.5 rounded">
                ID: {incomingRequest.sourceId}
              </span>
            </div>
          </div>

          {/* Security Status */}
          <div className={`p-3 rounded-xl border flex items-start space-x-3 text-xs ${incomingRequest.passwordHash ? 'bg-[#E6F4EA] border-[#CEEAD6]' : 'bg-[#FCE8E6] border-[#FAD2CF]'}`}>
            {incomingRequest.passwordHash ? (
              <>
                <ShieldCheck className="w-5 h-5 text-[#34A853] flex-shrink-0" />
                <div className="text-[#0D652D]">
                  <span className="font-bold block">Password Provided</span>
                  <span className="opacity-90">The caller entered a device password.</span>
                </div>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 text-[#EA4335] flex-shrink-0" />
                <div className="text-[#A50E0E]">
                  <span className="font-bold block">No Password Provided</span>
                  <span className="opacity-90">The caller has requested interactive consent.</span>
                </div>
              </>
            )}
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={rejectConnection}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-[#5F6368] hover:text-[#EA4335] hover:bg-[#FCE8E6] hover:border-[#FAD2CF] font-semibold text-sm transition-colors flex items-center justify-center space-x-1.5"
            >
              <X className="w-4 h-4" />
              <span>Reject</span>
            </button>
            <button
              onClick={acceptConnection}
              className="flex-1 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Approve</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
             <button
              onClick={rejectConnection}
              className="flex-1 py-1.5 text-[11px] font-medium text-[#5F6368] hover:text-[#202124] transition-colors"
            >
              Always Deny
            </button>
             <button
              onClick={acceptConnection}
              className="flex-1 py-1.5 text-[11px] font-medium text-[#5F6368] hover:text-[#202124] transition-colors"
            >
              Always Allow
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

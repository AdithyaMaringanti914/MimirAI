import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getOrCreateDeviceId,
  getOrCreatePassword,
  refreshLocalPassword,
  resetIdentity as wipeIdentity,
  registerDevice,
  sendHeartbeat
} from '../services/device';
import { connectionManager } from '../services/connection/ConnectionManager';

export type HostStatus = 'offline' | 'ready' | 'connecting' | 'waiting' | 'disconnected';

export interface IncomingConnectionRequest {
  id: string;
  callerName: string;
  callerOs: string;
  callerIp: string;
  passwordVerified: boolean;
}

interface HostIdentityState {
  deviceId: string;
  password: string;
  hostStatus: HostStatus;
  incomingRequest: IncomingConnectionRequest | null;
  deviceName: string;
  refreshPassword: () => void;
  resetIdentity: () => void;
}

const HostIdentityContext = createContext<HostIdentityState | undefined>(undefined);

export const HostIdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hostStatus, setHostStatus] = useState<HostStatus>('offline');
  
  // Use computer hostname if possible, fallback to a standard name
  const deviceName = 'Adithya-PC'; 

  // Initialize identity on mount
  useEffect(() => {
    const id = getOrCreateDeviceId();
    const pw = getOrCreatePassword();
    setDeviceId(id);
    setPassword(pw);
    connectionManager.init(id);
    
    // Register device
    registerDevice(id, deviceName, 'windows', pw).then(() => {
      setHostStatus('ready');
    }).catch((err) => {
      console.warn('Backend unavailable, running offline', err);
      setHostStatus('offline');
    });
  }, []);

  // Heartbeat loop
  useEffect(() => {
    if (!deviceId) return;
    
    const interval = setInterval(() => {
      sendHeartbeat(deviceId, hostStatus, { cpu: 15, ram: 42 }).then(() => {
        setHostStatus(prev => prev === 'offline' ? 'ready' : prev);
      }).catch((err) => {
        console.warn('Heartbeat failed, going offline', err);
        setHostStatus('offline');
      });
    }, 15000); // 15 seconds
    
    return () => clearInterval(interval);
  }, [deviceId, hostStatus]);

  const refreshPassword = useCallback(() => {
    const newPw = refreshLocalPassword();
    setPassword(newPw);
    // Sync to backend
    import('../services/device/password').then(({ syncPassword }) => {
      if (deviceId) syncPassword(deviceId, newPw).catch(console.error);
    });
  }, [deviceId]);

  const resetIdentity = useCallback(() => {
    wipeIdentity();
    const id = getOrCreateDeviceId();
    const pw = getOrCreatePassword();
    setDeviceId(id);
    setPassword(pw);
    setHostStatus('ready');
  }, []);

  return (
    <HostIdentityContext.Provider
      value={{
        deviceId,
        password,
        hostStatus,
        deviceName,
        incomingRequest: null,
        refreshPassword,
        resetIdentity
      }}
    >
      {children}
    </HostIdentityContext.Provider>
  );
};

export const useHostIdentity = () => {
  const context = useContext(HostIdentityContext);
  if (context === undefined) {
    throw new Error('useHostIdentity must be used within a HostIdentityProvider');
  }
  return context;
};

import { useState, useEffect } from 'react';
import { connectionManager } from '../services/connection/ConnectionManager';
import { Session } from '../services/connection/types/session';

export function useConnectionManager() {
  const [session, setSession] = useState<Session | null>(connectionManager.session.session);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const unsubSession = connectionManager.on('session_change', (s: Session | null) => {
      setSession(s ? { ...s } : null);
    });

    const unsubStream = connectionManager.on('remote_stream', (stream: MediaStream) => {
      setRemoteStream(stream);
    });

    const unsubError = connectionManager.on('error', (err: any) => {
      setError(err);
      // Auto clear error after 5s
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      unsubSession();
      unsubStream();
      unsubError();
    };
  }, []);

  return {
    session,
    remoteStream,
    error,
    manager: connectionManager,
  };
}

/**
 * @file useClipboard.ts
 * @description Bi-directional clipboard synchronization hook over RTCDataChannel.
 *
 * Supports:
 *   - Reading local clipboard and sending to remote peer
 *   - Receiving clipboard content from remote and writing to local clipboard
 *   - Permission-safe: catches NotAllowedError on clipboard access
 */

import { useCallback, useState } from 'react';
import type { ClipboardSyncEvent } from '../types/events';

// ---------------------------------------------------------------------------
// Hook Options
// ---------------------------------------------------------------------------

export interface UseClipboardOptions {
  /** Called to send a clipboard sync event over the DataChannel */
  onSend: (event: ClipboardSyncEvent) => void;
  /** 'host-to-viewer' or 'viewer-to-host' describes the local role direction */
  localDirection: 'host-to-viewer' | 'viewer-to-host';
}

// ---------------------------------------------------------------------------
// Hook Return Value
// ---------------------------------------------------------------------------

export interface UseClipboardReturn {
  /** Last clipboard text received from the remote peer */
  lastReceivedText: string | null;
  /** Send local clipboard contents to the remote peer */
  syncLocalToRemote: () => Promise<boolean>;
  /** Handle an incoming ClipboardSyncEvent from the remote peer */
  handleIncomingClipboard: (event: ClipboardSyncEvent) => Promise<void>;
}

// ---------------------------------------------------------------------------
// useClipboard Hook
// ---------------------------------------------------------------------------

export function useClipboard(options: UseClipboardOptions): UseClipboardReturn {
  const { onSend, localDirection } = options;

  const [lastReceivedText, setLastReceivedText] = useState<string | null>(null);

  // ---- Sync Local → Remote --------------------------------------------------

  const syncLocalToRemote = useCallback(async (): Promise<boolean> => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return false;

      const event: ClipboardSyncEvent = {
        type: 'clipboard:sync',
        text,
        direction: localDirection,
        timestamp: Date.now(),
      };

      onSend(event);
      return true;
    } catch {
      // NotAllowedError: clipboard read requires user permission / page focus
      return false;
    }
  }, [localDirection, onSend]);

  // ---- Handle Incoming Clipboard (Remote → Local) ---------------------------

  const handleIncomingClipboard = useCallback(
    async (event: ClipboardSyncEvent): Promise<void> => {
      setLastReceivedText(event.text);

      try {
        await navigator.clipboard.writeText(event.text);
      } catch {
        // Clipboard write may fail without focus; we still store the text
      }
    },
    []
  );

  return {
    lastReceivedText,
    syncLocalToRemote,
    handleIncomingClipboard,
  };
}

/**
 * @file AiCommandProtocol.ts
 * @description Protocol utilities for encoding and decoding AI automation
 * commands sent over RTCDataChannel. Provides type-safe dispatch helpers
 * and command ID generation.
 *
 * NOT YET IMPLEMENTED — interfaces prepared per architecture specification.
 * This file will be the entry point for Mimir's AI engine when it begins
 * dispatching commands to remote hosts.
 */

import type { AiRemoteCommand } from '../../types/ai';
import type { RemoteDataEvent } from '../../types/events';

// ---------------------------------------------------------------------------
// Command ID Generation
// ---------------------------------------------------------------------------

/**
 * Generates a unique request ID for AI command correlation and telemetry.
 * Format: `ai-<timestamp>-<random hex>`
 */
export function generateCommandId(): string {
  return `ai-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

/**
 * Determines whether a received DataChannel message is an AI command.
 * Used by the host-side dispatcher to route messages correctly.
 */
export function isAiCommand(event: RemoteDataEvent | AiRemoteCommand): event is AiRemoteCommand {
  return typeof event === 'object' && event !== null && 'type' in event &&
    (event as { type: string }).type.startsWith('ai:');
}

// ---------------------------------------------------------------------------
// Command Builder Helpers (Stubs — not yet active)
// ---------------------------------------------------------------------------

/**
 * Builds a base AI command scaffold with a unique ID and current timestamp.
 * AI command implementations extend this base when constructing commands.
 *
 * @param sessionId - The current peer session ID
 * @param safetyLevel - Human-in-the-loop safety classification
 */
export function buildCommandBase(
  sessionId: string,
  safetyLevel: AiRemoteCommand['safetyLevel'] = 'requires_approval'
) {
  return {
    requestId: generateCommandId(),
    sessionId,
    timestamp: Date.now(),
    safetyLevel,
  };
}

/**
 * Serializes an AI command to a JSON string for DataChannel transmission.
 * The receiving host deserializes and dispatches to the appropriate handler.
 */
export function serializeCommand(command: AiRemoteCommand): string {
  return JSON.stringify(command);
}

/**
 * Deserializes a DataChannel message payload.
 * Returns null if the payload is not a valid AI command.
 */
export function deserializeCommand(raw: string): AiRemoteCommand | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isAiCommand(parsed as RemoteDataEvent | AiRemoteCommand)) {
      return parsed as AiRemoteCommand;
    }
    return null;
  } catch {
    return null;
  }
}

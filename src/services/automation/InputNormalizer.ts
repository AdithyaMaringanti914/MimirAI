/**
 * @file InputNormalizer.ts
 * @description Converts raw browser pixel coordinates into normalized [0.0–1.0]
 * coordinates suitable for transmission over RTCDataChannel.
 *
 * Normalization is essential because:
 *   - The viewer's screen resolution may differ from the host's.
 *   - The video element's rendered size changes with window resizing.
 *   - Normalized coordinates are resolution-independent by design.
 *
 * The host reconstructs absolute screen coordinates by multiplying
 * normalized values by its native display dimensions.
 */

import type { NormalizedPoint } from '../../types/events';

// ---------------------------------------------------------------------------
// InputNormalizer
// ---------------------------------------------------------------------------

export class InputNormalizer {
  /**
   * Normalizes a MouseEvent's clientX/clientY coordinates relative to
   * the bounding rect of the target video element.
   *
   * @param clientX - Raw clientX from the MouseEvent
   * @param clientY - Raw clientY from the MouseEvent
   * @param containerRect - DOMRect of the video container element
   * @returns NormalizedPoint with values clamped to [0.0, 1.0]
   */
  static normalize(
    clientX: number,
    clientY: number,
    containerRect: DOMRect
  ): NormalizedPoint {
    const rawX = clientX - containerRect.left;
    const rawY = clientY - containerRect.top;

    return {
      x: Math.max(0, Math.min(1, rawX / containerRect.width)),
      y: Math.max(0, Math.min(1, rawY / containerRect.height)),
    };
  }

  /**
   * Denormalizes a NormalizedPoint back to pixel coordinates given a
   * target container size. Used by the host to replay cursor position
   * on the actual display.
   *
   * @param point - Normalized coordinates [0.0–1.0]
   * @param containerWidth - Width of the target display in pixels
   * @param containerHeight - Height of the target display in pixels
   * @returns Raw pixel coordinates
   */
  static denormalize(
    point: NormalizedPoint,
    containerWidth: number,
    containerHeight: number
  ): { x: number; y: number } {
    return {
      x: Math.round(point.x * containerWidth),
      y: Math.round(point.y * containerHeight),
    };
  }

  /**
   * Checks if a point is within the valid normalized range.
   * Events outside the video element (e.g. over toolbar) are discarded.
   */
  static isInBounds(point: NormalizedPoint): boolean {
    return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
  }
}

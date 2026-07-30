import { type ObservationResult, Observation } from '../core/types';

export class ConfidenceFusion {
  public static fuse(results: ObservationResult[]): Observation[] {
    // Basic fusion algorithm:
    // 1. Group observations by spatial proximity and label.
    // 2. Providers with higher priority (lower number) win out.
    // 3. For Draft 1.0, we just take all observations and let the highest confidence provider dominate overlapping regions.
    
    let allObs: Observation[] = [];
    for (const result of results) {
      allObs.push(...result.observations);
    }
    
    // Sort by confidence descending
    allObs.sort((a, b) => b.confidence - a.confidence);

    // Filter out duplicates (naive spatial overlap check)
    const fused: Observation[] = [];
    for (const obs of allObs) {
      const isDuplicate = fused.some(f => 
        Math.abs(f.bounds.x - obs.bounds.x) < 10 &&
        Math.abs(f.bounds.y - obs.bounds.y) < 10 &&
        f.type === obs.type
      );
      if (!isDuplicate) {
        fused.push(obs);
      }
    }
    
    return fused;
  }
}

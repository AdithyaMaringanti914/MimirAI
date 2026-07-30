import { SceneGraph } from '../ai/domain/SceneGraph';

export class ScreenChangeDetector {
  public static detectChanges(prev: SceneGraph | null, curr: SceneGraph): string[] {
    if (!prev) return ['Initial observation'];

    const changes: string[] = [];

    if (prev.application !== curr.application) {
      changes.push(`Application focus changed from ${prev.application} to ${curr.application}`);
    }

    if (prev.controls.length !== curr.controls.length) {
      changes.push(`UI Controls count changed: ${prev.controls.length} -> ${curr.controls.length}`);
    }

    if (prev.windows?.length !== curr.windows?.length) {
      changes.push(`Window count changed: ${prev.windows?.length || 0} -> ${curr.windows?.length || 0}`);
    }

    return changes;
  }
}

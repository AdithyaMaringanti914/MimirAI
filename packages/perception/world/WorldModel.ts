import { EventBus } from '../events/EventBus';
import { type Observation, type WindowInfo } from '../core/types';
import { type SceneGraph } from '../../src/ai/domain/SceneGraph';

export class WorldModel {
  private static instance: WorldModel;

  public activeWindows: WindowInfo[] = [];
  public currentSceneGraph: SceneGraph | null = null;
  public previousSceneGraph: SceneGraph | null = null;
  public allObservations: Observation[] = [];
  public lastUpdated: number = 0;

  private constructor() {
    this.subscribeToEvents();
  }

  public static getInstance(): WorldModel {
    if (!WorldModel.instance) {
      WorldModel.instance = new WorldModel();
    }
    return WorldModel.instance;
  }

  private subscribeToEvents() {
    EventBus.subscribe('SceneGraphUpdated', (payload: { current: SceneGraph, previous: SceneGraph | null, observations: Observation[] }) => {
      this.currentSceneGraph = payload.current;
      this.previousSceneGraph = payload.previous;
      this.allObservations = payload.observations;
      this.lastUpdated = Date.now();
      
      if (payload.current.windows) {
        this.activeWindows = payload.current.windows;
      }
      
      console.log(`[WorldModel] Synchronized state at ${this.lastUpdated}.`);
    });
  }

  public getTargetControl(label: string): Observation | null {
    if (!this.allObservations) return null;
    return this.allObservations.find(obs => 
      obs.type === 'Control' && 
      obs.label.toLowerCase().includes(label.toLowerCase())
    ) || null;
  }
}

import { SafetyEngine } from './SafetyEngine';
import { executionBus } from '../bus/ExecutionBus';
import { Goal } from '../domain/Intent';
import { SceneGraph } from '../domain/SceneGraph';
import { Action } from '../domain/Action';
import { HybridDecisionEngine } from '../../perception/HybridDecisionEngine';
import { ScreenChangeDetector } from '../../perception/ScreenChangeDetector';
import { PerceptionManager, WorldModel, ProviderRegistry, WindowsUIAProvider, BrowserCDPProvider, Win32WindowProvider, OCRProvider, GeminiVisionProvider } from '../../../packages/perception';

// Bootstrap Perception OS Providers (In production, this would be centrally initialized)
ProviderRegistry.register(new WindowsUIAProvider());
ProviderRegistry.register(new BrowserCDPProvider());
ProviderRegistry.register(new Win32WindowProvider());
ProviderRegistry.register(new OCRProvider());
ProviderRegistry.register(new GeminiVisionProvider());

export class ExecutionCoordinator {
  private perceptionManager = new PerceptionManager();
  private decisionEngine = new HybridDecisionEngine();
  private safetyEngine = new SafetyEngine();
  private prevScene: SceneGraph | null = null;

  public async executeGoal(
    goal: Goal, 
    onLog: (msg: string) => void, 
    onScene: (scene: SceneGraph) => void
  ): Promise<boolean> {
    
    onLog(`Starting execution for goal: ${goal.description}`);
    const history: string[] = [];

    // Max 10 steps to prevent infinite loops
    for (let step = 1; step <= 10; step++) {
      onLog(`--- Step ${step} ---`);
      
      // 1. Observe (Perception OS handles caching, UIA, OCR, Gemini internally)
      onLog('Requesting Perception OS Observation Cycle...');
      try {
        await this.perceptionManager.runObservationCycle({
          monitor: 0,
          goal: goal.description,
          workflowId: 'default'
        });
        
        const world = WorldModel.getInstance();
        if (world.currentSceneGraph) {
          onScene(world.currentSceneGraph);
          onLog(`Perception complete. Found ${world.currentSceneGraph.controls.length} controls and ${world.activeWindows.length} windows.`);
          
          if (this.prevScene) {
            const changes = ScreenChangeDetector.detectChanges(this.prevScene, world.currentSceneGraph);
            changes.forEach(c => onLog(`[Change] ${c}`));
          }
          this.prevScene = world.currentSceneGraph;
        } else {
           throw new Error("World Model returned empty scene graph.");
        }
      } catch (err: any) {
        onLog(`Perception Error: ${err.message}`);
        return false;
      }

      const world = WorldModel.getInstance();
      
      // 2. Decide (Hybrid Engine decides locally or falls back to Gemini)
      onLog('Planning next action...');
      let nextAction: Action | null;
      try {
        nextAction = await this.decisionEngine.decide(goal, world.currentSceneGraph!, history);
      } catch (err: any) {
        onLog(`Decision Error: ${err.message}`);
        return false;
      }

      // If planner returns null or wait 0, it means goal achieved
      if (!nextAction) {
        onLog('AI determined the goal has been successfully completed!');
        return true;
      }

      onLog(`Planned Action: ${nextAction.type}`);

      // 3. Safety Check
      const safetyStatus = this.safetyEngine.validateAction(nextAction);
      if (safetyStatus === 'Blocked') {
        onLog('Safety Engine BLOCKED this action.');
        return false;
      } else if (safetyStatus === 'ConfirmationRequired') {
        onLog('Safety Engine requires confirmation. Auto-approving for this demo phase...');
      }

      // 4. Act
      onLog('Dispatching action to Execution Bus...');
      try {
        await executionBus.dispatch(nextAction);
        history.push(`Successfully executed ${nextAction.type}`);
        onLog('Action dispatched successfully.');
      } catch (err: any) {
        onLog(`Execution Error: ${err.message}`);
        history.push(`Failed to execute ${nextAction.type}: ${err.message}`);
      }

      // Brief wait before next loop for UI to settle
      await new Promise(r => setTimeout(r, 2000));
    }

    onLog('Execution loop terminated: Max steps reached without completion.');
    return false;
  }
}

import { Action } from '../domain/Action';

export class SafetyEngine {
  public validateAction(action: Action): 'Safe' | 'ConfirmationRequired' | 'Blocked' {
    const dangerousCommands = ['rm -rf', 'del', 'format', 'system32', 'regedit'];
    
    if (action.type === 'ExecuteShell') {
      const payload = action.payload as any;
      const cmdStr = (payload.command + ' ' + (payload.args?.join(' ') || '')).toLowerCase();
      
      for (const dangerous of dangerousCommands) {
        if (cmdStr.includes(dangerous)) {
          return 'Blocked';
        }
      }
      
      if (cmdStr.includes('install') || cmdStr.includes('curl') || cmdStr.includes('wget')) {
        return 'ConfirmationRequired';
      }
    }
    
    return 'Safe';
  }
}

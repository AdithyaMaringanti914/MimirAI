import { type Action, type ExecuteShellPayload, type ClickCoordinatesPayload } from '../domain/Action';
import { connectionManager } from '../../services/connection/ConnectionManager';
import { PacketSerializer } from '../../protocol/PacketSerializer';

export class ExecutionBus {
  private static instance: ExecutionBus;

  private constructor() {}

  public static getInstance(): ExecutionBus {
    if (!ExecutionBus.instance) {
      ExecutionBus.instance = new ExecutionBus();
    }
    return ExecutionBus.instance;
  }

  /**
   * Dispatches an abstract AI Action to the correct transport layer
   */
  public async dispatch(action: Action): Promise<any> {
    const transport = connectionManager.agentTransport;
    const session = connectionManager.session.session;

    if (!session || !transport) {
      throw new Error('No active connection available for execution');
    }

    return new Promise((resolve, reject) => {
      // In a real robust system, we would map command IDs and wait for specific callbacks.
      // For this implementation, we will send the packet and resolve after a slight delay
      // or set up a one-time listener.
      
      try {
        switch (action.type) {
          case 'LaunchApplication':
          case 'ExecuteShell': {
            const payload = action.payload as ExecuteShellPayload;
            
            // Format for Native Agent
            const packet = {
              version: '1.0',
              messageId: crypto.randomUUID(),
              timestamp: Date.now(),
              sessionId: session.sessionId,
              deviceId: session.clientDeviceId, // We are sending from client
              type: 'execute',
              payload: {
                command: payload.command,
                args: payload.args || [],
                timeout: 5000
              }
            };
            
            // Send via agent transport manually (since it expects RemoteInput normally)
            // We need a raw send method on the transport, or we use the underlying signaling.
            connectionManager.signaling.sendAgentCommand({
              targetId: session.hostDeviceId,
              packet: JSON.stringify(packet)
            });
            break;
          }
          
          case 'CaptureScreenshot': {
            const packet = {
              version: '1.0',
              messageId: crypto.randomUUID(),
              timestamp: Date.now(),
              sessionId: session.sessionId,
              deviceId: session.clientDeviceId,
              type: 'capture',
              payload: {}
            };
            
            // Set up a one-time listener for the response
            const listenerId = packet.messageId;
            const handleResponse = (msg: any) => {
              const resp = typeof msg === 'string' ? JSON.parse(msg) : msg;
              // We need to parse the [ "agent:response", { ... } ] socket.io wrapper if it leaks, 
              // but signaling manager unwraps it usually.
              if (resp.CommandID === listenerId && resp.Success) {
                connectionManager.signaling.offAgentResponse(handleResponse);
                
                // Parse the Data field from Go Agent which is a JSON string
                try {
                  const dataObj = JSON.parse(resp.Data);
                  resolve({ 
                    success: true, 
                    base64Image: dataObj.image,
                    windows: dataObj.windows,
                    uiaRaw: dataObj.uiaRaw
                  });
                } catch(e) {
                  resolve({ success: false, error: 'Failed to parse image data' });
                }
              }
            };
            
            connectionManager.signaling.onAgentResponse(handleResponse);
            
            connectionManager.signaling.sendAgentCommand({
              targetId: session.hostDeviceId,
              packet: JSON.stringify(packet)
            });
            
            // Timeout after 10s
            setTimeout(() => {
              connectionManager.signaling.offAgentResponse(handleResponse);
              reject(new Error('Capture screenshot timed out'));
            }, 10000);
            
            return;
          }

          case 'ClickCoordinates': {
            const payload = action.payload as ClickCoordinatesPayload;
            const movePacket = {
              version: '1.0',
              messageId: crypto.randomUUID(),
              timestamp: Date.now(),
              sessionId: session.sessionId,
              deviceId: session.clientDeviceId,
              type: 'mouse.move',
              payload: { x: payload.x, y: payload.y }
            };
            connectionManager.signaling.sendAgentCommand({
              targetId: session.hostDeviceId,
              packet: JSON.stringify(movePacket)
            });

            setTimeout(() => {
              const clickPacket = {
                version: '1.0',
                messageId: crypto.randomUUID(),
                timestamp: Date.now(),
                sessionId: session.sessionId,
                deviceId: session.clientDeviceId,
                type: 'mouse.down',
                payload: { button: payload.button || 'left' }
              };
              connectionManager.signaling.sendAgentCommand({
                targetId: session.hostDeviceId,
                packet: JSON.stringify(clickPacket)
              });
              
              setTimeout(() => {
                const upPacket = {
                  ...clickPacket,
                  messageId: crypto.randomUUID(),
                  timestamp: Date.now(),
                  type: 'mouse.up'
                };
                connectionManager.signaling.sendAgentCommand({
                  targetId: session.hostDeviceId,
                  packet: JSON.stringify(upPacket)
                });
                resolve({ success: true });
              }, 50);
            }, 50);
            return; // Wait for inner resolves
          }

          case 'Wait': {
            const ms = action.payload.ms || 1000;
            setTimeout(() => resolve({ success: true }), ms);
            return;
          }

          default:
            console.warn(`ExecutionBus: Action ${action.type} not fully mapped yet.`);
            resolve({ success: true, warning: 'Unmapped action' });
            return;
        }

        // For non-async actions that didn't return early
        setTimeout(() => resolve({ success: true }), 200);

      } catch (err) {
        reject(err);
      }
    });
  }
}

export const executionBus = ExecutionBus.getInstance();

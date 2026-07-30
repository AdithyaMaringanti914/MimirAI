/**
 * @file ai.ts
 * @description Future AI automation command interfaces for the Mimir remote
 * desktop module. These interfaces define the extensible protocol for AI-driven
 * remote execution commands that will be sent over RTCDataChannel.
 *
 * IMPORTANT: These interfaces are PREPARED only — not yet implemented.
 * When Mimir's AI engine is ready to dispatch remote commands, these types
 * provide the protocol contract. They extend the RemoteDataEvent union in
 * events.ts without breaking existing consumers.
 *
 * Design: Each command carries a `requestId` for correlation with AI agent
 * telemetry and a `sessionId` scoped to the current peer session.
 */

// ---------------------------------------------------------------------------
// Common AI Command Base
// ---------------------------------------------------------------------------

interface AiCommandBase {
  /** Unique ID for tracking this command in AI telemetry */
  requestId: string;
  /** The peer session this command belongs to */
  sessionId: string;
  /** UTC timestamp when the AI agent dispatched this command */
  timestamp: number;
  /**
   * Safety classification: 'safe' | 'requires_approval' | 'destructive'
   * Used by the human-in-the-loop guardrail system.
   */
  safetyLevel: 'safe' | 'requires_approval' | 'destructive';
}

// ---------------------------------------------------------------------------
// UI Interaction Commands
// ---------------------------------------------------------------------------

/**
 * Instructs the remote host to locate and click a UI element by
 * its accessible label, role, or visual text.
 */
export interface AiClickButtonCommand extends AiCommandBase {
  type: 'ai:click_button';
  /** Human-readable label of the button to click */
  label: string;
  /** Optional ARIA role to narrow the search */
  ariaRole?: string;
}

/**
 * Types a sequence of characters into the currently focused input field
 * or at a specified target element.
 */
export interface AiTypeTextCommand extends AiCommandBase {
  type: 'ai:type_text';
  text: string;
  /** If true, sends Enter key after typing */
  submit?: boolean;
}

// ---------------------------------------------------------------------------
// Application & OS Commands
// ---------------------------------------------------------------------------

/** Opens an application by name or executable path */
export interface AiOpenAppCommand extends AiCommandBase {
  type: 'ai:open_app';
  appName: string;
  /** Optional full path override (e.g. "C:\\Program Files\\...\\app.exe") */
  executablePath?: string;
  args?: string[];
}

/**
 * Executes a shell command on the remote host.
 * Requires `safetyLevel: 'requires_approval'` or higher.
 */
export interface AiRunCommand extends AiCommandBase {
  type: 'ai:run_command';
  /** Shell command string */
  command: string;
  /** Working directory for the command */
  workingDirectory?: string;
  /** Shell: 'powershell' | 'cmd' | 'bash' | 'sh' */
  shell: 'powershell' | 'cmd' | 'bash' | 'sh';
  /** Timeout in seconds before the command is forcefully killed */
  timeoutSeconds?: number;
}

/** Installs a software package using a package manager */
export interface AiInstallSoftwareCommand extends AiCommandBase {
  type: 'ai:install_software';
  packageName: string;
  /** Package manager: 'winget' | 'chocolatey' | 'apt' | 'brew' */
  packageManager: 'winget' | 'chocolatey' | 'apt' | 'brew';
  version?: string;
}

/** Restarts a named system service on the remote host */
export interface AiRestartServiceCommand extends AiCommandBase {
  type: 'ai:restart_service';
  serviceName: string;
  /** 'restart' stops then starts; 'stop' or 'start' are single operations */
  action: 'restart' | 'start' | 'stop';
}

// ---------------------------------------------------------------------------
// File Operations
// ---------------------------------------------------------------------------

/** Uploads a file from the local viewer to the remote host */
export interface AiUploadFileCommand extends AiCommandBase {
  type: 'ai:upload_file';
  /** Remote destination path */
  destinationPath: string;
  /** File MIME type */
  mimeType: string;
  /** Base64-encoded file content for small files; chunk transfer for large */
  contentBase64?: string;
  /** Total file size in bytes */
  sizeBytes: number;
}

/** Downloads a file from the remote host to the viewer */
export interface AiDownloadFileCommand extends AiCommandBase {
  type: 'ai:download_file';
  /** Remote file path to retrieve */
  remotePath: string;
}

// ---------------------------------------------------------------------------
// Workflow Execution
// ---------------------------------------------------------------------------

/**
 * Dispatches a named Mimir workflow to the remote host's daemon.
 * The daemon resolves the workflow by ID and executes its steps.
 */
export interface AiExecuteWorkflowCommand extends AiCommandBase {
  type: 'ai:execute_workflow';
  workflowId: string;
  /** Dynamic parameter overrides for this execution */
  parameters?: Record<string, string | number | boolean>;
}

// ---------------------------------------------------------------------------
// AI Command Union
// ---------------------------------------------------------------------------

/**
 * Union of all AI automation command types.
 * To add a new command:
 *   1. Define a new interface extending AiCommandBase above.
 *   2. Add it to this union.
 *   3. Add its type to the RemoteDataEvent union in events.ts.
 *   4. Handle it in the host-side command dispatcher.
 */
export type AiRemoteCommand =
  | AiClickButtonCommand
  | AiTypeTextCommand
  | AiOpenAppCommand
  | AiRunCommand
  | AiInstallSoftwareCommand
  | AiRestartServiceCommand
  | AiUploadFileCommand
  | AiDownloadFileCommand
  | AiExecuteWorkflowCommand;

// ---------------------------------------------------------------------------
// AI Command Result
// ---------------------------------------------------------------------------

/** Result sent back from the remote host after executing an AI command */
export interface AiCommandResult {
  type: 'ai:result';
  requestId: string;
  success: boolean;
  output?: string;
  errorMessage?: string;
  durationMs: number;
  timestamp: number;
}

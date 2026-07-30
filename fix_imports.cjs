const fs = require('fs');
const path = require('path');

const types = [
  'RemoteInput', 'ClipboardEvent', 'Resolution', 'CursorState', 'MonitorInfo', 
  'MouseEventBase', 'MouseScrollEvent', 'SessionPermissions', 'SceneGraph', 
  'Action', 'Goal', 'UIElement', 'DataMessage', 'MouseButtonEvent', 
  'MouseMoveEvent', 'KeyboardEvent', 'ObservationResult', 'Observation',
  'ProviderContext', 'WindowInfo', 'ExecuteShellPayload', 'LaunchApplicationPayload',
  'ClickCoordinatesPayload', 'TypeStringPayload', 'Intent', 'Plan', 'WorkflowNode',
  'RequestPayload', 'PerceptionProvider', 'ObservationContext', 'ProviderConfig'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.trim().startsWith('import ') && !line.trim().startsWith('import type')) {
      types.forEach(t => {
        const regex = new RegExp(`\\b${t}\\b`);
        if (regex.test(line) && !line.includes(`type ${t}`)) {
          line = line.replace(regex, `type ${t}`);
          changed = true;
        }
      });
      lines[i] = line;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Fixed', filePath);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  });
}

walkDir(path.join(__dirname, 'src'));
walkDir(path.join(__dirname, 'packages'));

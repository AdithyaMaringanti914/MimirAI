export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UIElement {
  id: string;
  type: 'button' | 'checkbox' | 'radio' | 'dropdown' | 'textbox' | 'icon' | 'window_title' | 'menu_item' | 'text';
  label: string;
  bounds: BoundingBox;
  confidence: number;
  enabled?: boolean;
  checked?: boolean;
}

export interface SceneGraph {
  timestamp: number;
  frameId: string;
  hash: string;
  application: string;
  controls: UIElement[];
  textBlocks: { text: string; bounds: BoundingBox; confidence?: number }[];
  windows?: any[];
}

export interface Observation {
  timestamp: number;
  type: 'Navigation' | 'UIChange' | 'Dialog' | 'Process' | 'Error';
  description: string;
  metadata?: any;
}

export interface StateDiff {
  addedControls: UIElement[];
  removedControls: UIElement[];
  newText: string[];
}

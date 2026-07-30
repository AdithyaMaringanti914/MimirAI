import { type SceneGraph, type UIElement } from '../ai/domain/SceneGraph';

export class SceneGraphBuilder {
  public static build(
    timestamp: number,
    frameId: string,
    hash: string,
    windows: any[],
    uiaTree: any,
    ocrData: any
  ): SceneGraph {
    
    const controls: UIElement[] = [];
    const textBlocks: { text: string; bounds: any, confidence: number }[] = [];

    // Parse UIA Tree
    const traverseUia = (node: any) => {
      if (!node) return;
      if (node.bounds && node.bounds.width > 0 && node.bounds.height > 0) {
        controls.push({
          id: node.id || crypto.randomUUID(),
          type: this.mapControlType(node.type),
          label: node.name || '',
          bounds: node.bounds,
          confidence: 1.0, // UIA is 100% accurate
        });
      }
      if (node.children) {
        node.children.forEach(traverseUia);
      }
    };

    if (uiaTree) {
      try {
        const uiaJson = typeof uiaTree === 'string' ? JSON.parse(uiaTree) : uiaTree;
        traverseUia(uiaJson);
      } catch (e) {
        console.error('Failed to parse UIA Tree', e);
      }
    }

    // Parse OCR
    if (ocrData && ocrData.textBlocks) {
      ocrData.textBlocks.forEach((block: any) => {
        textBlocks.push({
          text: block.text,
          bounds: block.bounds,
          confidence: block.confidence
        });
      });
    }

    // Determine foreground app
    let application = 'Desktop';
    if (windows && windows.length > 0) {
      // Assuming zOrder 0 is foreground (top)
      const topWin = windows.find((w: any) => w.zOrder === 0 && w.title);
      if (topWin) {
        application = topWin.title;
      }
    }

    return {
      timestamp,
      frameId,
      hash,
      application,
      controls,
      textBlocks,
      windows: windows || []
    };
  }

  private static mapControlType(uiaType: string): any {
    const typeMap: Record<string, string> = {
      'button': 'button',
      'check box': 'checkbox',
      'edit': 'textbox',
      'menu item': 'menu_item',
      'document': 'text',
      'list item': 'radio',
      'combo box': 'dropdown'
    };
    const key = (uiaType || '').toLowerCase();
    return typeMap[key] || 'text';
  }
}

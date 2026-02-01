/**
 * MailCanvas Editor Store
 * Phase 9: Infinite Workspace with History
 * 
 * Zustand store with zundo temporal middleware for undo/redo
 */

import { create } from 'zustand';
import { temporal } from 'zundo';
import { 
  EditorBlock, 
  BlockType, 
  BlockLayout,
  DEFAULT_BLOCK_CONTENT, 
  DEFAULT_BLOCK_STYLES,
  DEFAULT_BLOCK_NAMES,
  DEFAULT_BLOCK_LAYOUT,
  DEFAULT_SOCIAL_DATA,
  DEFAULT_TABLE_DATA,
  DEFAULT_LIST_DATA,
} from '@/types/editor';

/**
 * Viewport Interface for Pan & Zoom
 */
interface Viewport {
  zoom: number;   // Scale factor (0.1 to 5)
  x: number;      // Pan X offset
  y: number;      // Pan Y offset
}

/**
 * Canvas Settings Interface
 */
interface CanvasSettings {
  width: number;
  backgroundColor: string;
  showRulers: boolean;
  showGrid: boolean;
  mode: 'desktop' | 'mobile';
}

/**
 * Design Token Interface (Phase 18: Variable Engine)
 */
export interface DesignToken {
  id: string;
  name: string;       // e.g., "Brand Primary"
  value: string;      // e.g., "#0d9488"
  type: 'color' | 'font';
}

/**
 * Default Design Tokens
 */
const DEFAULT_DESIGN_TOKENS: DesignToken[] = [
  { id: 'var-primary', name: 'Primary', value: '#0d9488', type: 'color' },
  { id: 'var-secondary', name: 'Secondary', value: '#6366f1', type: 'color' },
  { id: 'var-text', name: 'Text', value: '#1e293b', type: 'color' },
  { id: 'var-background', name: 'Background', value: '#ffffff', type: 'color' },
  { id: 'var-accent', name: 'Accent', value: '#f59e0b', type: 'color' },
  { id: 'var-muted', name: 'Muted', value: '#94a3b8', type: 'color' },
];

/**
 * Interaction Mode for State Machine (Phase 20: Deep Core Stability)
 */
export type InteractionMode = 'idle' | 'selecting' | 'dragging' | 'resizing' | 'editing';

/**
 * Editor Store State Interface
 */
interface EditorState {
  /** Array of blocks in the editor */
  blocks: EditorBlock[];
  
  /** Currently selected block IDs (for multi-select) */
  selectedBlockIds: string[];
  
  /** Clipboard for copy/paste */
  clipboard: EditorBlock[];
  
  /** Counter for generating unique layer names */
  blockCounters: Record<BlockType, number>;
  
  /** Canvas settings */
  canvasSettings: CanvasSettings;
  
  /** Viewport for pan and zoom */
  viewport: Viewport;
  
  /** Expanded group IDs for layers panel tree view (Phase 16) */
  expandedGroupIds: string[];
  
  /** Interaction mode state machine (Phase 20) */
  interactionMode: InteractionMode;
  
  /** Currently editing block ID (Phase 20) */
  editingBlockId: string | null;
  
  /** Saved component assets for reuse (Phase 17) */
  assets: EditorBlock[];
  
  /** Design tokens / variables for global styling (Phase 18) */
  variables: DesignToken[];
}

/**
 * Editor Store Actions Interface
 */
interface EditorActions {
  /** Add a new block of the specified type */
  addBlock: (type: BlockType) => void;
  
  /** Add a shape block with specific shape type */
  addShape: (shapeType: 'rectangle' | 'circle' | 'line') => void;
  
  /** Remove a block by ID */
  removeBlock: (id: string) => void;
  
  /** Update a block's properties */
  updateBlock: (id: string, updates: Partial<EditorBlock>) => void;
  
  /** Update block styles specifically */
  updateBlockStyles: (id: string, styles: Record<string, string>) => void;
  
  /** Reorder blocks (for drag-and-drop) */
  reorderBlocks: (activeId: string, overId: string) => void;
  
  /** Select a block for editing (with optional shift for multi-select) */
  selectBlock: (id: string | null, shiftKey?: boolean) => void;
  
  /** Select multiple blocks at once */
  selectBlocks: (ids: string[]) => void;
  
  /** Clear all blocks */
  clearBlocks: () => void;
  
  /** Duplicate a block */
  duplicateBlock: (id: string) => void;
  
  /** Toggle block lock state */
  toggleBlockLock: (id: string) => void;
  
  /** Toggle block visibility */
  toggleBlockVisibility: (id: string) => void;
  
  /** Rename a block */
  renameBlock: (id: string, name: string) => void;
  
  /** Update canvas settings */
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  
  /** Delete selected blocks */
  deleteSelectedBlocks: () => void;
  
  /** Update block layout (position and size) */
  updateBlockLayout: (id: string, layout: Partial<BlockLayout>) => void;
  
  /** Bring block to front */
  bringToFront: (id?: string) => void;
  
  /** Send block to back */
  sendToBack: (id?: string) => void;
  
  /** Bring block forward one step */
  bringForward: (id?: string) => void;
  
  /** Send block backward one step */
  sendBackward: (id?: string) => void;
  
  // === ALIGNMENT ACTIONS ===
  /** Align selected blocks to the left edge */
  alignLeft: () => void;
  
  /** Align selected blocks to horizontal center */
  alignCenter: () => void;
  
  /** Align selected blocks to the right edge */
  alignRight: () => void;
  
  /** Align selected blocks to the top edge */
  alignTop: () => void;
  
  /** Align selected blocks to vertical middle */
  alignMiddle: () => void;
  
  /** Align selected blocks to the bottom edge */
  alignBottom: () => void;
  
  /** Distribute selected blocks horizontally with even spacing */
  distributeHorizontal: () => void;
  
  /** Distribute selected blocks vertically with even spacing */
  distributeVertical: () => void;
  
  // === CLIPBOARD ACTIONS ===
  /** Copy selected blocks to clipboard */
  copySelectedBlocks: () => void;
  
  /** Paste blocks from clipboard */
  pasteBlocks: () => void;
  
  /** Duplicate selected blocks (copy + paste in one action) */
  duplicateSelectedBlocks: () => void;
  
  /** Nudge selected blocks by offset */
  nudgeSelectedBlocks: (dx: number, dy: number) => void;
  
  // === VIEWPORT ACTIONS ===
  /** Update viewport (pan and zoom) */
  setViewport: (updates: Partial<Viewport>) => void;
  
  /** Zoom in by step */
  zoomIn: () => void;
  
  /** Zoom out by step */
  zoomOut: () => void;
  
  /** Reset zoom to 100% */
  resetZoom: () => void;
  
  /** Fit canvas to screen */
  fitToScreen: () => void;
  
  /** Set canvas mode (desktop/mobile) - Phase 13 */
  setCanvasMode: (mode: 'desktop' | 'mobile') => void;
  
  /** Resize canvas width and apply Figma-style constraints to all blocks - Phase 14 */
  resizeCanvasWithConstraints: (newWidth: number) => void;
  
  /** Group selected blocks into a single group - Phase 15 */
  groupSelectedBlocks: () => void;
  
  /** Ungroup selected group, restoring children to canvas - Phase 15 */
  ungroupSelectedBlock: () => void;
  
  /** Toggle group expansion in layers panel - Phase 16 */
  toggleGroupExpansion: (id: string) => void;
  
  /** Create a reusable component from selected blocks - Phase 17 */
  createComponent: () => void;
  
  /** Add an asset to the canvas at viewport center - Phase 17 */
  addAssetToCanvas: (assetId: string) => void;
  
  /** Remove an asset from the library - Phase 17 */
  removeAsset: (assetId: string) => void;
  
  /** Add a new design token / variable - Phase 18 */
  addVariable: (variable: Omit<DesignToken, 'id'>) => void;
  
  /** Update an existing design token - Phase 18 */
  updateVariable: (id: string, updates: Partial<Omit<DesignToken, 'id'>>) => void;
  
  /** Delete a design token - Phase 18 */
  deleteVariable: (id: string) => void;
  
  /** Set interaction mode - Phase 20 */
  setInteractionMode: (mode: InteractionMode) => void;
  
  /** Set editing block - Phase 20 (sets mode to 'editing' and tracks the ID) */
  setEditingBlock: (id: string | null) => void;
  
  /** Reset interaction - Phase 20 (sets mode to 'idle' and clears editing ID) */
  resetInteraction: () => void;
}

/**
 * Combined Store Type
 */
type EditorStore = EditorState & EditorActions;

/**
 * Generate a unique block ID
 */
const generateBlockId = (): string => {
  // Use crypto.randomUUID if available, fallback to Math.random
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Initial block counters
 */
const initialBlockCounters: Record<BlockType, number> = {
  text: 0,
  image: 0,
  button: 0,
  spacer: 0,
  divider: 0,
  social: 0,
  shape: 0,
  group: 0,
  table: 0,
  list: 0,
};

/**
 * Zustand Editor Store with Temporal (Undo/Redo) middleware
 */
export const useEditorStore = create<EditorStore>()(
  temporal(
    (set, get) => ({
      // Initial State
      blocks: [],
      selectedBlockIds: [],
      clipboard: [],
      blockCounters: { ...initialBlockCounters },
      canvasSettings: {
        width: 600,
        backgroundColor: '#ffffff',
        showRulers: true,
        showGrid: true,
        mode: 'desktop',
      },
      viewport: {
        zoom: 1,
        x: 0,
        y: 0,
      },
      expandedGroupIds: [], // Phase 16: Track expanded groups in layers panel
      assets: [], // Phase 17: Saved component assets for reuse
      variables: [...DEFAULT_DESIGN_TOKENS], // Phase 18: Design tokens / variables
      interactionMode: 'idle', // Phase 20: Interaction state machine
      editingBlockId: null, // Phase 20: Currently editing block

      // Actions
      addBlock: (type: BlockType) => {
        const { blockCounters, blocks, canvasSettings } = get();
    const newCounter = blockCounters[type] + 1;
    const defaultLayout = DEFAULT_BLOCK_LAYOUT[type];
    
    // Calculate center position with slight offset for each new block
    const offset = (blocks.length % 10) * 20;
    const centerX = (canvasSettings.width - defaultLayout.width) / 2 + offset;
    const centerY = 100 + offset;
    
    // Get max zIndex for layering
    const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.layout?.zIndex || 0), 0);
    
    const newBlock: EditorBlock = {
      id: generateBlockId(),
      type,
      content: DEFAULT_BLOCK_CONTENT[type],
      styles: { ...DEFAULT_BLOCK_STYLES[type] },
      layout: {
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        width: defaultLayout.width,
        height: defaultLayout.height,
        zIndex: maxZIndex + 1,
      },
      name: `${DEFAULT_BLOCK_NAMES[type]} ${newCounter}`,
      isLocked: false,
      isVisible: true,
      parentId: null,
      // Default constraints: stick to top-left
      constraints: {
        horizontal: 'left',
        vertical: 'top',
      },
      // Initialize socialData for social blocks
      ...(type === 'social' && { socialData: JSON.parse(JSON.stringify(DEFAULT_SOCIAL_DATA)) }),
      // Initialize tableData for table blocks
      ...(type === 'table' && { tableData: JSON.parse(JSON.stringify(DEFAULT_TABLE_DATA)) }),
      // Initialize listData for list blocks
      ...(type === 'list' && { listData: JSON.parse(JSON.stringify(DEFAULT_LIST_DATA)) }),
    };
    set((state) => ({
      blocks: [...state.blocks, newBlock],
      selectedBlockIds: [newBlock.id],
      blockCounters: { ...state.blockCounters, [type]: newCounter },
    }));
  },

  addShape: (shapeType: 'rectangle' | 'circle' | 'line') => {
    const { blockCounters, blocks, canvasSettings } = get();
    const type: BlockType = 'shape';
    const newCounter = blockCounters[type] + 1;
    const defaultLayout = DEFAULT_BLOCK_LAYOUT[type];
    
    // Calculate center position with slight offset
    const offset = (blocks.length % 10) * 20;
    const centerX = (canvasSettings.width - defaultLayout.width) / 2 + offset;
    const centerY = 100 + offset;
    
    // Get max zIndex for layering
    const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.layout?.zIndex || 0), 0);
    
    // Determine shape-specific styles
    const shapeStyles = { ...DEFAULT_BLOCK_STYLES[type] };
    if (shapeType === 'circle') {
      shapeStyles.borderRadius = '50%';
    } else if (shapeType === 'line') {
      shapeStyles.strokeWidth = '4';
    }
    
    // Determine layout based on shape type
    const shapeLayout = { ...defaultLayout };
    if (shapeType === 'line') {
      shapeLayout.height = 4;
      shapeLayout.width = 200;
    }
    
    const shapeName = shapeType.charAt(0).toUpperCase() + shapeType.slice(1);
    
    const newBlock: EditorBlock = {
      id: generateBlockId(),
      type,
      content: shapeType,
      styles: shapeStyles,
      layout: {
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        width: shapeLayout.width,
        height: shapeLayout.height,
        zIndex: maxZIndex + 1,
      },
      name: `${shapeName} ${newCounter}`,
      isLocked: false,
      isVisible: true,
      parentId: null,
      // Default constraints: stick to top-left
      constraints: {
        horizontal: 'left',
        vertical: 'top',
      },
    };
    set((state) => ({
      blocks: [...state.blocks, newBlock],
      selectedBlockIds: [newBlock.id],
      blockCounters: { ...state.blockCounters, [type]: newCounter },
    }));
  },
  removeBlock: (id: string) => {
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      // Clear selection if removed block was selected
      selectedBlockIds: state.selectedBlockIds.filter((sid) => sid !== id),
    }));
  },

  updateBlock: (id: string, updates: Partial<EditorBlock>) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? {
              ...block,
              ...updates,
              // Merge styles if provided
              styles: updates.styles
                ? { ...block.styles, ...updates.styles }
                : block.styles,
            }
          : block
      ),
    }));
  },

  updateBlockStyles: (id: string, styles: Record<string, string>) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? { ...block, styles: { ...block.styles, ...styles } }
          : block
      ),
    }));
  },

  reorderBlocks: (activeId: string, overId: string) => {
    set((state) => {
      const blocks = [...state.blocks];
      const activeIndex = blocks.findIndex((b) => b.id === activeId);
      const overIndex = blocks.findIndex((b) => b.id === overId);

      if (activeIndex === -1 || overIndex === -1) {
        return state; // Invalid indices, no change
      }

      // Remove the active block and insert it at the new position
      const [movedBlock] = blocks.splice(activeIndex, 1);
      blocks.splice(overIndex, 0, movedBlock);

      return { blocks };
    });
  },

  selectBlock: (id: string | null, shiftKey?: boolean) => {
    if (id === null) {
      set({ selectedBlockIds: [] });
      return;
    }
    
    set((state) => {
      if (shiftKey) {
        // Multi-select: toggle the ID in the array
        const isSelected = state.selectedBlockIds.includes(id);
        if (isSelected) {
          return { selectedBlockIds: state.selectedBlockIds.filter((sid) => sid !== id) };
        } else {
          return { selectedBlockIds: [...state.selectedBlockIds, id] };
        }
      } else {
        // Single select: replace with just this ID
        return { selectedBlockIds: [id] };
      }
    });
  },

  selectBlocks: (ids: string[]) => {
    set({ selectedBlockIds: ids });
  },

  clearBlocks: () => {
    set({ blocks: [], selectedBlockIds: [] });
  },

  duplicateBlock: (id: string) => {
    const { blocks, blockCounters } = get();
    const blockToDuplicate = blocks.find((b) => b.id === id);
    
    if (!blockToDuplicate) return;

    const newCounter = blockCounters[blockToDuplicate.type] + 1;
    const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.layout?.zIndex || 0), 0);
    
    const duplicatedBlock: EditorBlock = {
      ...blockToDuplicate,
      id: generateBlockId(),
      name: `${DEFAULT_BLOCK_NAMES[blockToDuplicate.type]} ${newCounter}`,
      content: blockToDuplicate.content,
      styles: { ...blockToDuplicate.styles },
      layout: {
        ...blockToDuplicate.layout,
        x: blockToDuplicate.layout.x + 20,
        y: blockToDuplicate.layout.y + 20,
        zIndex: maxZIndex + 1,
      },
      isLocked: false,
    };

    const blockIndex = blocks.findIndex((b) => b.id === id);
    
    set((state) => {
      const newBlocks = [...state.blocks];
      newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
      return {
        blocks: newBlocks,
        selectedBlockIds: [duplicatedBlock.id],
        blockCounters: { ...state.blockCounters, [blockToDuplicate.type]: newCounter },
      };
    });
  },

  toggleBlockLock: (id: string) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, isLocked: !block.isLocked } : block
      ),
    }));
  },

  toggleBlockVisibility: (id: string) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, isVisible: !block.isVisible } : block
      ),
    }));
  },

  renameBlock: (id: string, name: string) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, name } : block
      ),
    }));
  },

  updateCanvasSettings: (settings: Partial<CanvasSettings>) => {
    set((state) => ({
      canvasSettings: { ...state.canvasSettings, ...settings },
    }));
  },

  /**
   * Set Canvas Mode (Desktop/Mobile) - Phase 13: Responsive Engine
   * When switching to mobile: save desktop layout and scale down
   * When switching to desktop: restore original desktop layout
   */
  setCanvasMode: (mode: 'desktop' | 'mobile') => {
    const DESKTOP_WIDTH = 600;
    const MOBILE_WIDTH = 320;
    const targetWidth = mode === 'mobile' ? MOBILE_WIDTH : DESKTOP_WIDTH;
    
    set((state) => {
      let updatedBlocks = state.blocks;
      
      if (mode === 'mobile') {
        // Switching TO mobile: save desktop layout and scale down
        updatedBlocks = state.blocks.map((block) => {
          const shouldScale = block.responsiveMode !== 'fixed';
          
          if (shouldScale && block.layout.width > MOBILE_WIDTH) {
            // Save current layout as desktop layout before scaling
            const desktopLayout = block.desktopLayout || { ...block.layout };
            
            // Calculate scale factor
            const scaleFactor = MOBILE_WIDTH / block.layout.width;
            const newWidth = MOBILE_WIDTH;
            const newHeight = typeof block.layout.height === 'number' 
              ? Math.round(block.layout.height * scaleFactor) 
              : block.layout.height;
            
            // Scale x position proportionally
            const newX = Math.round(block.layout.x * (MOBILE_WIDTH / DESKTOP_WIDTH));
            
            return {
              ...block,
              desktopLayout, // Store original desktop layout
              layout: {
                ...block.layout,
                width: newWidth,
                height: newHeight,
                x: Math.max(0, Math.min(newX, MOBILE_WIDTH - newWidth)),
              },
            };
          }
          
          // For blocks that fit in mobile but might need x adjustment
          if (shouldScale && block.layout.x + block.layout.width > MOBILE_WIDTH) {
            const desktopLayout = block.desktopLayout || { ...block.layout };
            return {
              ...block,
              desktopLayout,
              layout: {
                ...block.layout,
                x: Math.max(0, MOBILE_WIDTH - block.layout.width),
              },
            };
          }
          
          return block;
        });
      } else {
        // Switching TO desktop: restore original desktop layout
        updatedBlocks = state.blocks.map((block) => {
          if (block.desktopLayout) {
            return {
              ...block,
              layout: { ...block.desktopLayout },
              desktopLayout: undefined, // Clear stored layout
            };
          }
          return block;
        });
      }
      
      return {
        blocks: updatedBlocks,
        canvasSettings: {
          ...state.canvasSettings,
          width: targetWidth,
          mode,
        },
      };
    });
  },

  /**
   * Resize Canvas With Constraints - Phase 14: Frame & Constraints Engine
   * Applies Figma-style constraint logic when canvas width changes
   */
  resizeCanvasWithConstraints: (newWidth: number) => {
    const { canvasSettings } = get();
    const oldWidth = canvasSettings.width;
    
    // Don't process if width hasn't changed
    if (oldWidth === newWidth) return;
    
    set((state) => {
      const updatedBlocks = state.blocks.map((block) => {
        // Get constraint defaults if not set
        const constraints = block.constraints || { horizontal: 'left', vertical: 'top' };
        const layout = { ...block.layout };
        
        // Apply horizontal constraint
        switch (constraints.horizontal) {
          case 'left':
            // x stays the same - no change needed
            break;
            
          case 'right':
            // Keep same distance from right edge
            const rightMargin = oldWidth - (layout.x + layout.width);
            layout.x = newWidth - layout.width - rightMargin;
            break;
            
          case 'center':
            // Keep centered in the canvas
            const oldCenter = layout.x + layout.width / 2;
            const centerRatio = oldCenter / oldWidth;
            layout.x = (newWidth * centerRatio) - layout.width / 2;
            break;
            
          case 'scale':
            // Scale width proportionally
            const widthRatio = layout.width / oldWidth;
            const xRatio = layout.x / oldWidth;
            layout.width = Math.round(newWidth * widthRatio);
            layout.x = Math.round(newWidth * xRatio);
            break;
        }
        
        // Clamp x to valid bounds
        layout.x = Math.max(0, Math.min(layout.x, newWidth - layout.width));
        
        // If block is wider than canvas after resize, scale it down
        if (layout.width > newWidth) {
          const scaleFactor = newWidth / layout.width;
          layout.width = newWidth;
          if (typeof layout.height === 'number') {
            layout.height = Math.round(layout.height * scaleFactor);
          }
          layout.x = 0;
        }
        
        return {
          ...block,
          layout,
        };
      });
      
      return {
        blocks: updatedBlocks,
        canvasSettings: {
          ...state.canvasSettings,
          width: newWidth,
        },
      };
    });
  },

  deleteSelectedBlocks: () => {
    const { selectedBlockIds } = get();
    if (selectedBlockIds.length > 0) {
      set((state) => ({
        blocks: state.blocks.filter((b) => !selectedBlockIds.includes(b.id)),
        selectedBlockIds: [],
      }));
    }
  },

  updateBlockLayout: (id: string, layout: Partial<BlockLayout>) => {
    set((state) => {
      const isMobileMode = state.canvasSettings.mode === 'mobile';
      
      return {
        blocks: state.blocks.map((block) => {
          if (block.id !== id) return block;
          
          // If user manually resizes in mobile mode, clear the stored desktop layout
          // This means their manual adjustment becomes the new "source of truth"
          const updatedBlock = {
            ...block,
            layout: { ...block.layout, ...layout },
          };
          
          // If in mobile mode and user resizes, clear desktopLayout
          // so it won't revert when switching back
          if (isMobileMode && (layout.width !== undefined || layout.height !== undefined || layout.x !== undefined)) {
            updatedBlock.desktopLayout = undefined;
          }
          
          return updatedBlock;
        }),
      };
    });
  },

  bringToFront: (id?: string) => {
    const { blocks, selectedBlockIds } = get();
    const targetIds = id ? [id] : selectedBlockIds;
    if (targetIds.length === 0) return;
    
    const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.layout?.zIndex || 0), 0);
    set((state) => ({
      blocks: state.blocks.map((block, index) =>
        targetIds.includes(block.id)
          ? { ...block, layout: { ...block.layout, zIndex: maxZIndex + 1 + index } }
          : block
      ),
    }));
  },

  sendToBack: (id?: string) => {
    const { blocks, selectedBlockIds } = get();
    const targetIds = id ? [id] : selectedBlockIds;
    if (targetIds.length === 0) return;
    
    const minZIndex = blocks.reduce((min, b) => Math.min(min, b.layout?.zIndex || 0), Infinity);
    set((state) => ({
      blocks: state.blocks.map((block, index) =>
        targetIds.includes(block.id)
          ? { ...block, layout: { ...block.layout, zIndex: Math.max(0, minZIndex - 1 - index) } }
          : block
      ),
    }));
  },

  bringForward: (id?: string) => {
    const { selectedBlockIds } = get();
    const targetIds = id ? [id] : selectedBlockIds;
    if (targetIds.length === 0) return;
    
    set((state) => ({
      blocks: state.blocks.map((block) =>
        targetIds.includes(block.id)
          ? { ...block, layout: { ...block.layout, zIndex: (block.layout?.zIndex || 0) + 1 } }
          : block
      ),
    }));
  },

  sendBackward: (id?: string) => {
    const { selectedBlockIds } = get();
    const targetIds = id ? [id] : selectedBlockIds;
    if (targetIds.length === 0) return;
    
    set((state) => ({
      blocks: state.blocks.map((block) =>
        targetIds.includes(block.id)
          ? { ...block, layout: { ...block.layout, zIndex: Math.max(0, (block.layout?.zIndex || 0) - 1) } }
          : block
      ),
    }));
  },

  // === ALIGNMENT ACTIONS ===
  alignLeft: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length < 2) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    const minX = Math.min(...selectedBlocks.map((b) => b.layout.x));
    
    set((state) => ({
      blocks: state.blocks.map((block) =>
        selectedBlockIds.includes(block.id)
          ? { ...block, layout: { ...block.layout, x: minX } }
          : block
      ),
    }));
  },

  alignCenter: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length < 2) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    const minX = Math.min(...selectedBlocks.map((b) => b.layout.x));
    const maxX = Math.max(...selectedBlocks.map((b) => b.layout.x + (typeof b.layout.width === 'number' ? b.layout.width : 0)));
    const centerX = (minX + maxX) / 2;
    
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (!selectedBlockIds.includes(block.id)) return block;
        const blockWidth = typeof block.layout.width === 'number' ? block.layout.width : 0;
        return { ...block, layout: { ...block.layout, x: centerX - blockWidth / 2 } };
      }),
    }));
  },

  alignRight: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length < 2) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    const maxRight = Math.max(...selectedBlocks.map((b) => b.layout.x + (typeof b.layout.width === 'number' ? b.layout.width : 0)));
    
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (!selectedBlockIds.includes(block.id)) return block;
        const blockWidth = typeof block.layout.width === 'number' ? block.layout.width : 0;
        return { ...block, layout: { ...block.layout, x: maxRight - blockWidth } };
      }),
    }));
  },

  alignTop: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length < 2) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    const minY = Math.min(...selectedBlocks.map((b) => b.layout.y));
    
    set((state) => ({
      blocks: state.blocks.map((block) =>
        selectedBlockIds.includes(block.id)
          ? { ...block, layout: { ...block.layout, y: minY } }
          : block
      ),
    }));
  },

  alignMiddle: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length < 2) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    const minY = Math.min(...selectedBlocks.map((b) => b.layout.y));
    const maxY = Math.max(...selectedBlocks.map((b) => {
      const height = b.layout.height === 'auto' ? 50 : b.layout.height;
      return b.layout.y + (typeof height === 'number' ? height : 0);
    }));
    const centerY = (minY + maxY) / 2;
    
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (!selectedBlockIds.includes(block.id)) return block;
        const blockHeight = block.layout.height === 'auto' ? 50 : (typeof block.layout.height === 'number' ? block.layout.height : 0);
        return { ...block, layout: { ...block.layout, y: centerY - blockHeight / 2 } };
      }),
    }));
  },

  alignBottom: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length < 2) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    const maxBottom = Math.max(...selectedBlocks.map((b) => {
      const height = b.layout.height === 'auto' ? 50 : b.layout.height;
      return b.layout.y + (typeof height === 'number' ? height : 0);
    }));
    
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (!selectedBlockIds.includes(block.id)) return block;
        const blockHeight = block.layout.height === 'auto' ? 50 : (typeof block.layout.height === 'number' ? block.layout.height : 0);
        return { ...block, layout: { ...block.layout, y: maxBottom - blockHeight } };
      }),
    }));
  },

  distributeHorizontal: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length < 3) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id))
      .sort((a, b) => a.layout.x - b.layout.x);
    
    const first = selectedBlocks[0];
    const last = selectedBlocks[selectedBlocks.length - 1];
    const firstX = first.layout.x;
    const lastX = last.layout.x + (typeof last.layout.width === 'number' ? last.layout.width : 0);
    
    const totalWidth = selectedBlocks.reduce((sum, b) => sum + (typeof b.layout.width === 'number' ? b.layout.width : 0), 0);
    const totalGap = (lastX - firstX) - totalWidth;
    const gapBetween = totalGap / (selectedBlocks.length - 1);
    
    let currentX = firstX;
    const updates: Record<string, number> = {};
    
    selectedBlocks.forEach((block) => {
      updates[block.id] = currentX;
      currentX += (typeof block.layout.width === 'number' ? block.layout.width : 0) + gapBetween;
    });
    
    set((state) => ({
      blocks: state.blocks.map((block) =>
        updates[block.id] !== undefined
          ? { ...block, layout: { ...block.layout, x: updates[block.id] } }
          : block
      ),
    }));
  },

  distributeVertical: () => {
    const { blocks, selectedBlockIds } = get();
    if (selectedBlockIds.length < 3) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id))
      .sort((a, b) => a.layout.y - b.layout.y);
    
    const first = selectedBlocks[0];
    const last = selectedBlocks[selectedBlocks.length - 1];
    const firstY = first.layout.y;
    const lastHeight = last.layout.height === 'auto' ? 50 : (typeof last.layout.height === 'number' ? last.layout.height : 0);
    const lastY = last.layout.y + lastHeight;
    
    const totalHeight = selectedBlocks.reduce((sum, b) => {
      const h = b.layout.height === 'auto' ? 50 : (typeof b.layout.height === 'number' ? b.layout.height : 0);
      return sum + h;
    }, 0);
    const totalGap = (lastY - firstY) - totalHeight;
    const gapBetween = totalGap / (selectedBlocks.length - 1);
    
    let currentY = firstY;
    const updates: Record<string, number> = {};
    
    selectedBlocks.forEach((block) => {
      updates[block.id] = currentY;
      const h = block.layout.height === 'auto' ? 50 : (typeof block.layout.height === 'number' ? block.layout.height : 0);
      currentY += h + gapBetween;
    });
    
    set((state) => ({
      blocks: state.blocks.map((block) =>
        updates[block.id] !== undefined
          ? { ...block, layout: { ...block.layout, y: updates[block.id] } }
          : block
      ),
    }));
  },

  // === CLIPBOARD ACTIONS ===
  copySelectedBlocks: () => {
    const { blocks, selectedBlockIds } = get();
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    set({ clipboard: selectedBlocks });
  },

  pasteBlocks: () => {
    const { clipboard, blocks, blockCounters } = get();
    if (clipboard.length === 0) return;
    
    const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.layout?.zIndex || 0), 0);
    const newCounters = { ...blockCounters };
    const newBlockIds: string[] = [];
    
    const pastedBlocks = clipboard.map((block) => {
      newCounters[block.type]++;
      const newId = generateBlockId();
      newBlockIds.push(newId);
      return {
        ...block,
        id: newId,
        name: `${DEFAULT_BLOCK_NAMES[block.type]} ${newCounters[block.type]}`,
        styles: { ...block.styles },
        layout: {
          ...block.layout,
          x: block.layout.x + 20,
          y: block.layout.y + 20,
          zIndex: maxZIndex + newBlockIds.length,
        },
      };
    });
    
    set((state) => ({
      blocks: [...state.blocks, ...pastedBlocks],
      selectedBlockIds: newBlockIds,
      blockCounters: newCounters,
    }));
  },

  duplicateSelectedBlocks: () => {
    const { blocks, selectedBlockIds, blockCounters } = get();
    if (selectedBlockIds.length === 0) return;
    
    const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
    const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.layout?.zIndex || 0), 0);
    const newCounters = { ...blockCounters };
    const newBlockIds: string[] = [];
    
    const duplicatedBlocks = selectedBlocks.map((block) => {
      newCounters[block.type]++;
      const newId = generateBlockId();
      newBlockIds.push(newId);
      return {
        ...block,
        id: newId,
        name: `${DEFAULT_BLOCK_NAMES[block.type]} ${newCounters[block.type]}`,
        styles: { ...block.styles },
        layout: {
          ...block.layout,
          x: block.layout.x + 20,
          y: block.layout.y + 20,
          zIndex: maxZIndex + newBlockIds.length,
        },
      };
    });
    
    set((state) => ({
      blocks: [...state.blocks, ...duplicatedBlocks],
      selectedBlockIds: newBlockIds,
      blockCounters: newCounters,
    }));
  },

  nudgeSelectedBlocks: (dx: number, dy: number) => {
    const { selectedBlockIds } = get();
    if (selectedBlockIds.length === 0) return;
    
    set((state) => ({
      blocks: state.blocks.map((block) =>
        selectedBlockIds.includes(block.id)
          ? {
              ...block,
              layout: {
                ...block.layout,
                x: Math.max(0, block.layout.x + dx),
                y: Math.max(0, block.layout.y + dy),
              },
            }
          : block
      ),
    }));
  },

  // === VIEWPORT ACTIONS ===
  setViewport: (updates: Partial<Viewport>) => {
    set((state) => ({
      viewport: { ...state.viewport, ...updates },
    }));
  },

  zoomIn: () => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.min(state.viewport.zoom + 0.1, 5),
      },
    }));
  },

  zoomOut: () => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.max(state.viewport.zoom - 0.1, 0.1),
      },
    }));
  },

  resetZoom: () => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: 1,
        x: 0,
        y: 0,
      },
    }));
  },

  fitToScreen: () => {
    // Reset to default centered view
    set(() => ({
      viewport: {
        zoom: 1,
        x: 0,
        y: 0,
      },
    }));
  },

  /**
   * Group Selected Blocks - Phase 15: Hierarchy Engine
   * Creates a parent group from selected blocks with relative positioning
   */
  groupSelectedBlocks: () => {
    const { selectedBlockIds, blocks, blockCounters } = get();
    
    // Need at least 2 blocks to group
    if (selectedBlockIds.length < 2) return;
    
    // Get selected blocks (only top-level, not already in a group)
    const selectedBlocks = blocks.filter(
      (b) => selectedBlockIds.includes(b.id) && !b.parentId
    );
    
    if (selectedBlocks.length < 2) return;
    
    // Calculate bounding box of selection
    const minX = Math.min(...selectedBlocks.map((b) => b.layout.x));
    const minY = Math.min(...selectedBlocks.map((b) => b.layout.y));
    const maxX = Math.max(...selectedBlocks.map((b) => b.layout.x + b.layout.width));
    const maxY = Math.max(...selectedBlocks.map((b) => {
      const height = typeof b.layout.height === 'number' ? b.layout.height : 100;
      return b.layout.y + height;
    }));
    
    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;
    
    // Generate new group ID
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newCounter = blockCounters.group + 1;
    
    // Get max zIndex
    const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.layout?.zIndex || 0), 0);
    
    // Create the group block
    const groupBlock: EditorBlock = {
      id: groupId,
      type: 'group',
      content: '',
      styles: { opacity: '1' },
      layout: {
        x: minX,
        y: minY,
        width: groupWidth,
        height: groupHeight,
        zIndex: maxZIndex + 1,
      },
      name: `Group ${newCounter}`,
      isLocked: false,
      isVisible: true,
      parentId: null,
      constraints: { horizontal: 'left', vertical: 'top' },
    };
    
    // Update selected blocks: set parentId and convert to relative coordinates
    const updatedBlocks = blocks.map((block) => {
      if (selectedBlockIds.includes(block.id) && !block.parentId) {
        return {
          ...block,
          parentId: groupId,
          layout: {
            ...block.layout,
            // Convert absolute -> relative coordinates
            x: block.layout.x - minX,
            y: block.layout.y - minY,
          },
        };
      }
      return block;
    });
    
    set((state) => ({
      blocks: [...updatedBlocks, groupBlock],
      selectedBlockIds: [groupId],
      blockCounters: { ...blockCounters, group: newCounter },
      // Phase 16: Auto-expand new groups in layers panel
      expandedGroupIds: [...state.expandedGroupIds, groupId],
    }));
  },

  /**
   * Ungroup Selected Block - Phase 15: Hierarchy Engine
   * Dissolves a group, restoring children to absolute coordinates
   */
  ungroupSelectedBlock: () => {
    const { selectedBlockIds, blocks } = get();
    
    // Need exactly one group selected
    if (selectedBlockIds.length !== 1) return;
    
    const groupId = selectedBlockIds[0];
    const groupBlock = blocks.find((b) => b.id === groupId && b.type === 'group');
    
    if (!groupBlock) return;
    
    // Get children of this group
    const childIds: string[] = [];
    
    // Update children: convert back to absolute coordinates
    const updatedBlocks = blocks
      .filter((b) => b.id !== groupId) // Remove the group
      .map((block) => {
        if (block.parentId === groupId) {
          childIds.push(block.id);
          return {
            ...block,
            parentId: null,
            layout: {
              ...block.layout,
              // Convert relative -> absolute coordinates
              x: block.layout.x + groupBlock.layout.x,
              y: block.layout.y + groupBlock.layout.y,
            },
          };
        }
        return block;
      });
    
    set({
      blocks: updatedBlocks,
      selectedBlockIds: childIds, // Select the ungrouped children
    });
  },

  /**
   * Toggle Group Expansion - Phase 16: Professional Layers Tree
   * Expands/collapses groups in the layers panel
   */
  toggleGroupExpansion: (id: string) => {
    set((state) => ({
      expandedGroupIds: state.expandedGroupIds.includes(id)
        ? state.expandedGroupIds.filter((gid) => gid !== id)
        : [...state.expandedGroupIds, id],
    }));
  },

  /**
   * Create Component - Phase 17: Component & Asset Library
   * Saves the selected block(s) as a reusable component
   */
  createComponent: () => {
    const { selectedBlockIds, blocks } = get();
    
    if (selectedBlockIds.length === 0) return;
    
    // Get the first selected block (or could be a group)
    const blockId = selectedBlockIds[0];
    const block = blocks.find((b) => b.id === blockId);
    
    if (!block) return;
    
    // Deep clone function that handles nested structures
    const deepCloneBlock = (b: EditorBlock, newId: string): EditorBlock => ({
      ...b,
      id: newId,
      name: `${b.name} (Component)`,
      styles: { ...b.styles },
      layout: { ...b.layout },
      constraints: b.constraints 
        ? { ...b.constraints } 
        : { horizontal: 'left', vertical: 'top' },
      socialData: b.socialData ? JSON.parse(JSON.stringify(b.socialData)) : undefined,
      parentId: null, // Assets are always root-level
    });
    
    // Clone the main block
    const newAssetId = generateBlockId();
    const assetBlock = deepCloneBlock(block, newAssetId);
    
    // If it's a group, also clone children (store them with new parent reference)
    const assetChildren: EditorBlock[] = [];
    if (block.type === 'group') {
      const children = blocks.filter((b) => b.parentId === block.id);
      children.forEach((child) => {
        const childClone = deepCloneBlock(child, generateBlockId());
        childClone.parentId = newAssetId;
        assetChildren.push(childClone);
      });
    }
    
    set((state) => ({
      assets: [...state.assets, assetBlock, ...assetChildren],
    }));
  },

  /**
   * Add Asset to Canvas - Phase 17: Component & Asset Library
   * Creates a copy of an asset and adds it to the canvas
   */
  addAssetToCanvas: (assetId: string) => {
    const { assets, blocks, viewport, canvasSettings } = get();
    
    // Find the asset
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;
    
    // Calculate center of current viewport
    const viewportCenterX = (-viewport.x + (canvasSettings.width / 2)) / viewport.zoom;
    const viewportCenterY = (-viewport.y + 300) / viewport.zoom; // Approximate center
    
    // Get max zIndex
    const maxZIndex = blocks.reduce((max, b) => Math.max(max, b.layout?.zIndex || 0), 0);
    
    // Generate new IDs and clone
    const newBlockId = generateBlockId();
    const newBlock: EditorBlock = {
      ...asset,
      id: newBlockId,
      name: asset.name.replace(' (Component)', ''), // Remove Component suffix
      styles: { ...asset.styles },
      layout: {
        ...asset.layout,
        x: Math.max(0, viewportCenterX - (asset.layout.width / 2)),
        y: Math.max(0, viewportCenterY),
        zIndex: maxZIndex + 1,
      },
      constraints: asset.constraints 
        ? { ...asset.constraints } 
        : { horizontal: 'left', vertical: 'top' },
      socialData: asset.socialData ? JSON.parse(JSON.stringify(asset.socialData)) : undefined,
      parentId: null,
    };
    
    // If it's a group, also clone children
    const newChildren: EditorBlock[] = [];
    if (asset.type === 'group') {
      const assetChildren = assets.filter((a) => a.parentId === asset.id);
      assetChildren.forEach((child) => {
        const newChild: EditorBlock = {
          ...child,
          id: generateBlockId(),
          name: child.name.replace(' (Component)', ''),
          styles: { ...child.styles },
          layout: { ...child.layout },
          constraints: child.constraints 
            ? { ...child.constraints } 
            : { horizontal: 'left', vertical: 'top' },
          socialData: child.socialData ? JSON.parse(JSON.stringify(child.socialData)) : undefined,
          parentId: newBlockId,
        };
        newChildren.push(newChild);
      });
    }
    
    set((state) => ({
      blocks: [...state.blocks, newBlock, ...newChildren],
      selectedBlockIds: [newBlockId],
      // Auto-expand the group in layers panel
      expandedGroupIds: asset.type === 'group'
        ? [...state.expandedGroupIds, newBlockId]
        : state.expandedGroupIds,
    }));
  },

  /**
   * Remove Asset - Phase 17: Component & Asset Library
   * Removes an asset and its children from the library
   */
  removeAsset: (assetId: string) => {
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== assetId && a.parentId !== assetId),
    }));
  },

  /**
   * Add Variable - Phase 18: Variable Engine (Design Tokens)
   * Creates a new design token
   */
  addVariable: (variable: Omit<DesignToken, 'id'>) => {
    const newVariable: DesignToken = {
      ...variable,
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    set((state) => ({
      variables: [...state.variables, newVariable],
    }));
  },

  /**
   * Update Variable - Phase 18: Variable Engine (Design Tokens)
   * Updates an existing design token
   */
  updateVariable: (id: string, updates: Partial<Omit<DesignToken, 'id'>>) => {
    set((state) => ({
      variables: state.variables.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }));
  },

  /**
   * Delete Variable - Phase 18: Variable Engine (Design Tokens)
   * Removes a design token (blocks using it will show raw var: reference)
   */
  deleteVariable: (id: string) => {
    set((state) => ({
      variables: state.variables.filter((v) => v.id !== id),
    }));
  },

  /**
   * Set Interaction Mode - Phase 20: Deep Core Stability
   * Updates the interaction state machine
   */
  setInteractionMode: (mode: InteractionMode) => {
    set({ interactionMode: mode });
  },

  /**
   * Set Editing Block - Phase 20: Deep Core Stability
   * Sets mode to 'editing' and tracks the block ID
   */
  setEditingBlock: (id: string | null) => {
    if (id) {
      set({ interactionMode: 'editing', editingBlockId: id });
    } else {
      set({ interactionMode: 'idle', editingBlockId: null });
    }
  },

  /**
   * Reset Interaction - Phase 20: Deep Core Stability
   * Sets mode back to 'idle' and clears editing ID
   */
  resetInteraction: () => {
    set({ interactionMode: 'idle', editingBlockId: null });
  },
}),
    {
      // Only track changes to blocks (not viewport or selection)
      partialize: (state) => ({
        blocks: state.blocks,
        blockCounters: state.blockCounters,
      }),
      // Limit history to 50 steps
      limit: 50,
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useBlocks = () => useEditorStore((state) => state.blocks);
export const useSelectedBlockIds = () => useEditorStore((state) => state.selectedBlockIds);
export const useSelectedBlockId = () => {
  // For backward compatibility - returns first selected block ID
  const selectedBlockIds = useEditorStore((state) => state.selectedBlockIds);
  return selectedBlockIds.length > 0 ? selectedBlockIds[0] : null;
};
export const useSelectedBlock = () => {
  const blocks = useEditorStore((state) => state.blocks);
  const selectedBlockIds = useEditorStore((state) => state.selectedBlockIds);
  // For single selection, return the first selected block
  if (selectedBlockIds.length === 1) {
    return blocks.find((b) => b.id === selectedBlockIds[0]) ?? null;
  }
  return null;
};
export const useSelectedBlocks = () => {
  const blocks = useEditorStore((state) => state.blocks);
  const selectedBlockIds = useEditorStore((state) => state.selectedBlockIds);
  return blocks.filter((b) => selectedBlockIds.includes(b.id));
};
export const useVisibleBlocks = () => useEditorStore((state) => state.blocks.filter(b => b.isVisible));
export const useCanvasSettings = () => useEditorStore((state) => state.canvasSettings);
export const useViewport = () => useEditorStore((state) => state.viewport);
export const useExpandedGroupIds = () => useEditorStore((state) => state.expandedGroupIds);
export const useAssets = () => useEditorStore((state) => state.assets);
export const useInteractionMode = () => useEditorStore((state) => state.interactionMode);
export const useEditingBlockId = () => useEditorStore((state) => state.editingBlockId);
export const useVariables = () => useEditorStore((state) => state.variables);

/**
 * Resolve a style value that might be a variable reference
 * If value starts with "var:", look up the variable value
 * Otherwise return the value as-is
 */
export const resolveStyleValue = (value: string | undefined, variables: DesignToken[]): string | undefined => {
  if (!value) return value;
  if (value.startsWith('var:')) {
    const varId = value.substring(4); // Remove "var:" prefix
    const variable = variables.find((v) => v.id === varId);
    return variable?.value || value; // Fallback to raw value if not found
  }
  return value;
};

/**
 * Hook to get resolved style values for a block
 */
export const useResolvedStyles = (styles: Record<string, string>): Record<string, string> => {
  const variables = useVariables();
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(styles)) {
    resolved[key] = resolveStyleValue(value, variables) || value;
  }
  return resolved;
};

/**
 * Temporal (History) store for Undo/Redo
 * Access the temporal store directly from useEditorStore.temporal
 */
export const useTemporalStore = () => useEditorStore.temporal.getState();

/**
 * Convenient history hooks
 */
export const useCanUndo = () => {
  const temporalStore = useEditorStore.temporal.getState();
  return temporalStore.pastStates.length > 0;
};
export const useCanRedo = () => {
  const temporalStore = useEditorStore.temporal.getState();
  return temporalStore.futureStates.length > 0;
};
export const useUndo = () => {
  return () => useEditorStore.temporal.getState().undo();
};
export const useRedo = () => {
  return () => useEditorStore.temporal.getState().redo();
};

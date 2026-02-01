/**
 * FreeBlock Component
 * Phase 20: Deep Core Stability Fix
 * 
 * Wraps blocks in react-rnd for free-form drag and resize
 * Uses Interaction State Machine to prevent event conflicts
 * Z-Index Hierarchy: Unselected < Selected (1000+) < Editing (2000+)
 */

"use client";

import { useCallback, useMemo } from "react";
import { Rnd, RndDragCallback, RndResizeCallback } from "react-rnd";
import { 
  useEditorStore, 
  useBlocks, 
  useInteractionMode, 
  useEditingBlockId 
} from "@/store/useEditorStore";
import type { EditorBlock } from "@/types/editor";
import { cn } from "@/lib/utils";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { ShapeBlock } from "./blocks/ShapeBlock";
import { TableBlock } from "./blocks/TableBlock";
import { ListBlock } from "./blocks/ListBlock";
import { SocialBlock } from "./SocialBlock";
import { calculateSnapping, GuideLine } from "./SmartGuides";
import { Minus } from "lucide-react";

interface FreeBlockProps {
  block: EditorBlock;
  isSelected: boolean;
  onDragUpdate?: (guides: GuideLine[]) => void;
  onDragEnd?: () => void;
  /** All blocks for recursive rendering (Phase 15) */
  allBlocks?: EditorBlock[];
  /** All selected block IDs for child selection (Phase 15) */
  selectedBlockIds?: string[];
}

/**
 * Block Content Renderer
 */
function BlockContent({ 
  block, 
  isEditing,
  allBlocks,
  selectedBlockIds,
}: { 
  block: EditorBlock; 
  isEditing?: boolean;
  allBlocks?: EditorBlock[];
  selectedBlockIds?: string[];
}) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} isEditing={isEditing} />;

    case 'image':
      return <ImageBlock block={block} />;

    case 'button':
      return <ButtonBlock block={block} isEditing={isEditing} />;

    case 'shape':
      return <ShapeBlock block={block} />;

    case 'spacer':
      return (
        <div 
          className="w-full h-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300"
        >
          <Minus className="w-6 h-6 text-slate-400" />
        </div>
      );

    case 'divider':
      return (
        <div className="w-full h-full flex items-center px-4">
          <div className="w-full border-t border-slate-300" />
        </div>
      );

    case 'social':
      return (
        <SocialBlock 
          socialData={block.socialData}
          className="p-2"
        />
      );

    case 'table':
      return <TableBlock block={block} isEditing={isEditing} />;

    case 'list':
      return <ListBlock block={block} isEditing={isEditing} />;

    case 'group':
      // Phase 15: Render children recursively
      const children = allBlocks?.filter((b) => b.parentId === block.id) || [];
      return (
        <div className="relative w-full h-full">
          {/* Group visual indicator */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              border: '1px dashed rgba(13, 148, 136, 0.3)',
              borderRadius: '4px',
            }}
          />
          {/* Render children with relative positioning */}
          {children.map((child) => (
            <FreeBlockChild
              key={child.id}
              block={child}
              isSelected={selectedBlockIds?.includes(child.id) || false}
              allBlocks={allBlocks}
              selectedBlockIds={selectedBlockIds}
            />
          ))}
        </div>
      );

    default:
      return (
        <div className="p-4 text-sm text-muted-foreground">
          Unknown block type
        </div>
      );
  }
}

/**
 * Figma-style resize handle component
 * White squares with teal borders and subtle shadows
 */
function ResizeHandle({ position }: { position: string }) {
  const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(position);
  
  // Corner handles: 6x6px white squares with 1px teal border
  if (isCorner) {
    return (
      <div
        className="absolute"
        style={{
          width: 6,
          height: 6,
          backgroundColor: 'white',
          border: '1px solid #0d9488',
          borderRadius: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  }

  // Edge handles (smaller rectangles for fine adjustments)
  const isHorizontal = ['left', 'right'].includes(position);
  return (
    <div
      className="absolute"
      style={{
        width: isHorizontal ? 4 : 10,
        height: isHorizontal ? 10 : 4,
        backgroundColor: 'white',
        border: '1px solid #0d9488',
        borderRadius: 0,
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

/**
 * Rotation Handle Component (Future prep)
 * Extends from top-center of the selection box
 */
function RotationHandle() {
  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
      style={{ top: -28 }}
    >
      {/* Connector line */}
      <div 
        className="w-px bg-[#0d9488]"
        style={{ height: 16 }}
      />
      {/* Rotation circle */}
      <div
        className="rounded-full pointer-events-auto cursor-grab hover:bg-teal-50"
        style={{
          width: 10,
          height: 10,
          backgroundColor: 'white',
          border: '1px solid #0d9488',
          boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
        }}
        title="Rotate (coming soon)"
      />
    </div>
  );
}

/**
 * FreeBlockChild - Simplified block renderer for children inside groups (Phase 15)
 * Uses absolute positioning relative to parent group
 */
function FreeBlockChild({ 
  block, 
  isSelected,
  allBlocks,
  selectedBlockIds,
}: { 
  block: EditorBlock; 
  isSelected: boolean;
  allBlocks?: EditorBlock[];
  selectedBlockIds?: string[];
}) {
  const { selectBlock, setEditingBlock } = useEditorStore();
  const editingBlockId = useEditingBlockId();
  const layout = block.layout;
  const isEditing = editingBlockId === block.id;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Select the child directly (drill-down)
      selectBlock(block.id, e.shiftKey);
    },
    [block.id, selectBlock]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Enable editing mode for text-containing blocks
      if (['text', 'button', 'table', 'list'].includes(block.type)) {
        setEditingBlock(block.id);
      }
    },
    [block.id, block.type, setEditingBlock]
  );

  if (!block.isVisible) return null;

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "absolute cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-1"
      )}
      style={{
        left: layout.x,
        top: layout.y,
        width: layout.width,
        height: layout.height === 'auto' ? 'auto' : layout.height,
        zIndex: layout.zIndex,
        opacity: parseFloat(block.styles.opacity || '1'),
      }}
    >
      <BlockContent 
        block={block}
        isEditing={isEditing}
        allBlocks={allBlocks}
        selectedBlockIds={selectedBlockIds}
      />
    </div>
  );
}

export function FreeBlock({ 
  block, 
  isSelected, 
  onDragUpdate, 
  onDragEnd,
  allBlocks,
  selectedBlockIds,
}: FreeBlockProps) {
  const { 
    selectBlock, 
    updateBlockLayout, 
    bringToFront,
    setInteractionMode,
    setEditingBlock,
    resetInteraction,
  } = useEditorStore();
  const blocks = useBlocks();
  const interactionMode = useInteractionMode();
  const editingBlockId = useEditingBlockId();
  
  // Check if THIS block is being edited
  const isThisBlockEditing = editingBlockId === block.id;

  const layout = block.layout;
  
  // Use allBlocks if provided (for groups), otherwise use store blocks
  const blocksToUse = allBlocks || blocks;

  // Cache other blocks for snapping calculations
  const otherBlocks = useMemo(() => 
    blocksToUse.filter(b => b.id !== block.id && b.isVisible && !b.parentId),
    [blocksToUse, block.id]
  );

  /**
   * Z-Index Hierarchy (Phase 20)
   * - Unselected: block.zIndex
   * - Selected: 1000 + block.zIndex
   * - Editing: 2000 + block.zIndex
   */
  const computedZIndex = useMemo(() => {
    const baseZ = layout.zIndex || 0;
    if (isThisBlockEditing) return 2000 + baseZ;
    if (isSelected) return 1000 + baseZ;
    return baseZ;
  }, [layout.zIndex, isSelected, isThisBlockEditing]);

  const handleDragStart = useCallback(() => {
    setInteractionMode('dragging');
    bringToFront(block.id);
  }, [block.id, bringToFront, setInteractionMode]);

  // Handle drag with snapping
  const handleDrag = useCallback(
    (_e: unknown, data: { x: number; y: number }) => {
      const snapResult = calculateSnapping(block, data.x, data.y, otherBlocks);
      
      // Notify parent about guides
      if (onDragUpdate) {
        onDragUpdate(snapResult.guides);
      }
      
      return snapResult;
    },
    [block, otherBlocks, onDragUpdate]
  );

  const handleDragStop: RndDragCallback = useCallback(
    (e, data) => {
      setInteractionMode('idle');
      
      // Apply snapped position if available
      const snapResult = calculateSnapping(block, data.x, data.y, otherBlocks);
      const finalX = snapResult.snapX !== null ? snapResult.snapX : data.x;
      const finalY = snapResult.snapY !== null ? snapResult.snapY : data.y;
      
      updateBlockLayout(block.id, {
        x: Math.round(finalX),
        y: Math.round(finalY),
      });
      
      // Clear guides
      if (onDragEnd) {
        onDragEnd();
      }
    },
    [block, otherBlocks, updateBlockLayout, onDragEnd, setInteractionMode]
  );

  const handleResizeStart = useCallback(() => {
    setInteractionMode('resizing');
  }, [setInteractionMode]);

  const handleResizeStop: RndResizeCallback = useCallback(
    (e, direction, ref, delta, position) => {
      setInteractionMode('idle');
      updateBlockLayout(block.id, {
        width: parseInt(ref.style.width),
        height: ref.style.height === 'auto' ? 'auto' : parseInt(ref.style.height),
        x: Math.round(position.x),
        y: Math.round(position.y),
      });
    },
    [block.id, updateBlockLayout, setInteractionMode]
  );

  /**
   * Mouse Down Handler - Allow event to bubble to Rnd for dragging
   * Only stop propagation for text-editing blocks to allow text selection
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // If in editing mode for this block, stop propagation to allow text selection
      // but let the event continue for the contentEditable
      if (isThisBlockEditing) {
        e.stopPropagation();
        return;
      }
      
      // For non-editing blocks, DON'T stop propagation
      // Let the event bubble up to Rnd for drag handling
      // Rnd handles the drag initiation at its level
    },
    [isThisBlockEditing]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // If we're editing this block, don't change selection
      if (isThisBlockEditing) return;
      
      // If clicking a group, select the group (Phase 15)
      if (block.type === 'group') {
        selectBlock(block.id, e.shiftKey);
        return;
      }
      
      // Check if this block is a child of a group
      const parentGroup = blocksToUse.find(b => b.id === block.parentId && b.type === 'group');
      if (parentGroup && !e.shiftKey) {
        // Single click on a grouped child -> select the parent group
        selectBlock(parentGroup.id, false);
      } else {
        selectBlock(block.id, e.shiftKey);
      }
    },
    [block.id, block.type, block.parentId, blocksToUse, selectBlock, isThisBlockEditing]
  );

  /**
   * Double Click Handler - Enter editing mode for editable blocks
   */
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // For text-containing blocks, enter edit mode
      if (['text', 'button', 'table', 'list'].includes(block.type)) {
        setEditingBlock(block.id);
        return;
      }
      
      // For groups, drill down to first child
      if (block.type === 'group') {
        const children = blocksToUse.filter((b) => b.parentId === block.id);
        if (children.length > 0) {
          selectBlock(children[0].id);
        }
      }
    },
    [block.id, block.type, blocksToUse, selectBlock, setEditingBlock]
  );

  /**
   * Handle blur - exit editing mode when clicking away
   */
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // Only reset if the focus is moving outside this block
      const relatedTarget = e.relatedTarget as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;
      
      if (!currentTarget.contains(relatedTarget)) {
        if (isThisBlockEditing) {
          resetInteraction();
        }
      }
    },
    [isThisBlockEditing, resetInteraction]
  );

  // Don't render hidden blocks
  if (!block.isVisible) {
    return null;
  }

  /**
   * Determine drag/resize settings based on interaction mode (Phase 20)
   */
  const shouldDisableDragging = block.isLocked || isThisBlockEditing;
  const shouldEnableResizing = !block.isLocked && !isThisBlockEditing && isSelected;
  const isDragging = interactionMode === 'dragging';

  return (
    <Rnd
      size={{
        width: layout.width,
        height: layout.height === 'auto' ? 'auto' : layout.height,
      }}
      position={{
        x: layout.x,
        y: layout.y,
      }}
      onDragStart={handleDragStart}
      onDrag={(e, data) => {
        handleDrag(e, data);
        return;
      }}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      disableDragging={shouldDisableDragging}
      enableResizing={shouldEnableResizing ? {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      } : false}
      bounds="parent"
      minWidth={50}
      minHeight={24}
      style={{
        zIndex: computedZIndex,
      }}
      className={cn(
        "group",
        isDragging && "cursor-grabbing",
        isSelected && !isThisBlockEditing && !isDragging && "cursor-grab"
      )}
      // 8-point resize handles like Figma
      resizeHandleStyles={{
        top: { cursor: 'n-resize' },
        right: { cursor: 'e-resize' },
        bottom: { cursor: 's-resize' },
        left: { cursor: 'w-resize' },
        topRight: { cursor: 'ne-resize' },
        bottomRight: { cursor: 'se-resize' },
        bottomLeft: { cursor: 'sw-resize' },
        topLeft: { cursor: 'nw-resize' },
      }}
      resizeHandleComponent={
        isSelected && !isThisBlockEditing
          ? {
              topLeft: <ResizeHandle position="topLeft" />,
              topRight: <ResizeHandle position="topRight" />,
              bottomLeft: <ResizeHandle position="bottomLeft" />,
              bottomRight: <ResizeHandle position="bottomRight" />,
              top: <ResizeHandle position="top" />,
              right: <ResizeHandle position="right" />,
              bottom: <ResizeHandle position="bottom" />,
              left: <ResizeHandle position="left" />,
            }
          : undefined
      }
    >
      <div
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        className={cn(
          "w-full h-full relative rounded-sm transition-shadow duration-150",
          block.isLocked && "pointer-events-none"
        )}
        style={{
          backgroundColor: block.type === 'shape' ? 'transparent' : (block.styles.backgroundColor || '#ffffff'),
          opacity: parseFloat(block.styles.opacity || '1'),
          borderRadius: block.styles.borderRadius || '0px',
          border: block.styles.border || 'none',
          boxShadow: block.styles.boxShadow || 'none',
        }}
      >
        {/* Figma-style Selection Border */}
        {isSelected && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: isThisBlockEditing ? '2px solid #0d9488' : '1px solid #0d9488',
            }}
          />
        )}

        {/* Rotation Handle (future prep - extends from top center) */}
        {isSelected && !isDragging && !isThisBlockEditing && (
          <RotationHandle />
        )}

        {/* Hover Border (when not selected) */}
        {!isSelected && (
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              border: '1px solid rgba(13, 148, 136, 0.5)',
            }}
          />
        )}

        {/* Block Name Label (Figma-style tag above top-left corner) */}
        {isSelected && !isDragging && (
          <div
            className="absolute -top-6 left-0 flex items-center gap-1 pointer-events-none"
            style={{ zIndex: 100 }}
          >
            <div
              className="px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: isThisBlockEditing ? '#059669' : '#0d9488',
                color: 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                fontSize: '10px',
                lineHeight: '14px',
                borderRadius: '2px',
              }}
            >
              {block.name}{isThisBlockEditing ? ' (Editing)' : ''}
            </div>
          </div>
        )}

        {/* Block Content - pointer events based on editing state (Phase 20) */}
        <div 
          className={cn(
            "w-full h-full overflow-hidden",
            isThisBlockEditing ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <BlockContent 
            block={block} 
            isEditing={isThisBlockEditing} 
            allBlocks={blocksToUse}
            selectedBlockIds={selectedBlockIds}
          />
        </div>

        {/* Lock indicator */}
        {block.isLocked && (
          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500/90 flex items-center justify-center">
            <span className="text-white text-xs">🔒</span>
          </div>
        )}
      </div>
    </Rnd>
  );
}

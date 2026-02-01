/**
 * SmartGuides Component
 * Phase 8: Smart Alignment Guides
 * 
 * Renders visual alignment lines (red dashed) when dragging blocks
 * Shows guides when block edges/centers align with other blocks
 */

"use client";

import { useMemo } from "react";
import type { EditorBlock } from "@/types/editor";

/**
 * Snap threshold in pixels
 */
const SNAP_THRESHOLD = 5;

/**
 * Guide line types
 */
export interface GuideLine {
  type: 'vertical' | 'horizontal';
  position: number;  // x for vertical, y for horizontal
  start: number;     // start point (y for vertical, x for horizontal)
  end: number;       // end point
}

/**
 * Calculate snap guides between dragging block and other blocks
 */
export interface SnapResult {
  snapX: number | null;  // Snapped X position for the dragging block
  snapY: number | null;  // Snapped Y position for the dragging block
  guides: GuideLine[];   // Guide lines to render
}

interface BlockBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

/**
 * Get the bounding box of a block
 */
function getBlockBounds(block: EditorBlock): BlockBounds {
  const { x, y, width, height } = block.layout;
  const h = typeof height === 'number' ? height : 50; // Default for 'auto'
  
  return {
    id: block.id,
    left: x,
    right: x + width,
    top: y,
    bottom: y + h,
    centerX: x + width / 2,
    centerY: y + h / 2,
    width,
    height: h,
  };
}

/**
 * Calculate snap positions and guide lines
 */
export function calculateSnapping(
  draggingBlock: EditorBlock,
  dragX: number,
  dragY: number,
  otherBlocks: EditorBlock[]
): SnapResult {
  const guides: GuideLine[] = [];
  let snapX: number | null = null;
  let snapY: number | null = null;
  
  const dragBounds = getBlockBounds(draggingBlock);
  const dragWidth = dragBounds.width;
  const dragHeight = dragBounds.height;
  
  // Current position during drag
  const currentLeft = dragX;
  const currentRight = dragX + dragWidth;
  const currentTop = dragY;
  const currentBottom = dragY + dragHeight;
  const currentCenterX = dragX + dragWidth / 2;
  const currentCenterY = dragY + dragHeight / 2;
  
  // Cache other block bounds
  const otherBounds = otherBlocks
    .filter(b => b.id !== draggingBlock.id && b.isVisible)
    .map(getBlockBounds);
  
  // Track closest snaps
  let closestSnapX = Infinity;
  let closestSnapY = Infinity;
  
  for (const other of otherBounds) {
    // === VERTICAL ALIGNMENT (X axis) ===
    
    // Left to Left
    const leftToLeft = Math.abs(currentLeft - other.left);
    if (leftToLeft < SNAP_THRESHOLD && leftToLeft < closestSnapX) {
      closestSnapX = leftToLeft;
      snapX = other.left;
    }
    
    // Right to Right
    const rightToRight = Math.abs(currentRight - other.right);
    if (rightToRight < SNAP_THRESHOLD && rightToRight < closestSnapX) {
      closestSnapX = rightToRight;
      snapX = other.right - dragWidth;
    }
    
    // Left to Right
    const leftToRight = Math.abs(currentLeft - other.right);
    if (leftToRight < SNAP_THRESHOLD && leftToRight < closestSnapX) {
      closestSnapX = leftToRight;
      snapX = other.right;
    }
    
    // Right to Left
    const rightToLeft = Math.abs(currentRight - other.left);
    if (rightToLeft < SNAP_THRESHOLD && rightToLeft < closestSnapX) {
      closestSnapX = rightToLeft;
      snapX = other.left - dragWidth;
    }
    
    // Center to Center (horizontal)
    const centerToCenter = Math.abs(currentCenterX - other.centerX);
    if (centerToCenter < SNAP_THRESHOLD && centerToCenter < closestSnapX) {
      closestSnapX = centerToCenter;
      snapX = other.centerX - dragWidth / 2;
    }
    
    // === HORIZONTAL ALIGNMENT (Y axis) ===
    
    // Top to Top
    const topToTop = Math.abs(currentTop - other.top);
    if (topToTop < SNAP_THRESHOLD && topToTop < closestSnapY) {
      closestSnapY = topToTop;
      snapY = other.top;
    }
    
    // Bottom to Bottom
    const bottomToBottom = Math.abs(currentBottom - other.bottom);
    if (bottomToBottom < SNAP_THRESHOLD && bottomToBottom < closestSnapY) {
      closestSnapY = bottomToBottom;
      snapY = other.bottom - dragHeight;
    }
    
    // Top to Bottom
    const topToBottom = Math.abs(currentTop - other.bottom);
    if (topToBottom < SNAP_THRESHOLD && topToBottom < closestSnapY) {
      closestSnapY = topToBottom;
      snapY = other.bottom;
    }
    
    // Bottom to Top
    const bottomToTop = Math.abs(currentBottom - other.top);
    if (bottomToTop < SNAP_THRESHOLD && bottomToTop < closestSnapY) {
      closestSnapY = bottomToTop;
      snapY = other.top - dragHeight;
    }
    
    // Center to Center (vertical)
    const centerToCenterY = Math.abs(currentCenterY - other.centerY);
    if (centerToCenterY < SNAP_THRESHOLD && centerToCenterY < closestSnapY) {
      closestSnapY = centerToCenterY;
      snapY = other.centerY - dragHeight / 2;
    }
  }
  
  // Generate guide lines for snapped positions
  const finalX = snapX !== null ? snapX : dragX;
  const finalY = snapY !== null ? snapY : dragY;
  const finalRight = finalX + dragWidth;
  const finalBottom = finalY + dragHeight;
  const finalCenterX = finalX + dragWidth / 2;
  const finalCenterY = finalY + dragHeight / 2;
  
  for (const other of otherBounds) {
    // Vertical guides (for X alignment)
    if (snapX !== null) {
      // Left edge aligned
      if (Math.abs(finalX - other.left) < 1) {
        guides.push({
          type: 'vertical',
          position: other.left,
          start: Math.min(finalY, other.top),
          end: Math.max(finalBottom, other.bottom),
        });
      }
      // Right edge aligned
      if (Math.abs(finalRight - other.right) < 1) {
        guides.push({
          type: 'vertical',
          position: other.right,
          start: Math.min(finalY, other.top),
          end: Math.max(finalBottom, other.bottom),
        });
      }
      // Center aligned
      if (Math.abs(finalCenterX - other.centerX) < 1) {
        guides.push({
          type: 'vertical',
          position: other.centerX,
          start: Math.min(finalY, other.top),
          end: Math.max(finalBottom, other.bottom),
        });
      }
    }
    
    // Horizontal guides (for Y alignment)
    if (snapY !== null) {
      // Top edge aligned
      if (Math.abs(finalY - other.top) < 1) {
        guides.push({
          type: 'horizontal',
          position: other.top,
          start: Math.min(finalX, other.left),
          end: Math.max(finalRight, other.right),
        });
      }
      // Bottom edge aligned
      if (Math.abs(finalBottom - other.bottom) < 1) {
        guides.push({
          type: 'horizontal',
          position: other.bottom,
          start: Math.min(finalX, other.left),
          end: Math.max(finalRight, other.right),
        });
      }
      // Center aligned
      if (Math.abs(finalCenterY - other.centerY) < 1) {
        guides.push({
          type: 'horizontal',
          position: other.centerY,
          start: Math.min(finalX, other.left),
          end: Math.max(finalRight, other.right),
        });
      }
    }
  }
  
  // Deduplicate guides
  const uniqueGuides = guides.filter((guide, index, self) =>
    index === self.findIndex(g => 
      g.type === guide.type && 
      Math.abs(g.position - guide.position) < 1
    )
  );
  
  return { snapX, snapY, guides: uniqueGuides };
}

interface SmartGuidesProps {
  guides: GuideLine[];
}

/**
 * SmartGuides Component - Renders alignment guide lines
 */
export function SmartGuides({ guides }: SmartGuidesProps) {
  if (guides.length === 0) return null;
  
  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 9999 }}
    >
      <defs>
        <pattern
          id="dashPattern"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
        >
          <line
            x1="0"
            y1="0"
            x2="8"
            y2="0"
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </pattern>
      </defs>
      
      {guides.map((guide, index) => (
        <line
          key={`${guide.type}-${guide.position}-${index}`}
          x1={guide.type === 'vertical' ? guide.position : guide.start}
          y1={guide.type === 'vertical' ? guide.start : guide.position}
          x2={guide.type === 'vertical' ? guide.position : guide.end}
          y2={guide.type === 'vertical' ? guide.end : guide.position}
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
    </svg>
  );
}

/**
 * Hook to get cached block bounds for performance
 */
export function useBlockBoundsCache(blocks: EditorBlock[], excludeIds: string[]) {
  return useMemo(() => {
    return blocks
      .filter(b => !excludeIds.includes(b.id) && b.isVisible)
      .map(getBlockBounds);
  }, [blocks, excludeIds]);
}

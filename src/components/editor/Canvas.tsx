/**
 * Canvas Component - "The Infinite Artboard"
 * Phase 20: Deep Core Stability Fix
 * 
 * Figma-style infinite canvas with pan & zoom
 * Supports: Wheel zoom, Space+drag pan, Middle-click pan
 * Includes: Rulers, Cursor management, Smart guides, Resizable artboard
 * 
 * Selection Logic:
 * - Single Click: If part of a Group, select the Group (Parent)
 * - Double Click: Select the Child
 * - Shift + Click: Add to multi-selection
 * - Background Click: Deselect all and reset interaction
 */

"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { 
  useEditorStore, 
  useBlocks, 
  useSelectedBlockIds, 
  useCanvasSettings, 
  useViewport,
} from "@/store/useEditorStore";
import { FreeBlock } from "./FreeBlock";
import { SmartGuides, GuideLine } from "./SmartGuides";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { Rulers, RULER_THICKNESS } from "./Rulers";
import { useHotkeys } from "@/hooks/useHotkeys";
import { cn } from "@/lib/utils";

/**
 * Dot grid pattern for visual alignment
 */
const GRID_SIZE = 20; // pixels between dots

interface CanvasProps {
  showRulers?: boolean;
}

export function Canvas({ showRulers = true }: CanvasProps) {
  const blocks = useBlocks();
  const selectedBlockIds = useSelectedBlockIds();
  const canvasSettings = useCanvasSettings();
  const viewport = useViewport();
  // interactionMode is available via useInteractionMode() if needed for cursor changes
  const { selectBlock, setViewport, resizeCanvasWithConstraints, resetInteraction } = useEditorStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Smart guides state
  const [guides, setGuides] = useState<GuideLine[]>([]);
  
  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Resize handle state (Phase 14)
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 });

  // Initialize keyboard shortcuts
  useHotkeys();

  // Handle Space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        // Don't activate if typing in input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // Handle wheel zoom with native event listener (passive: false to allow preventDefault)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Zoom with Ctrl/Cmd + scroll or pinch
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY * -0.001;
        const newZoom = Math.min(Math.max(viewport.zoom + delta, 0.1), 5);
        setViewport({ zoom: newZoom });
      }
    };

    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [viewport.zoom, setViewport]);

  // Handle pan with mouse
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse button or Space + Left click
      if (e.button === 1 || (isSpacePressed && e.button === 0)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      }
    },
    [isSpacePressed, viewport.x, viewport.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const newX = e.clientX - panStart.x;
        const newY = e.clientY - panStart.y;
        setViewport({ x: newX, y: newY });
      }
    },
    [isPanning, panStart, setViewport]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  /**
   * Background Click Handler (Phase 20)
   * Clicking the canvas background deselects all and resets interaction state
   */
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) return;
      
      // Only trigger on actual canvas/background clicks
      if (e.target === e.currentTarget || e.target === canvasRef.current) {
        // Reset all interaction state
        resetInteraction();
        selectBlock(null);
      }
    },
    [selectBlock, isPanning, resetInteraction]
  );
  
  // Handle guide updates from dragging blocks
  const handleDragUpdate = useCallback((newGuides: GuideLine[]) => {
    setGuides(newGuides);
  }, []);
  
  const handleDragEnd = useCallback(() => {
    setGuides([]);
  }, []);

  // Phase 14: Infinite Height - Calculate dynamic paper height based on content
  const contentHeight = useMemo(() => {
    if (blocks.length === 0) return 0;
    return Math.max(...blocks.map(b => b.layout.y + (typeof b.layout.height === 'number' ? b.layout.height : 100)));
  }, [blocks]);
  
  const canvasWidth = canvasSettings.width;
  const canvasHeight = Math.max(800, contentHeight + 100); // Minimum 800px, grows with content

  // Phase 14: Resize handle handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, width: canvasSettings.width });
  }, [canvasSettings.width]);

  // Global mouse move/up for resize
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const delta = (e.clientX - resizeStart.x) / viewport.zoom;
      const newWidth = Math.max(280, Math.min(1200, Math.round(resizeStart.width + delta)));
      resizeCanvasWithConstraints(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, viewport.zoom, resizeCanvasWithConstraints]);

  // Offset for rulers
  const rulerOffset = showRulers ? RULER_THICKNESS : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-hidden relative",
        isSpacePressed && !isPanning && "cursor-grab",
        isPanning && "cursor-grabbing"
      )}
      style={{
        backgroundColor: "#e5e5e5",
        backgroundImage: `radial-gradient(circle, #ccc 1px, transparent 1px)`,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Rulers Layer */}
      {showRulers && <Rulers showRulers={showRulers} />}

      {/* Transform Container for Pan & Zoom */}
      <div
        className="absolute"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          // Center the canvas initially, accounting for rulers
          left: `calc(50% + ${rulerOffset / 2}px)`,
          top: `${32 + rulerOffset}px`,
          marginLeft: `-${canvasWidth / 2}px`,
        }}
      >
        {/* The Artboard (White Paper) wrapped in Context Menu */}
        <CanvasContextMenu>
          <div
            ref={canvasRef}
            className={cn(
              "relative bg-white shadow-xl rounded-sm",
              isSpacePressed && "pointer-events-none",
              isResizing && "select-none"
            )}
            style={{
              width: `${canvasWidth}px`,
              minHeight: `${canvasHeight}px`,
              backgroundColor: canvasSettings.backgroundColor,
            }}
            onClick={handleCanvasClick}
          >
            {/* Phase 14: Right Edge Resize Handle */}
            <div
              className={cn(
                "absolute top-0 right-0 w-2 h-full cursor-ew-resize group z-50",
                "hover:bg-primary/20 transition-colors",
                isResizing && "bg-primary/30"
              )}
              style={{ transform: 'translateX(50%)' }}
              onMouseDown={handleResizeStart}
            >
              {/* Visual indicator line */}
              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "w-1 h-12 rounded-full bg-slate-300 group-hover:bg-primary transition-colors",
                isResizing && "bg-primary"
              )} />
            </div>
            
            {/* Grid overlay on the artboard */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e0e0e0 1px, transparent 1px),
                  linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
                `,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              }}
            />

            {/* Empty State */}
            {blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-1">
                    Start Designing
                  </h3>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Click a tool in the toolbar above to add blocks.
                    <br />
                    Scroll to zoom • Space+drag to pan
                  </p>
                </div>
              </div>
            )}

            {/* Render Root-Level Blocks Only (Phase 15: Hierarchy Engine) */}
            {/* Children of groups are rendered by their parent FreeBlock */}
            {blocks
              .filter((block) => !block.parentId)
              .map((block) => (
                <FreeBlock
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockIds.includes(block.id)}
                  onDragUpdate={handleDragUpdate}
                  onDragEnd={handleDragEnd}
                  allBlocks={blocks}
                  selectedBlockIds={selectedBlockIds}
                />
              ))}
            
            {/* Smart Alignment Guides */}
            <SmartGuides guides={guides} />
          </div>
        </CanvasContextMenu>
      </div>

      {/* Canvas Info Footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/80 text-white text-xs rounded-full backdrop-blur-sm flex items-center gap-2">
        <span className={cn(isResizing && "text-primary font-medium")}>{canvasWidth}px</span>
        <span className="text-slate-400">×</span>
        <span>{canvasHeight}px</span>
        <span className="text-slate-400">•</span>
        <span className="font-mono">{Math.round(viewport.zoom * 100)}%</span>
        {isSpacePressed && (
          <>
            <span className="text-slate-400">•</span>
            <span className="text-blue-400">Pan Mode</span>
          </>
        )}
        {isResizing && (
          <>
            <span className="text-slate-400">•</span>
            <span className="text-primary">Resizing</span>
          </>
        )}
      </div>
    </div>
  );
}

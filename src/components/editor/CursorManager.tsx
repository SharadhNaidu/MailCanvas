/**
 * CursorManager Component - "The Tactile Engine"
 * Phase 10: Tactile Interaction Upgrade
 * 
 * Centralized cursor management based on editor state
 * Provides visual feedback for different interaction modes
 * Includes mouse position tracking for rulers
 */

"use client";

import { ReactNode, useEffect, useState, useCallback, createContext, useContext, useRef } from "react";

/**
 * Cursor modes supported by the editor
 */
export type CursorMode = 
  | 'default'      // Arrow cursor
  | 'grab'         // Open hand (Space held)
  | 'grabbing'     // Closed hand (Panning)
  | 'move'         // Move cursor (Dragging block)
  | 'text'         // I-beam (Hovering text)
  | 'crosshair'    // Precision (Drawing mode)
  | 'pointer'      // Link/Button hover
  | 'not-allowed'  // Disabled/Locked
  | 'nwse-resize'  // NW-SE resize
  | 'nesw-resize'  // NE-SW resize
  | 'ns-resize'    // N-S resize
  | 'ew-resize';   // E-W resize

/**
 * Mouse position in screen coordinates
 */
interface MousePosition {
  x: number;
  y: number;
}

/**
 * Cursor context for sharing state across components
 */
interface CursorContextType {
  cursorMode: CursorMode;
  setCursorMode: (mode: CursorMode) => void;
  isSpacePressed: boolean;
  setIsSpacePressed: (pressed: boolean) => void;
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  hoveringHandle: string | null;
  setHoveringHandle: (handle: string | null) => void;
  mousePosition: MousePosition;
}

const CursorContext = createContext<CursorContextType | null>(null);

/**
 * Hook to use cursor context
 */
export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorManager');
  }
  return context;
}

/**
 * Map cursor mode to CSS cursor value
 */
function getCursorStyle(mode: CursorMode): string {
  switch (mode) {
    case 'grab':
      return 'grab';
    case 'grabbing':
      return 'grabbing';
    case 'move':
      return 'move';
    case 'text':
      return 'text';
    case 'crosshair':
      return 'crosshair';
    case 'pointer':
      return 'pointer';
    case 'not-allowed':
      return 'not-allowed';
    case 'nwse-resize':
      return 'nwse-resize';
    case 'nesw-resize':
      return 'nesw-resize';
    case 'ns-resize':
      return 'ns-resize';
    case 'ew-resize':
      return 'ew-resize';
    default:
      return 'default';
  }
}

/**
 * Map handle position to cursor mode
 */
function getHandleCursor(handle: string | null): CursorMode | null {
  if (!handle) return null;
  switch (handle) {
    case 'topLeft':
    case 'bottomRight':
      return 'nwse-resize';
    case 'topRight':
    case 'bottomLeft':
      return 'nesw-resize';
    case 'top':
    case 'bottom':
      return 'ns-resize';
    case 'left':
    case 'right':
      return 'ew-resize';
    default:
      return null;
  }
}

interface CursorManagerProps {
  children: ReactNode;
}

export function CursorManager({ children }: CursorManagerProps) {
  const [cursorMode, setCursorModeState] = useState<CursorMode>('default');
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveringHandle, setHoveringHandle] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine the effective cursor based on state priority
  const getEffectiveCursor = useCallback((): CursorMode => {
    // Priority order: Panning > Handle hover > Space pressed > Dragging > Default
    if (isPanning) return 'grabbing';
    if (isSpacePressed) return 'grab';
    
    const handleCursor = getHandleCursor(hoveringHandle);
    if (handleCursor) return handleCursor;
    
    if (isDragging) return 'move';
    return cursorMode;
  }, [isPanning, isSpacePressed, isDragging, hoveringHandle, cursorMode]);

  const setCursorMode = useCallback((mode: CursorMode) => {
    setCursorModeState(mode);
  }, []);

  // Handle space key globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
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
  }, []);

  // Track mouse position for rulers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const effectiveCursor = getEffectiveCursor();

  return (
    <CursorContext.Provider
      value={{
        cursorMode,
        setCursorMode,
        isSpacePressed,
        setIsSpacePressed,
        isPanning,
        setIsPanning,
        isDragging,
        setIsDragging,
        hoveringHandle,
        setHoveringHandle,
        mousePosition,
      }}
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ cursor: getCursorStyle(effectiveCursor) }}
      >
        {children}
      </div>
    </CursorContext.Provider>
  );
}

/**
 * Export cursor mode type for external use
 */
export type { CursorMode as CursorModeType };

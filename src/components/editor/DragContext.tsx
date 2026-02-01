/**
 * DragContext
 * Phase 8: Smart Guides Support
 * 
 * Provides real-time drag position for smart guide calculations
 */

"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { EditorBlock } from "@/types/editor";
import type { GuideLine } from "./SmartGuides";

interface DragState {
  isDragging: boolean;
  draggingBlock: EditorBlock | null;
  currentX: number;
  currentY: number;
  guides: GuideLine[];
}

interface DragContextValue {
  dragState: DragState;
  startDrag: (block: EditorBlock, x: number, y: number) => void;
  updateDrag: (x: number, y: number, guides: GuideLine[]) => void;
  endDrag: () => void;
}

const initialDragState: DragState = {
  isDragging: false,
  draggingBlock: null,
  currentX: 0,
  currentY: 0,
  guides: [],
};

const DragContext = createContext<DragContextValue | null>(null);

export function DragProvider({ children }: { children: ReactNode }) {
  const [dragState, setDragState] = useState<DragState>(initialDragState);

  const startDrag = useCallback((block: EditorBlock, x: number, y: number) => {
    setDragState({
      isDragging: true,
      draggingBlock: block,
      currentX: x,
      currentY: y,
      guides: [],
    });
  }, []);

  const updateDrag = useCallback((x: number, y: number, guides: GuideLine[]) => {
    setDragState((prev) => ({
      ...prev,
      currentX: x,
      currentY: y,
      guides,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  return (
    <DragContext.Provider value={{ dragState, startDrag, updateDrag, endDrag }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDrag must be used within a DragProvider");
  }
  return context;
}

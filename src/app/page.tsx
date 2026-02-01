/**
 * MailCanvas Studio - Main Page
 * Phase 10: Tactile Interaction Upgrade
 * 
 * PowerPoint x Figma hybrid layout with cursor management
 */

"use client";

import { TopToolbar, LeftSidebar, Canvas, RightSidebar, CursorManager } from "@/components/editor";
import { useCanvasSettings } from "@/store/useEditorStore";

export default function Home() {
  const canvasSettings = useCanvasSettings();

  return (
    <CursorManager>
      <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        {/* Header Row - The Ribbon (PowerPoint style) */}
        <TopToolbar />
        
        {/* Main Row - Workspace (Figma style) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Layers Panel */}
          <LeftSidebar />
          
          {/* Center - Canvas / Infinite Board */}
          <Canvas showRulers={canvasSettings.showRulers} />
          
          {/* Right Sidebar - Properties Panel */}
          <RightSidebar />
        </div>
      </div>
    </CursorManager>
  );
}

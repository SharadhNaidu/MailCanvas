/**
 * RightSidebar Component - "Smart Properties Panel"
 * Phase 4: Full property editing with PropertyController
 * Phase 18: Shows Variables Panel when no block selected
 * 
 * Figma-style dynamic properties panel
 */

"use client";

import { Settings2, Palette } from "lucide-react";
import { useSelectedBlock } from "@/store/useEditorStore";
import { PropertyPanel } from "./PropertyPanel";
import { VariablesPanel } from "./variables/VariablesPanel";

export function RightSidebar() {
  const selectedBlock = useSelectedBlock();

  return (
    <aside className="w-[280px] bg-white border-l border-slate-200 flex flex-col shrink-0">
      {/* Header */}
      <div className="h-10 px-3 flex items-center gap-2 border-b border-slate-100">
        {selectedBlock ? (
          <>
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Properties
            </span>
            <span className="ml-auto text-xs text-primary font-medium capitalize">
              {selectedBlock.type}
            </span>
          </>
        ) : (
          <>
            <Palette className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Variables
            </span>
          </>
        )}
      </div>
      
      {/* Content - Show PropertyPanel or VariablesPanel */}
      <div className="flex-1 overflow-hidden">
        {selectedBlock ? <PropertyPanel /> : <VariablesPanel />}
      </div>
      
      {/* Footer */}
      <div className="h-10 px-3 flex items-center border-t border-slate-100">
        <span className="text-xs text-slate-400">
          {selectedBlock ? selectedBlock.name : "Global design tokens"}
        </span>
      </div>
    </aside>
  );
}

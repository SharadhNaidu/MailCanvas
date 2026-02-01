/**
 * LeftSidebar Component - "Layers & Assets Panel"
 * Phase 3: Studio Interface
 * Phase 16: Professional Layers Tree
 * Phase 17: Component & Asset Library with Tabs
 * 
 * Figma-style panel with tabs for Layers and Assets
 */

"use client";

import { Layers, Package } from "lucide-react";
import { useBlocks, useAssets } from "@/store/useEditorStore";
import { LayerItem } from "./layers/LayerItem";
import { AssetPanel } from "./assets/AssetPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LeftSidebar() {
  const blocks = useBlocks();
  const assets = useAssets();
  
  // Only render root-level blocks (blocks without a parent)
  const rootBlocks = blocks.filter((block) => !block.parentId);
  // Count root assets (not children)
  const rootAssetCount = assets.filter((a) => !a.parentId).length;

  return (
    <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col shrink-0">
      <Tabs defaultValue="layers" className="flex flex-col h-full">
        {/* Tab Triggers */}
        <TabsList className="h-10 w-full grid grid-cols-2 bg-slate-50 border-b border-slate-200 rounded-none p-0">
          <TabsTrigger 
            value="layers" 
            className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary flex items-center gap-1.5 text-xs"
          >
            <Layers className="h-3.5 w-3.5" />
            Layers
            <span className="text-[10px] text-slate-400 ml-0.5">{blocks.length}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="assets" 
            className="h-full rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary flex items-center gap-1.5 text-xs"
          >
            <Package className="h-3.5 w-3.5" />
            Assets
            {rootAssetCount > 0 && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {rootAssetCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Layers Tab */}
        <TabsContent value="layers" className="flex-1 overflow-hidden m-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-2">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Layers className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">
                  No layers yet
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Add blocks from the toolbar
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {/* Render root blocks in reverse order (top layer first, like Figma) */}
                {[...rootBlocks].reverse().map((block) => (
                  <LayerItem 
                    key={block.id} 
                    block={block} 
                    allBlocks={blocks}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Footer - Quick Stats */}
          <div className="h-9 px-3 flex items-center gap-4 border-t border-slate-100 text-xs text-slate-400 shrink-0">
            <span>{blocks.filter(b => b.isVisible).length} visible</span>
            <span>{blocks.filter(b => b.isLocked).length} locked</span>
          </div>
        </TabsContent>
        
        {/* Assets Tab */}
        <TabsContent value="assets" className="flex-1 overflow-y-auto m-0">
          <AssetPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}

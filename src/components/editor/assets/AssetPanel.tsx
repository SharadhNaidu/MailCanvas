/**
 * AssetPanel Component - Phase 17: Component & Asset Library
 * 
 * Grid display of saved components with click-to-add functionality.
 */

"use client";

import { Package, Trash2 } from "lucide-react";
import { useAssets, useEditorStore } from "@/store/useEditorStore";
import { BlockPreview } from "./BlockPreview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AssetPanel() {
  const assets = useAssets();
  const { addAssetToCanvas, removeAsset } = useEditorStore();
  
  // Filter to only show root-level assets (not children of groups)
  const rootAssets = assets.filter((asset) => !asset.parentId);

  if (rootAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <Package className="h-10 w-10 text-slate-200 mb-3" />
        <p className="text-xs text-slate-500 font-medium">
          No components yet
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Select a block and press
        </p>
        <kbd className="mt-1 px-2 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-600">
          Ctrl + Alt + K
        </kbd>
        <p className="text-xs text-slate-400 mt-2">
          to save as component
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-2">
        {rootAssets.map((asset) => (
          <div
            key={asset.id}
            className={cn(
              "group relative flex flex-col rounded-lg border border-slate-200",
              "bg-slate-50 hover:bg-slate-100 hover:border-primary/30",
              "cursor-pointer transition-all duration-150",
              "overflow-hidden"
            )}
            onClick={() => addAssetToCanvas(asset.id)}
            title={`Click to add "${asset.name}" to canvas`}
          >
            {/* Preview Container */}
            <div className="flex items-center justify-center p-2 min-h-[60px]">
              <BlockPreview block={asset} scale={0.35} />
            </div>
            
            {/* Asset Name */}
            <div className="px-2 py-1.5 border-t border-slate-200 bg-white">
              <p className="text-[10px] text-slate-600 font-medium truncate">
                {asset.name.replace(' (Component)', '')}
              </p>
              <p className="text-[9px] text-slate-400 capitalize">
                {asset.type}
              </p>
            </div>

            {/* Delete Button - Shows on hover */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute top-1 right-1 h-5 w-5 p-0",
                "opacity-0 group-hover:opacity-100",
                "bg-white/80 hover:bg-destructive hover:text-white",
                "transition-opacity"
              )}
              onClick={(e) => {
                e.stopPropagation();
                removeAsset(asset.id);
              }}
              title="Remove component"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

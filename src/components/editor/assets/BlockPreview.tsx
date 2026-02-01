/**
 * BlockPreview Component - Phase 17: Component & Asset Library
 * 
 * Renders a miniature preview of a block/component without drag handles.
 * Uses CSS transform scale for perfect miniaturization.
 */

"use client";

import type { EditorBlock } from "@/types/editor";
import { useAssets } from "@/store/useEditorStore";
import { TextBlock } from "../blocks/TextBlock";
import { ImageBlock } from "../blocks/ImageBlock";
import { ButtonBlock } from "../blocks/ButtonBlock";
import { ShapeBlock } from "../blocks/ShapeBlock";
import { TableBlock } from "../blocks/TableBlock";
import { ListBlock } from "../blocks/ListBlock";
import { SocialBlock } from "../SocialBlock";
import {
  Minus,
  Folder,
} from "lucide-react";

interface BlockPreviewProps {
  block: EditorBlock;
  /** Scale factor for the preview (default 0.4) */
  scale?: number;
}

/**
 * Preview Content Renderer - Renders block content without wrappers
 */
function PreviewContent({ 
  block,
  allAssets,
}: { 
  block: EditorBlock;
  allAssets: EditorBlock[];
}) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} isEditing={false} />;

    case 'image':
      return <ImageBlock block={block} />;

    case 'button':
      return <ButtonBlock block={block} />;

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
      return <TableBlock block={block} />;

    case 'list':
      return <ListBlock block={block} />;

    case 'group':
      // Render group children in preview
      const children = allAssets.filter((a) => a.parentId === block.id);
      return (
        <div className="relative w-full h-full bg-slate-50/50 border border-dashed border-slate-300 rounded">
          {children.length > 0 ? (
            children.map((child) => (
              <div
                key={child.id}
                className="absolute"
                style={{
                  left: child.layout.x,
                  top: child.layout.y,
                  width: child.layout.width,
                  height: child.layout.height === 'auto' ? 'auto' : child.layout.height,
                }}
              >
                <PreviewContent block={child} allAssets={allAssets} />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <Folder className="w-8 h-8 text-slate-300" />
            </div>
          )}
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

export function BlockPreview({ block, scale = 0.4 }: BlockPreviewProps) {
  const allAssets = useAssets();
  
  // Calculate the scaled container size
  const containerWidth = block.layout.width * scale;
  const containerHeight = typeof block.layout.height === 'number' 
    ? block.layout.height * scale 
    : 60; // Default height for 'auto' height blocks

  return (
    <div 
      className="overflow-hidden rounded border border-slate-200 bg-white"
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      <div
        style={{
          width: block.layout.width,
          height: typeof block.layout.height === 'number' ? block.layout.height : 'auto',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <PreviewContent block={block} allAssets={allAssets} />
      </div>
    </div>
  );
}

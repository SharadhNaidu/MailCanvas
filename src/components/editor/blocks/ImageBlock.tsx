/**
 * ImageBlock Component
 * Phase 4: Image rendering with URL editing
 */

"use client";

import type { EditorBlock } from "@/types/editor";

interface ImageBlockProps {
  block: EditorBlock;
}

export function ImageBlock({ block }: ImageBlockProps) {
  const styles = block.styles;

  return (
    <div style={{ padding: styles.padding }}>
      <img 
        src={block.content} 
        alt={block.name}
        className="w-full h-auto rounded"
        style={{
          maxWidth: styles.maxWidth,
          objectFit: styles.objectFit as React.CSSProperties['objectFit'],
          borderRadius: styles.borderRadius,
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/600x200/e2e8f0/64748b?text=Image+Not+Found';
        }}
      />
    </div>
  );
}

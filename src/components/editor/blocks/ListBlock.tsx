/**
 * ListBlock Component
 * Phase 20: Deep Core Stability Fix
 * 
 * Renders an editable list with:
 * - Configurable markers (disc, decimal, square)
 * - Editable list items (only when in editing mode)
 * - Configurable gap between items
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditorStore, useVariables, resolveStyleValue } from "@/store/useEditorStore";
import type { EditorBlock, ListData } from "@/types/editor";
import { DEFAULT_LIST_DATA } from "@/types/editor";

interface ListBlockProps {
  block: EditorBlock;
  isEditing?: boolean;
}

export function ListBlock({ block, isEditing }: ListBlockProps) {
  const { updateBlock } = useEditorStore();
  const variables = useVariables();
  const styles = block.styles;
  const listRef = useRef<HTMLUListElement | HTMLOListElement>(null);
  
  // Get list data with defaults
  const listData: ListData = block.listData || DEFAULT_LIST_DATA;
  const { items, style, gap } = listData;
  
  // Resolve variable references for colors
  const resolvedTextColor = resolveStyleValue(styles.color, variables) || '#1e293b';

  // Focus first item when entering edit mode
  useEffect(() => {
    if (isEditing && listRef.current) {
      const firstItem = listRef.current.querySelector('[contenteditable="true"]') as HTMLElement;
      if (firstItem) {
        firstItem.focus();
      }
    }
  }, [isEditing]);

  // Update a specific item
  const updateItem = useCallback(
    (index: number, value: string) => {
      const newItems = items.map((item, i) => (i === index ? value : item));
      
      updateBlock(block.id, {
        listData: {
          ...listData,
          items: newItems,
        },
      });
    },
    [block.id, items, listData, updateBlock]
  );

  // Handle item blur to save content
  const handleItemBlur = useCallback(
    (e: React.FocusEvent<HTMLSpanElement>, index: number) => {
      const newValue = e.currentTarget.innerText;
      if (newValue !== items[index]) {
        updateItem(index, newValue);
      }
    },
    [items, updateItem]
  );

  // Prevent drag when editing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  // Handle keyboard shortcuts while editing
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  // Determine list tag based on style
  const ListTag = style === 'decimal' ? 'ol' : 'ul';

  // Map style to CSS list-style-type
  const listStyleType = {
    disc: 'disc',
    decimal: 'decimal',
    square: 'square',
  }[style];

  const listStyles: React.CSSProperties = {
    listStyleType,
    paddingLeft: '24px',
    margin: 0,
    color: resolvedTextColor,
    fontSize: styles.fontSize || '14px',
    fontFamily: styles.fontFamily || 'Inter, sans-serif',
    lineHeight: styles.lineHeight || '1.5',
  };

  const itemStyles: React.CSSProperties = {
    marginBottom: `${gap}px`,
    paddingLeft: '4px',
  };

  return (
    <div className="w-full h-full" style={{ padding: styles.padding || '8px' }}>
      <ListTag ref={listRef as React.RefObject<HTMLUListElement & HTMLOListElement>} style={listStyles}>
        {items.map((item, index) => (
          <li key={index} style={index === items.length - 1 ? { ...itemStyles, marginBottom: 0 } : itemStyles}>
            <span
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleItemBlur(e, index)}
              onMouseDown={handleMouseDown}
              onKeyDown={handleKeyDown}
              className="outline-none cursor-text focus:bg-primary/5 transition-colors inline-block min-w-[20px]"
              style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
            >
              {item}
            </span>
          </li>
        ))}
      </ListTag>
    </div>
  );
}

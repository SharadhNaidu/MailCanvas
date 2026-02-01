/**
 * TextBlock Component
 * Phase 20: Deep Core Stability Fix
 * 
 * Supports two modes:
 * - Auto Width: Box grows as you type (inline-block, nowrap)
 * - Fixed Width: Text wraps within fixed container
 * 
 * Uses ref-based content to prevent cursor jumping on re-render.
 * Only updates store on blur, not on every keystroke.
 */

"use client";

import { useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { useEditorStore, useVariables, resolveStyleValue } from "@/store/useEditorStore";
import type { EditorBlock } from "@/types/editor";

interface TextBlockProps {
  block: EditorBlock;
  isEditing?: boolean;
}

export function TextBlock({ block, isEditing }: TextBlockProps) {
  const { updateBlock, updateBlockLayout } = useEditorStore();
  const variables = useVariables();
  const contentRef = useRef<HTMLDivElement>(null);
  // Store content in a ref to prevent re-renders causing cursor jumps
  const contentValueRef = useRef<string>(block.content);
  const styles = block.styles;
  
  // Resolve variable references for colors
  const resolvedColor = resolveStyleValue(styles.color, variables);
  
  // Determine text sizing mode
  const isAutoWidth = styles.textAutoSize === 'auto';

  // Sync content ref when block content changes externally (e.g., undo/redo)
  useEffect(() => {
    // Only update if the external content is different from our ref
    if (block.content !== contentValueRef.current) {
      contentValueRef.current = block.content;
      if (contentRef.current && contentRef.current.innerText !== block.content) {
        // Save cursor position
        const selection = window.getSelection();
        const hadFocus = document.activeElement === contentRef.current;
        
        // Update content
        contentRef.current.innerText = block.content;
        
        // Restore focus if we had it
        if (hadFocus && selection) {
          contentRef.current.focus();
          // Move cursor to end
          const range = document.createRange();
          range.selectNodeContents(contentRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }, [block.content]);

  // Focus the element when entering edit mode
  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
      // Move cursor to end
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isEditing]);

  // Measure and update width in auto mode
  const measureAndUpdateWidth = useCallback(() => {
    if (!isAutoWidth || !contentRef.current) return;
    
    // Get the actual content width
    const scrollWidth = contentRef.current.scrollWidth;
    const scrollHeight = contentRef.current.scrollHeight;
    
    // Add some padding for the cursor
    const newWidth = Math.max(scrollWidth + 4, 50);
    const newHeight = Math.max(scrollHeight, 24);
    
    // Only update if significantly different (avoid infinite loops)
    if (Math.abs(newWidth - block.layout.width) > 2) {
      updateBlockLayout(block.id, { 
        width: newWidth,
        height: newHeight
      });
    }
  }, [isAutoWidth, block.id, block.layout.width, updateBlockLayout]);

  // Measure on mount in auto mode
  useLayoutEffect(() => {
    if (isAutoWidth) {
      measureAndUpdateWidth();
    }
  }, [isAutoWidth, measureAndUpdateWidth]);

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      // Update ref value (not state - to prevent re-renders)
      contentValueRef.current = contentRef.current.innerText;
      
      // Real-time width update in auto mode only
      if (isAutoWidth) {
        requestAnimationFrame(measureAndUpdateWidth);
      }
    }
  }, [isAutoWidth, measureAndUpdateWidth]);

  // Save to store only on blur
  const handleBlur = useCallback(() => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerText;
      if (newContent !== block.content) {
        updateBlock(block.id, { content: newContent });
      }
    }
  }, [block.id, block.content, updateBlock]);

  // Prevent drag and allow text selection when editing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
    }
  }, [isEditing]);

  // Handle keyboard shortcuts while editing
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent keyboard shortcuts from bubbling while editing
    if (isEditing) {
      // Allow common text editing shortcuts
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
        e.stopPropagation(); // Let browser handle it
        return;
      }
      // Stop other shortcuts from propagating
      e.stopPropagation();
    }
  }, [isEditing]);

  // Common text styles
  const textStyles: React.CSSProperties = {
    fontSize: styles.fontSize,
    color: resolvedColor,
    textAlign: styles.textAlign as React.CSSProperties['textAlign'],
    padding: styles.padding,
    lineHeight: styles.lineHeight,
    fontFamily: styles.fontFamily,
    fontWeight: styles.fontWeight as React.CSSProperties['fontWeight'],
    letterSpacing: styles.letterSpacing,
  };

  // Auto Width Mode - text grows horizontally
  if (isAutoWidth) {
    return (
      <div
        ref={contentRef}
        contentEditable={isEditing && !block.isLocked}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        className="outline-none focus:bg-primary/5 transition-colors cursor-text"
        style={{
          ...textStyles,
          display: 'inline-block',
          whiteSpace: 'nowrap',
          minWidth: '50px',
          width: 'max-content',
          pointerEvents: isEditing ? 'auto' : 'none',
        }}
      >
        {block.content}
      </div>
    );
  }

  // Fixed Width Mode - text wraps within container
  return (
    <div
      ref={contentRef}
      contentEditable={isEditing && !block.isLocked}
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className="outline-none focus:bg-primary/5 transition-colors cursor-text w-full h-full"
      style={{
        ...textStyles,
        width: '100%',
        pointerEvents: isEditing ? 'auto' : 'none',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    >
      {block.content}
    </div>
  );
}

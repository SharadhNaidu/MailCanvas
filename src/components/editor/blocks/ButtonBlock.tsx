/**
 * ButtonBlock Component
 * Phase 20: Deep Core Stability Fix
 * Supports optional link URL for email CTAs
 * Editable text content when in editing mode
 */

"use client";

import { useCallback, useRef, useEffect } from "react";
import type { EditorBlock } from "@/types/editor";
import { useEditorStore, useVariables, resolveStyleValue } from "@/store/useEditorStore";

interface ButtonBlockProps {
  block: EditorBlock;
  isEditing?: boolean;
}

export function ButtonBlock({ block, isEditing }: ButtonBlockProps) {
  const { updateBlock } = useEditorStore();
  const variables = useVariables();
  const styles = block.styles;
  const hasLink = block.link && block.link.trim() !== '';
  const contentRef = useRef<HTMLSpanElement>(null);

  // Resolve variable references for colors
  const backgroundColor = resolveStyleValue(styles.backgroundColor, variables);
  const color = resolveStyleValue(styles.color, variables);

  // Focus when entering edit mode
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

  // Save content on blur
  const handleBlur = useCallback(() => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerText;
      if (newContent !== block.content) {
        updateBlock(block.id, { content: newContent });
      }
    }
  }, [block.id, block.content, updateBlock]);

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

  const buttonStyles: React.CSSProperties = {
    backgroundColor,
    color,
    padding: styles.padding,
    borderRadius: styles.borderRadius,
    fontSize: styles.fontSize,
    fontFamily: styles.fontFamily,
    fontWeight: styles.fontWeight as React.CSSProperties['fontWeight'],
    lineHeight: styles.lineHeight,
    letterSpacing: styles.letterSpacing,
    textAlign: styles.textAlign as React.CSSProperties['textAlign'],
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: styles.textAlign === 'left' ? 'flex-start' : styles.textAlign === 'right' ? 'flex-end' : 'center',
    textDecoration: 'none',
    cursor: isEditing ? 'text' : 'default',
    width: '100%',
    height: '100%',
  };

  const editableContent = (
    <span
      ref={contentRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className="outline-none focus:bg-white/10 transition-colors"
      style={{ 
        pointerEvents: isEditing ? 'auto' : 'none',
        minWidth: '20px',
        display: 'inline-block',
      }}
    >
      {block.content}
    </span>
  );

  return (
    <div className="w-full h-full">
      {hasLink ? (
        <a
          href={block.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity"
          style={buttonStyles}
          onClick={(e) => e.preventDefault()} // Prevent navigation in editor
        >
          {editableContent}
        </a>
      ) : (
        <button
          className="cursor-default hover:opacity-90 transition-opacity"
          style={buttonStyles}
        >
          {editableContent}
        </button>
      )}
    </div>
  );
}

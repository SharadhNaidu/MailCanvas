/**
 * useHotkeys Hook
 * Phase 9: Infinite Workspace
 * 
 * Keyboard shortcuts for professional canvas editing
 * Supports: Delete, Copy, Paste, Duplicate, Nudge, Undo, Redo, Zoom
 */

import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

/**
 * Check if the user is typing in an input field
 */
function isTyping(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}

/**
 * Check if Ctrl (or Cmd on Mac) is pressed
 */
function isModKey(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.metaKey;
}

export function useHotkeys() {
  const {
    selectedBlockIds,
    deleteSelectedBlocks,
    copySelectedBlocks,
    pasteBlocks,
    duplicateSelectedBlocks,
    nudgeSelectedBlocks,
    selectBlock,
    zoomIn,
    zoomOut,
    resetZoom,
    groupSelectedBlocks,
    ungroupSelectedBlock,
    createComponent,
  } = useEditorStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (isTyping(e)) {
        return;
      }

      const hasSelection = selectedBlockIds.length > 0;

      // Ctrl/Cmd + Z - Undo
      if (isModKey(e) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.temporal.getState().undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
      if ((isModKey(e) && e.key === 'z' && e.shiftKey) || (isModKey(e) && e.key === 'y')) {
        e.preventDefault();
        useEditorStore.temporal.getState().redo();
        return;
      }

      // Ctrl/Cmd + = or + or NumpadAdd - Zoom In
      if (isModKey(e) && (e.key === '=' || e.key === '+' || e.code === 'Equal' || e.code === 'NumpadAdd')) {
        e.preventDefault();
        e.stopPropagation();
        zoomIn();
        return;
      }

      // Ctrl/Cmd + - or NumpadSubtract - Zoom Out
      if (isModKey(e) && (e.key === '-' || e.code === 'Minus' || e.code === 'NumpadSubtract')) {
        e.preventDefault();
        e.stopPropagation();
        zoomOut();
        return;
      }

      // Ctrl/Cmd + 0 or Numpad0 - Reset Zoom
      if (isModKey(e) && (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0')) {
        e.preventDefault();
        e.stopPropagation();
        resetZoom();
        return;
      }

      // Delete / Backspace - Delete selected blocks
      if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
        e.preventDefault();
        deleteSelectedBlocks();
        return;
      }

      // Escape - Deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        selectBlock(null);
        return;
      }

      // Ctrl/Cmd + C - Copy
      if (isModKey(e) && e.key === 'c' && hasSelection) {
        e.preventDefault();
        copySelectedBlocks();
        return;
      }

      // Ctrl/Cmd + V - Paste
      if (isModKey(e) && e.key === 'v') {
        e.preventDefault();
        pasteBlocks();
        return;
      }

      // Ctrl/Cmd + D - Duplicate
      if (isModKey(e) && e.key === 'd' && hasSelection) {
        e.preventDefault();
        duplicateSelectedBlocks();
        return;
      }

      // Ctrl/Cmd + G - Group selected blocks (Phase 15)
      if (isModKey(e) && e.key === 'g' && !e.shiftKey && selectedBlockIds.length >= 2) {
        e.preventDefault();
        groupSelectedBlocks();
        return;
      }

      // Ctrl/Cmd + Shift + G - Ungroup selected block (Phase 15)
      if (isModKey(e) && e.key === 'g' && e.shiftKey && hasSelection) {
        e.preventDefault();
        ungroupSelectedBlock();
        return;
      }

      // Ctrl/Cmd + Alt + K - Create Component (Phase 17)
      if (isModKey(e) && e.altKey && e.key === 'k' && hasSelection) {
        e.preventDefault();
        createComponent();
        return;
      }

      // Arrow Keys - Nudge selected blocks
      const nudgeAmount = e.shiftKey ? 10 : 1;
      
      if (e.key === 'ArrowLeft' && hasSelection) {
        e.preventDefault();
        nudgeSelectedBlocks(-nudgeAmount, 0);
        return;
      }

      if (e.key === 'ArrowRight' && hasSelection) {
        e.preventDefault();
        nudgeSelectedBlocks(nudgeAmount, 0);
        return;
      }

      if (e.key === 'ArrowUp' && hasSelection) {
        e.preventDefault();
        nudgeSelectedBlocks(0, -nudgeAmount);
        return;
      }

      if (e.key === 'ArrowDown' && hasSelection) {
        e.preventDefault();
        nudgeSelectedBlocks(0, nudgeAmount);
        return;
      }
    },
    [
      selectedBlockIds,
      deleteSelectedBlocks,
      copySelectedBlocks,
      pasteBlocks,
      duplicateSelectedBlocks,
      nudgeSelectedBlocks,
      selectBlock,
      zoomIn,
      zoomOut,
      resetZoom,
      groupSelectedBlocks,
      ungroupSelectedBlock,
      createComponent,
    ]
  );

  useEffect(() => {
    // Use capture phase to intercept zoom shortcuts before browser handles them
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleKeyDown]);
}

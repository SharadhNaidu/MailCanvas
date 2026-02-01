/**
 * CanvasContextMenu Component - "The Quick Actions"
 * Phase 9: Right-click context menus
 * 
 * Figma-style context menu with common actions
 * Available when right-clicking on blocks or canvas
 */

"use client";

import { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import {
  Copy,
  Clipboard,
  Scissors,
  Trash2,
  CopyPlus,
  ArrowUpToLine,
  ArrowDownToLine,
  MoveUp,
  MoveDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Palette,
  Type,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  List,
} from "lucide-react";
import { 
  useEditorStore, 
  useSelectedBlockIds,
  useCanUndo,
  useCanRedo,
  useUndo,
  useRedo,
} from "@/store/useEditorStore";
import { EditorBlock, DEFAULT_TABLE_DATA, DEFAULT_LIST_DATA } from "@/types/editor";

// Quick color presets for context menu
const QUICK_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Teal', value: '#14b8a6' },
];

interface CanvasContextMenuProps {
  children: ReactNode;
  block?: EditorBlock;
}

export function CanvasContextMenu({ children, block }: CanvasContextMenuProps) {
  const selectedBlockIds = useSelectedBlockIds();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const undo = useUndo();
  const redo = useRedo();
  
  const {
    selectBlock,
    copySelectedBlocks,
    pasteBlocks,
    duplicateSelectedBlocks,
    deleteSelectedBlocks,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    updateBlock,
    clipboard,
  } = useEditorStore();

  const hasSelection = selectedBlockIds.length > 0;
  const hasClipboard = clipboard.length > 0;
  
  // Block type checks for context-sensitive menus
  const blockType = block?.type;
  const hasTextContent = blockType === 'text' || blockType === 'button' || blockType === 'table' || blockType === 'list';
  const isTable = blockType === 'table';
  const isList = blockType === 'list';
  
  // If right-clicking on a block that isn't selected, select it
  const handleOpenChange = (open: boolean) => {
    if (open && block && !selectedBlockIds.includes(block.id)) {
      selectBlock(block.id);
    }
  };

  // Get the current block's state for lock/visibility toggles
  const isLocked = block?.isLocked ?? false;
  const isVisible = block?.isVisible ?? true;

  const handleCut = () => {
    if (hasSelection) {
      copySelectedBlocks();
      deleteSelectedBlocks();
    }
  };

  const handleCopy = () => {
    if (hasSelection) {
      copySelectedBlocks();
    }
  };

  const handlePaste = () => {
    pasteBlocks();
  };

  const handleDuplicate = () => {
    if (hasSelection) {
      duplicateSelectedBlocks();
    }
  };

  const handleDelete = () => {
    if (hasSelection) {
      deleteSelectedBlocks();
    }
  };

  const handleBringToFront = () => {
    if (hasSelection) {
      bringToFront();
    }
  };

  const handleSendToBack = () => {
    if (hasSelection) {
      sendToBack();
    }
  };

  const handleBringForward = () => {
    if (hasSelection) {
      bringForward();
    }
  };

  const handleSendBackward = () => {
    if (hasSelection) {
      sendBackward();
    }
  };

  const handleToggleLock = () => {
    if (block) {
      updateBlock(block.id, { isLocked: !isLocked });
    }
  };

  // Text formatting handlers
  const handleTextColor = (color: string) => {
    if (block) {
      updateBlock(block.id, { styles: { ...block.styles, color } });
    }
  };

  const handleTextAlign = (align: string) => {
    if (block) {
      updateBlock(block.id, { styles: { ...block.styles, textAlign: align } });
    }
  };

  const handleFontWeight = (weight: string) => {
    if (block) {
      const currentWeight = block.styles.fontWeight || '400';
      const newWeight = currentWeight === weight ? '400' : weight;
      updateBlock(block.id, { styles: { ...block.styles, fontWeight: newWeight } });
    }
  };

  // Table-specific handlers
  const handleAddTableRow = () => {
    if (block && isTable) {
      const currentData = block.tableData || { ...DEFAULT_TABLE_DATA };
      const newRow = Array(currentData.cols).fill('New Cell');
      updateBlock(block.id, {
        tableData: {
          ...currentData,
          rows: currentData.rows + 1,
          data: [...currentData.data, newRow],
        },
      });
    }
  };

  const handleAddTableCol = () => {
    if (block && isTable) {
      const currentData = block.tableData || { ...DEFAULT_TABLE_DATA };
      const newData = currentData.data.map((row, i) => 
        [...row, i === 0 && currentData.hasHeader ? 'Header' : 'Cell']
      );
      updateBlock(block.id, {
        tableData: {
          ...currentData,
          cols: currentData.cols + 1,
          data: newData,
        },
      });
    }
  };

  // List-specific handlers
  const handleAddListItem = () => {
    if (block && isList) {
      const currentData = block.listData || { ...DEFAULT_LIST_DATA };
      updateBlock(block.id, {
        listData: {
          ...currentData,
          items: [...currentData.items, 'New item'],
        },
      });
    }
  };

  const handleListStyle = (style: 'disc' | 'decimal' | 'square') => {
    if (block && isList) {
      const currentData = block.listData || { ...DEFAULT_LIST_DATA };
      updateBlock(block.id, {
        listData: { ...currentData, style },
      });
    }
  };

  const handleToggleVisibility = () => {
    if (block) {
      updateBlock(block.id, { isVisible: !isVisible });
    }
  };

  return (
    <ContextMenu onOpenChange={handleOpenChange}>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Edit Actions */}
        <ContextMenuItem onClick={handleCut} disabled={!hasSelection}>
          <Scissors className="mr-2 h-4 w-4" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy} disabled={!hasSelection}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePaste} disabled={!hasClipboard}>
          <Clipboard className="mr-2 h-4 w-4" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate} disabled={!hasSelection}>
          <CopyPlus className="mr-2 h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Undo/Redo */}
        <ContextMenuItem onClick={undo} disabled={!canUndo}>
          Undo
          <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={redo} disabled={!canRedo}>
          Redo
          <ContextMenuShortcut>⌘⇧Z</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Layering - Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!hasSelection}>
            <MoveUp className="mr-2 h-4 w-4" />
            Arrange
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={handleBringToFront}>
              <ArrowUpToLine className="mr-2 h-4 w-4" />
              Bring to Front
              <ContextMenuShortcut>⌘]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleBringForward}>
              <MoveUp className="mr-2 h-4 w-4" />
              Bring Forward
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSendBackward}>
              <MoveDown className="mr-2 h-4 w-4" />
              Send Backward
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSendToBack}>
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Send to Back
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Text Formatting - For blocks with text content */}
        {block && hasTextContent && (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel className="text-xs text-muted-foreground px-2">
              Text Formatting
            </ContextMenuLabel>
            
            {/* Text Color Submenu */}
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                Text Color
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-40">
                <div className="grid grid-cols-4 gap-1 p-2">
                  {QUICK_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleTextColor(color.value)}
                      className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-xs text-muted-foreground">
                  More colors in Properties →
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            {/* Text Alignment Submenu */}
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Type className="mr-2 h-4 w-4" />
                Alignment
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-36">
                <ContextMenuItem onClick={() => handleTextAlign('left')}>
                  <AlignLeft className="mr-2 h-4 w-4" />
                  Left
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleTextAlign('center')}>
                  <AlignCenter className="mr-2 h-4 w-4" />
                  Center
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleTextAlign('right')}>
                  <AlignRight className="mr-2 h-4 w-4" />
                  Right
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            {/* Bold Toggle */}
            <ContextMenuItem onClick={() => handleFontWeight('700')}>
              <Bold className="mr-2 h-4 w-4" />
              {block.styles.fontWeight === '700' ? 'Remove Bold' : 'Bold'}
              <ContextMenuShortcut>⌘B</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}

        {/* Table-specific actions */}
        {block && isTable && (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel className="text-xs text-muted-foreground px-2">
              Table
            </ContextMenuLabel>
            <ContextMenuItem onClick={handleAddTableRow}>
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </ContextMenuItem>
            <ContextMenuItem onClick={handleAddTableCol}>
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </ContextMenuItem>
          </>
        )}

        {/* List-specific actions */}
        {block && isList && (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel className="text-xs text-muted-foreground px-2">
              List
            </ContextMenuLabel>
            <ContextMenuItem onClick={handleAddListItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <List className="mr-2 h-4 w-4" />
                List Style
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-36">
                <ContextMenuItem onClick={() => handleListStyle('disc')}>
                  • Bullet
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleListStyle('decimal')}>
                  1. Numbered
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleListStyle('square')}>
                  ■ Square
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}

        {/* Block-specific actions (only show when right-clicking on a block) */}
        {block && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleToggleLock}>
              {isLocked ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock
                </>
              )}
            </ContextMenuItem>
            <ContextMenuItem onClick={handleToggleVisibility}>
              {isVisible ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show
                </>
              )}
            </ContextMenuItem>
          </>
        )}

        <ContextMenuSeparator />

        {/* Delete */}
        <ContextMenuItem 
          onClick={handleDelete} 
          disabled={!hasSelection}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/**
 * LayerItem Component - Phase 16: Professional Layers Tree
 * 
 * Recursive layer item with:
 * - Tree indentation
 * - Expand/collapse for groups
 * - Inline renaming on double-click
 * - Block type icons
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { 
  Type, 
  Image, 
  Square, 
  Minus,
  SeparatorHorizontal,
  Share2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronRight,
  Shapes,
  Folder,
  FolderOpen,
  Table2,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorStore, useSelectedBlockIds, useExpandedGroupIds } from "@/store/useEditorStore";
import type { BlockType, EditorBlock } from "@/types/editor";
import { cn } from "@/lib/utils";

/**
 * Icon mapping for block types
 */
const blockIcons: Record<BlockType, React.ReactNode> = {
  text: <Type className="h-3.5 w-3.5" />,
  image: <Image className="h-3.5 w-3.5" />,
  button: <Square className="h-3.5 w-3.5" />,
  spacer: <Minus className="h-3.5 w-3.5" />,
  divider: <SeparatorHorizontal className="h-3.5 w-3.5" />,
  social: <Share2 className="h-3.5 w-3.5" />,
  shape: <Shapes className="h-3.5 w-3.5" />,
  group: <Folder className="h-3.5 w-3.5" />,
  table: <Table2 className="h-3.5 w-3.5" />,
  list: <List className="h-3.5 w-3.5" />,
};

interface LayerItemProps {
  block: EditorBlock;
  depth?: number;
  allBlocks: EditorBlock[];
}

export function LayerItem({ block, depth = 0, allBlocks }: LayerItemProps) {
  const selectedBlockIds = useSelectedBlockIds();
  const expandedGroupIds = useExpandedGroupIds();
  const { 
    selectBlock, 
    toggleBlockLock, 
    toggleBlockVisibility, 
    removeBlock,
    renameBlock,
    toggleGroupExpansion,
  } = useEditorStore();
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(block.name);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isSelected = selectedBlockIds.includes(block.id);
  const isGroup = block.type === 'group';
  const isExpanded = expandedGroupIds.includes(block.id);
  
  // Get children for groups
  const children = isGroup 
    ? allBlocks.filter((b) => b.parentId === block.id)
    : [];

  // Focus input when entering rename mode
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id, e.shiftKey);
  }, [block.id, selectBlock]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setRenameValue(block.name);
  }, [block.name]);

  const handleRenameSubmit = useCallback(() => {
    if (renameValue.trim() && renameValue !== block.name) {
      renameBlock(block.id, renameValue.trim());
    }
    setIsRenaming(false);
  }, [renameValue, block.id, block.name, renameBlock]);

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setRenameValue(block.name);
    }
  }, [handleRenameSubmit, block.name]);

  const handleChevronClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleGroupExpansion(block.id);
  }, [block.id, toggleGroupExpansion]);

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-1 px-1 py-1 rounded-md cursor-pointer transition-colors",
          "hover:bg-slate-100",
          isSelected && "bg-primary/10 hover:bg-primary/15",
          !block.isVisible && "opacity-50"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Expand/Collapse Chevron for Groups */}
        {isGroup ? (
          <button
            onClick={handleChevronClick}
            className="flex items-center justify-center w-4 h-4 hover:bg-slate-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-slate-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-500" />
            )}
          </button>
        ) : (
          <div className="w-4" /> // Spacer for alignment
        )}
        
        {/* Block Icon */}
        <div className={cn(
          "flex items-center justify-center w-5 h-5 rounded shrink-0",
          isSelected ? "text-primary" : "text-slate-500"
        )}>
          {isGroup && isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5" />
          ) : (
            blockIcons[block.type]
          )}
        </div>
        
        {/* Block Name (Editable) */}
        {isRenaming ? (
          <Input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            className="h-5 px-1 py-0 text-xs flex-1 min-w-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={cn(
            "flex-1 text-xs truncate min-w-0",
            isSelected ? "font-medium text-primary" : "text-slate-700"
          )}>
            {block.name}
          </span>
        )}
        
        {/* Hover Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {/* Lock Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-5 w-5 p-0",
              block.isLocked && "opacity-100 text-amber-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleBlockLock(block.id);
            }}
            title={block.isLocked ? "Unlock" : "Lock"}
          >
            {block.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </Button>
          
          {/* Visibility Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-5 w-5 p-0",
              !block.isVisible && "opacity-100 text-slate-400"
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleBlockVisibility(block.id);
            }}
            title={block.isVisible ? "Hide" : "Show"}
          >
            {block.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          
          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-slate-400 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Render Children Recursively */}
      {isGroup && isExpanded && children.length > 0 && (
        <div className="relative">
          {/* Vertical connector line */}
          <div 
            className="absolute left-0 top-0 bottom-0 border-l border-slate-200"
            style={{ marginLeft: `${(depth + 1) * 12 + 8}px` }}
          />
          {children.map((child) => (
            <LayerItem
              key={child.id}
              block={child}
              depth={depth + 1}
              allBlocks={allBlocks}
            />
          ))}
        </div>
      )}
    </>
  );
}

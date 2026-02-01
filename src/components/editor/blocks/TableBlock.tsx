/**
 * TableBlock Component
 * Phase 20: Deep Core Stability Fix
 * 
 * Renders an editable HTML table with:
 * - ContentEditable cells (only when in editing mode)
 * - Header row styling
 * - Configurable border color
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditorStore, useVariables, resolveStyleValue } from "@/store/useEditorStore";
import type { EditorBlock, TableData } from "@/types/editor";
import { DEFAULT_TABLE_DATA } from "@/types/editor";

interface TableBlockProps {
  block: EditorBlock;
  isEditing?: boolean;
}

export function TableBlock({ block, isEditing }: TableBlockProps) {
  const { updateBlock } = useEditorStore();
  const variables = useVariables();
  const styles = block.styles;
  const tableRef = useRef<HTMLTableElement>(null);
  
  // Get table data with defaults
  const tableData: TableData = block.tableData || DEFAULT_TABLE_DATA;
  const { data, hasHeader, borderColor } = tableData;
  
  // Resolve variable references for colors
  const resolvedBorderColor = resolveStyleValue(borderColor, variables) || '#e2e8f0';
  const resolvedBgColor = resolveStyleValue(styles.backgroundColor, variables) || '#ffffff';
  const resolvedTextColor = resolveStyleValue(styles.color, variables) || '#1e293b';

  // Focus first cell when entering edit mode
  useEffect(() => {
    if (isEditing && tableRef.current) {
      const firstCell = tableRef.current.querySelector('[contenteditable="true"]') as HTMLElement;
      if (firstCell) {
        firstCell.focus();
      }
    }
  }, [isEditing]);

  // Update a specific cell
  const updateCell = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const newData = data.map((row, ri) =>
        row.map((cell, ci) => (ri === rowIndex && ci === colIndex ? value : cell))
      );
      
      updateBlock(block.id, {
        tableData: {
          ...tableData,
          data: newData,
        },
      });
    },
    [block.id, data, tableData, updateBlock]
  );

  // Handle cell blur to save content
  const handleCellBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>, rowIndex: number, colIndex: number) => {
      const newValue = e.currentTarget.innerText;
      if (newValue !== data[rowIndex][colIndex]) {
        updateCell(rowIndex, colIndex, newValue);
      }
    },
    [data, updateCell]
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

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: resolvedBgColor,
    color: resolvedTextColor,
    fontSize: styles.fontSize || '14px',
    fontFamily: styles.fontFamily || 'Inter, sans-serif',
  };

  const cellStyles: React.CSSProperties = {
    border: `1px solid ${resolvedBorderColor}`,
    padding: styles.padding || '8px',
    textAlign: 'left',
    verticalAlign: 'top',
    minWidth: '60px',
  };

  const headerCellStyles: React.CSSProperties = {
    ...cellStyles,
    fontWeight: '600',
    backgroundColor: resolvedBorderColor,
  };

  return (
    <div className="w-full h-full overflow-auto">
      <table ref={tableRef} style={tableStyles}>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isHeaderRow = hasHeader && rowIndex === 0;
                const currentCellStyles = isHeaderRow ? headerCellStyles : cellStyles;
                
                return (
                  <td key={colIndex} style={currentCellStyles}>
                    <div
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => handleCellBlur(e, rowIndex, colIndex)}
                      onMouseDown={handleMouseDown}
                      onKeyDown={handleKeyDown}
                      className="outline-none min-h-[1.5em] cursor-text focus:bg-primary/5 transition-colors"
                      style={{
                        fontWeight: isHeaderRow ? '600' : 'normal',
                        pointerEvents: isEditing ? 'auto' : 'none',
                      }}
                    >
                      {cell}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

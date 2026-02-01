/**
 * VariablesPanel Component - Phase 18: Variable Engine (Design Tokens)
 * 
 * Manage global color and font variables
 * Displayed in RightSidebar when no block is selected
 */

"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Palette, Type, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useVariables, useEditorStore, DesignToken } from "@/store/useEditorStore";
import { cn } from "@/lib/utils";

interface VariableItemProps {
  variable: DesignToken;
}

function VariableItem({ variable }: VariableItemProps) {
  const { updateVariable, deleteVariable } = useEditorStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(variable.name);
  const [editValue, setEditValue] = useState(variable.value);

  const handleSave = useCallback(() => {
    updateVariable(variable.id, { name: editName, value: editValue });
    setIsEditing(false);
  }, [variable.id, editName, editValue, updateVariable]);

  const handleCancel = useCallback(() => {
    setEditName(variable.name);
    setEditValue(variable.value);
    setIsEditing(false);
  }, [variable.name, variable.value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  if (isEditing) {
    return (
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
        <div className="flex gap-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Variable name"
            className="h-7 text-xs flex-1"
            autoFocus
          />
          <Input
            type="color"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 w-10 p-0.5 cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="#000000"
            className="h-6 text-[10px] font-mono flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleSave}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
        "hover:bg-slate-50 transition-colors"
      )}
      onClick={() => setIsEditing(true)}
    >
      {/* Color Swatch */}
      <div
        className="w-6 h-6 rounded border border-slate-200 shrink-0"
        style={{ backgroundColor: variable.value }}
      />
      
      {/* Name & Value */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">
          {variable.name}
        </p>
        <p className="text-[10px] font-mono text-slate-400 uppercase">
          {variable.value}
        </p>
      </div>
      
      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-destructive transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          deleteVariable(variable.id);
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function VariablesPanel() {
  const variables = useVariables();
  const { addVariable } = useEditorStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("#000000");

  const colorVariables = variables.filter((v) => v.type === 'color');
  const fontVariables = variables.filter((v) => v.type === 'font');

  const handleAddColor = useCallback(() => {
    if (newName.trim()) {
      addVariable({ name: newName.trim(), value: newValue, type: 'color' });
      setNewName("");
      setNewValue("#000000");
      setIsAdding(false);
    }
  }, [newName, newValue, addVariable]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddColor();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewName("");
      setNewValue("#000000");
    }
  }, [handleAddColor]);

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Design Variables
          </h3>
        </div>
      </div>

      <p className="text-[10px] text-slate-400">
        Define global colors to use across your design. Changes update all blocks using that variable.
      </p>

      <Separator />

      {/* Color Variables */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
            <Palette className="h-3 w-3" />
            Colors
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-primary hover:bg-primary/10"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Add New Color Form */}
        {isAdding && (
          <div className="p-2 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Variable name"
                className="h-7 text-xs flex-1"
                autoFocus
              />
              <Input
                type="color"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="h-7 w-10 p-0.5 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="#000000"
                className="h-6 text-[10px] font-mono flex-1"
              />
              <Button
                variant="default"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={handleAddColor}
                disabled={!newName.trim()}
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                  setNewValue("#000000");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Color List */}
        <div className="space-y-0.5">
          {colorVariables.length === 0 ? (
            <p className="text-[10px] text-slate-400 text-center py-4">
              No color variables yet
            </p>
          ) : (
            colorVariables.map((variable) => (
              <VariableItem key={variable.id} variable={variable} />
            ))
          )}
        </div>
      </div>

      {/* Future: Font Variables */}
      {fontVariables.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
              <Type className="h-3 w-3" />
              Fonts
            </Label>
            <div className="space-y-0.5">
              {fontVariables.map((variable) => (
                <VariableItem key={variable.id} variable={variable} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Usage Hint */}
      <Separator />
      <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-[10px] text-slate-500">
          <strong className="text-slate-600">Tip:</strong> Click a color swatch in the Properties panel to apply a variable. Updating a variable will instantly update all blocks using it.
        </p>
      </div>
    </div>
  );
}

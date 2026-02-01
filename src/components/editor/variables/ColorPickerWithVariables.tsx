/**
 * ColorPickerWithVariables Component - Phase 18: Variable Engine
 * 
 * Enhanced color picker that supports both custom colors and design variables
 */

"use client";

import { useState, useCallback } from "react";
import { Palette, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVariables, resolveStyleValue, DesignToken } from "@/store/useEditorStore";
import { cn } from "@/lib/utils";

interface ColorPickerWithVariablesProps {
  value: string; // Can be "#hex" or "var:variable-id"
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function ColorPickerWithVariables({
  value,
  onChange,
  label,
  className,
}: ColorPickerWithVariablesProps) {
  const variables = useVariables();
  const colorVariables = variables.filter((v) => v.type === 'color');
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine if current value is a variable reference
  const isVariable = value?.startsWith('var:');
  const variableId = isVariable ? value.substring(4) : null;
  const activeVariable = variableId ? colorVariables.find((v) => v.id === variableId) : null;
  
  // Resolve to actual color for display
  const resolvedColor = resolveStyleValue(value, variables) || '#000000';
  
  // Local hex value for custom picker
  const [customColor, setCustomColor] = useState(isVariable ? '#000000' : (value || '#000000'));

  const handleVariableSelect = useCallback((variable: DesignToken) => {
    onChange(`var:${variable.id}`);
    setIsOpen(false);
  }, [onChange]);

  const handleCustomColorChange = useCallback((color: string) => {
    setCustomColor(color);
    onChange(color);
  }, [onChange]);

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-8 justify-start gap-2 px-2"
          >
            {/* Color Swatch */}
            <div
              className="w-5 h-5 rounded border border-slate-200 shrink-0"
              style={{ backgroundColor: resolvedColor }}
            />
            
            {/* Display Name or Hex */}
            <span className="text-xs truncate flex-1 text-left">
              {activeVariable ? (
                <span className="flex items-center gap-1">
                  <Palette className="h-3 w-3 text-primary" />
                  {activeVariable.name}
                </span>
              ) : (
                <span className="font-mono uppercase">{value || '#000000'}</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64 p-0" align="start">
          <Tabs defaultValue={colorVariables.length > 0 ? "variables" : "custom"}>
            <TabsList className="w-full grid grid-cols-2 h-8">
              <TabsTrigger value="variables" className="text-xs h-7">
                <Palette className="h-3 w-3 mr-1" />
                Variables
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs h-7">
                <Hash className="h-3 w-3 mr-1" />
                Custom
              </TabsTrigger>
            </TabsList>
            
            {/* Variables Tab */}
            <TabsContent value="variables" className="p-2 m-0">
              {colorVariables.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400">No color variables defined</p>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Click canvas to open Variables panel
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {colorVariables.map((variable) => (
                    <button
                      key={variable.id}
                      onClick={() => handleVariableSelect(variable)}
                      className={cn(
                        "group relative aspect-square rounded-md border-2 transition-all",
                        "hover:scale-110 hover:z-10",
                        variableId === variable.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                      style={{ backgroundColor: variable.value }}
                      title={`${variable.name}: ${variable.value}`}
                    >
                      {variableId === variable.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Show variable names below grid */}
              {colorVariables.length > 0 && activeVariable && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-500 text-center">
                    Selected: <strong className="text-primary">{activeVariable.name}</strong>
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Custom Color Tab */}
            <TabsContent value="custom" className="p-3 m-0 space-y-3">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="h-10 w-14 p-0.5 cursor-pointer"
                />
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground">Hex</Label>
                  <Input
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    placeholder="#000000"
                    className="h-7 text-xs font-mono uppercase"
                  />
                </div>
              </div>
              
              {/* Quick preset colors */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Presets</Label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
                    '#22c55e', '#0d9488', '#3b82f6', '#8b5cf6', '#ec4899',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleCustomColorChange(preset)}
                      className={cn(
                        "w-6 h-6 rounded border border-slate-200 transition-transform hover:scale-110",
                        customColor === preset && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ backgroundColor: preset }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * PropertyPanel Component
 * Phase 6: Creative Suite Upgrade
 * Phase 18: Variable Engine Integration
 * Sections: Dimensions, Content, Typography, Fill & Stroke, Effects
 */

"use client";

import { useSelectedBlock, useEditorStore } from "@/store/useEditorStore";
import type { BlockLayout, BlockStyles, SocialData, SocialProfile, SocialNetworkType, TableData, ListData } from "@/types/editor";
import { GOOGLE_FONTS, FONT_WEIGHTS, DEFAULT_SOCIAL_NETWORKS, DEFAULT_TABLE_DATA, DEFAULT_LIST_DATA } from "@/types/editor";
import { NETWORK_ICONS, NETWORK_NAMES, BRAND_COLORS } from "./SocialBlock";
import { ColorPickerWithVariables } from "./variables/ColorPickerWithVariables";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  ArrowUp,
  ArrowDown,
  Palette,
  Sparkles,
  Square,
  Upload,
  Image as ImageIcon,
  Link,
  Share2,
  ChevronUp,
  CornerUpLeft,
  Anchor,
  MoveHorizontal,
  MoveVertical,
  Table2,
  List,
  Plus,
  Minus,
  Trash2,
  Circle,
} from "lucide-react";
import { useCallback, useState, useRef } from "react";

// Tabs component for Fill Type
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PropertySectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function PropertySection({ title, icon, children, defaultOpen = true }: PropertySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left"
      >
        {icon}
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
          {title}
        </h4>
        <span className="text-xs text-muted-foreground">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && children}
    </div>
  );
}

/**
 * Corner Radius Control with Individual Corners
 * Phase 12: Advanced Style Engine
 */
interface CornerRadiusControlProps {
  borderRadius: string;
  borderRadiusIndividual?: string;
  onRadiusChange: (value: string) => void;
  onIndividualChange: (value: string | undefined) => void;
}

function CornerRadiusControl({
  borderRadius,
  borderRadiusIndividual,
  onRadiusChange,
  onIndividualChange,
}: CornerRadiusControlProps) {
  const [expanded, setExpanded] = useState(!!borderRadiusIndividual);
  
  // Parse individual radius values
  const parseIndividual = (str?: string) => {
    if (!str) return { tl: 0, tr: 0, br: 0, bl: 0 };
    const parts = str.split(' ').map(p => parseInt(p) || 0);
    if (parts.length === 4) {
      return { tl: parts[0], tr: parts[1], br: parts[2], bl: parts[3] };
    }
    const val = parts[0] || 0;
    return { tl: val, tr: val, br: val, bl: val };
  };
  
  const individual = parseIndividual(borderRadiusIndividual);
  const uniformRadius = parseInt(borderRadius) || 0;
  
  const handleIndividualChange = (corner: 'tl' | 'tr' | 'br' | 'bl', value: number) => {
    const newRadius = { ...individual, [corner]: value };
    const str = `${newRadius.tl}px ${newRadius.tr}px ${newRadius.br}px ${newRadius.bl}px`;
    onIndividualChange(str);
  };
  
  const handleExpandToggle = () => {
    if (expanded) {
      // Collapsing - clear individual and use uniform
      setExpanded(false);
      onIndividualChange(undefined);
    } else {
      // Expanding - initialize individual from uniform
      setExpanded(true);
      const str = `${uniformRadius}px ${uniformRadius}px ${uniformRadius}px ${uniformRadius}px`;
      onIndividualChange(str);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] text-muted-foreground">Radius</Label>
        <div className="flex items-center gap-1">
          {!expanded && (
            <span className="text-[10px] text-muted-foreground">{uniformRadius}px</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={handleExpandToggle}
            title={expanded ? "Use uniform radius" : "Set individual corners"}
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <CornerUpLeft className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      
      {!expanded ? (
        /* Uniform Radius Slider */
        <Slider
          value={[uniformRadius]}
          onValueChange={([value]) => onRadiusChange(`${value}px`)}
          min={0}
          max={60}
          step={1}
          className="w-full"
        />
      ) : (
        /* Individual Corner Controls */
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Top-Left */}
            <div className="space-y-0.5">
              <Label className="text-[9px] text-muted-foreground">TL</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={individual.tl}
                  onChange={(e) => handleIndividualChange('tl', parseInt(e.target.value) || 0)}
                  className="h-6 text-xs font-mono"
                />
                <span className="text-[9px] text-muted-foreground">px</span>
              </div>
            </div>
            
            {/* Top-Right */}
            <div className="space-y-0.5">
              <Label className="text-[9px] text-muted-foreground">TR</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={individual.tr}
                  onChange={(e) => handleIndividualChange('tr', parseInt(e.target.value) || 0)}
                  className="h-6 text-xs font-mono"
                />
                <span className="text-[9px] text-muted-foreground">px</span>
              </div>
            </div>
            
            {/* Bottom-Left */}
            <div className="space-y-0.5">
              <Label className="text-[9px] text-muted-foreground">BL</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={individual.bl}
                  onChange={(e) => handleIndividualChange('bl', parseInt(e.target.value) || 0)}
                  className="h-6 text-xs font-mono"
                />
                <span className="text-[9px] text-muted-foreground">px</span>
              </div>
            </div>
            
            {/* Bottom-Right */}
            <div className="space-y-0.5">
              <Label className="text-[9px] text-muted-foreground">BR</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={individual.br}
                  onChange={(e) => handleIndividualChange('br', parseInt(e.target.value) || 0)}
                  className="h-6 text-xs font-mono"
                />
                <span className="text-[9px] text-muted-foreground">px</span>
              </div>
            </div>
          </div>
          
          {/* Visual Preview */}
          <div className="flex justify-center py-1">
            <div 
              className="w-12 h-12 border-2 border-teal-500 bg-teal-500/10"
              style={{
                borderRadius: `${individual.tl}px ${individual.tr}px ${individual.br}px ${individual.bl}px`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Gradient Bar/Scale Control
 * Visual gradient preview with draggable color stops
 */
interface GradientBarProps {
  type: 'linear' | 'radial';
  startColor: string;
  endColor: string;
  angle?: number;
  onStartColorChange: (color: string) => void;
  onEndColorChange: (color: string) => void;
  onAngleChange?: (angle: number) => void;
}

function GradientBar({
  type,
  startColor,
  endColor,
  angle = 90,
  onStartColorChange,
  onEndColorChange,
  onAngleChange,
}: GradientBarProps) {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  
  // Generate CSS gradient string
  const gradientCSS = type === 'linear'
    ? `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)`
    : `radial-gradient(circle, ${startColor} 0%, ${endColor} 100%)`;
  
  return (
    <div className="space-y-3">
      {/* Gradient Preview Bar */}
      <div className="relative">
        {/* Main gradient bar */}
        <div 
          className="h-8 rounded-md border shadow-inner cursor-pointer"
          style={{ background: gradientCSS }}
        />
        
        {/* Color Stop Handles */}
        <div className="absolute inset-x-0 top-0 h-8 flex items-center justify-between px-1">
          {/* Start color handle */}
          <button
            className="w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: startColor }}
            onClick={() => startInputRef.current?.click()}
            title="Start color"
          />
          <input
            ref={startInputRef}
            type="color"
            value={startColor}
            onChange={(e) => onStartColorChange(e.target.value)}
            className="sr-only"
          />
          
          {/* End color handle */}
          <button
            className="w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: endColor }}
            onClick={() => endInputRef.current?.click()}
            title="End color"
          />
          <input
            ref={endInputRef}
            type="color"
            value={endColor}
            onChange={(e) => onEndColorChange(e.target.value)}
            className="sr-only"
          />
        </div>
      </div>
      
      {/* Color inputs row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5">
          <Label className="text-[9px] text-muted-foreground">Start</Label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={startColor}
              onChange={(e) => onStartColorChange(e.target.value)}
              className="w-6 h-6 rounded border cursor-pointer"
            />
            <Input
              type="text"
              value={startColor}
              onChange={(e) => onStartColorChange(e.target.value)}
              className="h-6 text-[10px] font-mono"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <Label className="text-[9px] text-muted-foreground">End</Label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={endColor}
              onChange={(e) => onEndColorChange(e.target.value)}
              className="w-6 h-6 rounded border cursor-pointer"
            />
            <Input
              type="text"
              value={endColor}
              onChange={(e) => onEndColorChange(e.target.value)}
              className="h-6 text-[10px] font-mono"
            />
          </div>
        </div>
      </div>
      
      {/* Angle Control for Linear */}
      {type === 'linear' && onAngleChange && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground font-medium">Direction</Label>
            <span className="text-xs text-teal-600 font-mono font-semibold">{angle}°</span>
          </div>
          
          {/* Direction Grid - 3x3 layout */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-1 p-2 bg-gray-50 rounded-lg">
              {/* Row 1: ↖ ↑ ↗ */}
              <button
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  angle === 135 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                onClick={() => onAngleChange(135)}
                title="135° - Top Left"
              >
                ↖
              </button>
              <button
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  angle === 90 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                onClick={() => onAngleChange(90)}
                title="90° - Up"
              >
                ↑
              </button>
              <button
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  angle === 45 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                onClick={() => onAngleChange(45)}
                title="45° - Top Right"
              >
                ↗
              </button>
              
              {/* Row 2: ← • → */}
              <button
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  angle === 180 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                onClick={() => onAngleChange(180)}
                title="180° - Left"
              >
                ←
              </button>
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-gray-200">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              </div>
              <button
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  angle === 0 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                onClick={() => onAngleChange(0)}
                title="0° - Right"
              >
                →
              </button>
              
              {/* Row 3: ↙ ↓ ↘ */}
              <button
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  angle === 225 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                onClick={() => onAngleChange(225)}
                title="225° - Bottom Left"
              >
                ↙
              </button>
              <button
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  angle === 270 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                onClick={() => onAngleChange(270)}
                title="270° - Down"
              >
                ↓
              </button>
              <button
                className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                  angle === 315 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                }`}
                onClick={() => onAngleChange(315)}
                title="315° - Bottom Right"
              >
                ↘
              </button>
            </div>
          </div>
          
          {/* Fine angle slider with input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Slider
                value={[angle]}
                onValueChange={([value]) => onAngleChange(value)}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => onAngleChange(parseInt(e.target.value) || 0)}
                className="w-14 h-7 text-xs font-mono text-center"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Radial preview indicator */}
      {type === 'radial' && (
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
          <div 
            className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-inner"
            style={{ background: gradientCSS }}
          />
          <span className="text-xs text-muted-foreground">Radial gradient from center</span>
        </div>
      )}
    </div>
  );
}

/**
 * Image Content Section with File Upload
 */
function ImageContentSection({ 
  content, 
  onContentChange 
}: { 
  content: string; 
  onContentChange: (value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onContentChange(url);
    }
  }, [onContentChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  return (
    <div className="space-y-3">
      {/* File Upload Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-3 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">
          Drop image or click to upload
        </p>
      </div>

      {/* Preview Thumbnail */}
      {content && content.startsWith('blob:') && (
        <div className="relative rounded-md overflow-hidden bg-slate-100">
          <img 
            src={content} 
            alt="Preview" 
            className="w-full h-16 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
          </div>
        </div>
      )}

      {/* URL Input (fallback) */}
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Or paste URL</Label>
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={content.startsWith('blob:') ? '' : content}
          onChange={(e) => onContentChange(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
}

export function PropertyPanel() {
  const selectedBlock = useSelectedBlock();
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const updateBlockStyles = useEditorStore((state) => state.updateBlockStyles);
  const updateBlockLayout = useEditorStore((state) => state.updateBlockLayout);
  const bringToFront = useEditorStore((state) => state.bringToFront);
  const sendToBack = useEditorStore((state) => state.sendToBack);

  const handleContentChange = useCallback(
    (value: string) => {
      if (!selectedBlock) return;
      updateBlock(selectedBlock.id, { content: value });
    },
    [selectedBlock, updateBlock]
  );

  const handleStyleChange = useCallback(
    (property: keyof BlockStyles, value: string | number) => {
      if (!selectedBlock) return;
      updateBlockStyles(selectedBlock.id, { [property]: String(value) });
    },
    [selectedBlock, updateBlockStyles]
  );

  const handleLayoutChange = useCallback(
    (property: keyof BlockLayout, value: number | 'auto') => {
      if (!selectedBlock) return;
      updateBlockLayout(selectedBlock.id, { [property]: value });
    },
    [selectedBlock, updateBlockLayout]
  );

  // Handler for social data updates
  const handleSocialDataChange = useCallback(
    (updates: Partial<SocialData>) => {
      if (!selectedBlock || selectedBlock.type !== 'social') return;
      const currentData = selectedBlock.socialData || {
        networks: [...DEFAULT_SOCIAL_NETWORKS],
        iconSize: 24,
        gap: 12,
        iconStyle: 'original' as const,
        iconColor: 'brand' as const,
      };
      updateBlock(selectedBlock.id, {
        socialData: { ...currentData, ...updates },
      });
    },
    [selectedBlock, updateBlock]
  );

  // Handler for updating individual network profile
  const handleNetworkChange = useCallback(
    (network: SocialNetworkType, updates: Partial<SocialProfile>) => {
      if (!selectedBlock || selectedBlock.type !== 'social') return;
      const currentData = selectedBlock.socialData || {
        networks: [...DEFAULT_SOCIAL_NETWORKS],
        iconSize: 24,
        gap: 12,
        iconStyle: 'original' as const,
        iconColor: 'brand' as const,
      };
      const updatedNetworks = currentData.networks.map((n) =>
        n.network === network ? { ...n, ...updates } : n
      );
      updateBlock(selectedBlock.id, {
        socialData: { ...currentData, networks: updatedNetworks },
      });
    },
    [selectedBlock, updateBlock]
  );

  // Handler for table data updates
  const handleTableDataChange = useCallback(
    (updates: Partial<TableData>) => {
      if (!selectedBlock || selectedBlock.type !== 'table') return;
      const currentData = selectedBlock.tableData || { ...DEFAULT_TABLE_DATA };
      updateBlock(selectedBlock.id, {
        tableData: { ...currentData, ...updates },
      });
    },
    [selectedBlock, updateBlock]
  );

  // Table row/column operations
  const handleAddRow = useCallback(() => {
    if (!selectedBlock || selectedBlock.type !== 'table') return;
    const currentData = selectedBlock.tableData || { ...DEFAULT_TABLE_DATA };
    const newRow = Array(currentData.cols).fill('New Cell');
    updateBlock(selectedBlock.id, {
      tableData: {
        ...currentData,
        rows: currentData.rows + 1,
        data: [...currentData.data, newRow],
      },
    });
  }, [selectedBlock, updateBlock]);

  const handleRemoveRow = useCallback(() => {
    if (!selectedBlock || selectedBlock.type !== 'table') return;
    const currentData = selectedBlock.tableData || { ...DEFAULT_TABLE_DATA };
    if (currentData.rows <= 1) return; // Keep at least 1 row
    updateBlock(selectedBlock.id, {
      tableData: {
        ...currentData,
        rows: currentData.rows - 1,
        data: currentData.data.slice(0, -1),
      },
    });
  }, [selectedBlock, updateBlock]);

  const handleAddCol = useCallback(() => {
    if (!selectedBlock || selectedBlock.type !== 'table') return;
    const currentData = selectedBlock.tableData || { ...DEFAULT_TABLE_DATA };
    const newData = currentData.data.map((row, i) => [...row, i === 0 && currentData.hasHeader ? 'Header' : 'Cell']);
    updateBlock(selectedBlock.id, {
      tableData: {
        ...currentData,
        cols: currentData.cols + 1,
        data: newData,
      },
    });
  }, [selectedBlock, updateBlock]);

  const handleRemoveCol = useCallback(() => {
    if (!selectedBlock || selectedBlock.type !== 'table') return;
    const currentData = selectedBlock.tableData || { ...DEFAULT_TABLE_DATA };
    if (currentData.cols <= 1) return; // Keep at least 1 column
    const newData = currentData.data.map((row) => row.slice(0, -1));
    updateBlock(selectedBlock.id, {
      tableData: {
        ...currentData,
        cols: currentData.cols - 1,
        data: newData,
      },
    });
  }, [selectedBlock, updateBlock]);

  // Handler for list data updates
  const handleListDataChange = useCallback(
    (updates: Partial<ListData>) => {
      if (!selectedBlock || selectedBlock.type !== 'list') return;
      const currentData = selectedBlock.listData || { ...DEFAULT_LIST_DATA };
      updateBlock(selectedBlock.id, {
        listData: { ...currentData, ...updates },
      });
    },
    [selectedBlock, updateBlock]
  );

  // List item operations
  const handleAddListItem = useCallback(() => {
    if (!selectedBlock || selectedBlock.type !== 'list') return;
    const currentData = selectedBlock.listData || { ...DEFAULT_LIST_DATA };
    updateBlock(selectedBlock.id, {
      listData: {
        ...currentData,
        items: [...currentData.items, 'New item'],
      },
    });
  }, [selectedBlock, updateBlock]);

  const handleRemoveListItem = useCallback(() => {
    if (!selectedBlock || selectedBlock.type !== 'list') return;
    const currentData = selectedBlock.listData || { ...DEFAULT_LIST_DATA };
    if (currentData.items.length <= 1) return; // Keep at least 1 item
    updateBlock(selectedBlock.id, {
      listData: {
        ...currentData,
        items: currentData.items.slice(0, -1),
      },
    });
  }, [selectedBlock, updateBlock]);

  if (!selectedBlock) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <Type className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm text-center">
          Select a block to edit its properties
        </p>
      </div>
    );
  }

  const { type, content, styles, layout } = selectedBlock;
  const isShape = type === 'shape';
  const isText = type === 'text' || type === 'button';
  const isSocial = type === 'social';
  const isTable = type === 'table';
  const isList = type === 'list';
  
  // Blocks that contain editable text content
  const hasTextContent = isText || isTable || isList;

  // Parse border
  const hasBorder = !!(styles.border && styles.border !== 'none');
  const borderWidth = parseInt(styles.borderWidth || '0');
  const borderColor = styles.borderColor || '#000000';

  // Parse shadow
  const hasShadow = !!(styles.boxShadow && styles.boxShadow !== 'none');

  // Parse opacity
  const opacity = Math.round(parseFloat(styles.opacity || '1') * 100);

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full">
      {/* Dimensions & Position */}
      <PropertySection title="Dimensions" icon={<Square className="w-3 h-3 text-muted-foreground" />}>
        <div className="space-y-3">
          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">X</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  value={Math.round(layout.x)}
                  onChange={(e) => handleLayoutChange("x", parseInt(e.target.value) || 0)}
                  className="h-7 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">px</span>
              </div>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Y</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  value={Math.round(layout.y)}
                  onChange={(e) => handleLayoutChange("y", parseInt(e.target.value) || 0)}
                  className="h-7 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">px</span>
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">W</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={20}
                  value={Math.round(layout.width)}
                  onChange={(e) => handleLayoutChange("width", parseInt(e.target.value) || 50)}
                  className="h-7 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">px</span>
              </div>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">H</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={20}
                  value={layout.height === 'auto' ? '' : Math.round(layout.height as number)}
                  placeholder="auto"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === 'auto') {
                      handleLayoutChange("height", 'auto');
                    } else {
                      handleLayoutChange("height", parseInt(val) || 24);
                    }
                  }}
                  className="h-7 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">px</span>
              </div>
            </div>
          </div>

          {/* Layer Order */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={() => bringToFront(selectedBlock.id)}
            >
              <ArrowUp className="w-3 h-3 mr-1" />
              Front
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={() => sendToBack(selectedBlock.id)}
            >
              <ArrowDown className="w-3 h-3 mr-1" />
              Back
            </Button>
            <span className="text-[10px] text-muted-foreground ml-auto">
              z:{layout.zIndex}
            </span>
          </div>
        </div>
      </PropertySection>

      <Separator />

      {/* Content Section (not for shapes) */}
      {!isShape && (
        <>
          <PropertySection title="Content" icon={<Type className="w-3 h-3 text-muted-foreground" />}>
            {type === "image" ? (
              <ImageContentSection 
                content={content} 
                onContentChange={handleContentChange} 
              />
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Text</Label>
                  <Textarea
                    placeholder="Enter your text..."
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-[60px] text-xs resize-none"
                  />
                </div>
                
                {/* Link URL for Button blocks */}
                {type === "button" && (
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      Link URL
                    </Label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={selectedBlock.link || ''}
                      onChange={(e) => updateBlock(selectedBlock.id, { link: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <p className="text-[9px] text-muted-foreground">
                      {selectedBlock.link ? "Button will redirect to this URL" : "Add a URL to make button clickable"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </PropertySection>
          <Separator />
        </>
      )}

      {/* Typography Section (Text & Button only) */}
      {/* Typography Section - Phase 6: For all text-containing blocks */}
      {hasTextContent && (
        <>
          <PropertySection title="Typography" icon={<Type className="w-3 h-3 text-muted-foreground" />}>
            <div className="space-y-3">
              {/* Text Resize Mode (Text blocks only) */}
              {type === "text" && (
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Text Resizing</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={styles.textAutoSize === 'auto' ? "default" : "outline"}
                      size="sm"
                      className="flex-1 h-7 text-[10px] gap-1"
                      onClick={() => {
                        handleStyleChange("textAutoSize", "auto");
                        // Auto-resize to fit current content
                      }}
                    >
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 8h12M2 8l2-2M2 8l2 2M14 8l-2-2M14 8l-2 2" />
                      </svg>
                      Auto
                    </Button>
                    <Button
                      variant={styles.textAutoSize !== 'auto' ? "default" : "outline"}
                      size="sm"
                      className="flex-1 h-7 text-[10px] gap-1"
                      onClick={() => handleStyleChange("textAutoSize", "fixed")}
                    >
                      <Square className="w-3 h-3" />
                      Fixed
                    </Button>
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    {styles.textAutoSize === 'auto' 
                      ? "Box grows as you type" 
                      : "Text wraps within box"}
                  </p>
                </div>
              )}

              {/* Font Family */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Font</Label>
                <Select
                  value={styles.fontFamily || "Inter, sans-serif"}
                  onValueChange={(value) => handleStyleChange("fontFamily", value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem 
                        key={font.value} 
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Weight */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Weight</Label>
                <Select
                  value={styles.fontWeight || "400"}
                  onValueChange={(value) => handleStyleChange("fontWeight", value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size, Line Height, Letter Spacing */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Size</Label>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min={8}
                      max={120}
                      value={parseInt(styles.fontSize || "16")}
                      onChange={(e) => handleStyleChange("fontSize", `${e.target.value}px`)}
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Line H</Label>
                  <Input
                    type="number"
                    min={0.8}
                    max={3}
                    step={0.1}
                    value={parseFloat(styles.lineHeight || "1.5")}
                    onChange={(e) => handleStyleChange("lineHeight", e.target.value)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Spacing</Label>
                  <Input
                    type="number"
                    min={-0.1}
                    max={0.5}
                    step={0.01}
                    value={parseFloat(styles.letterSpacing?.replace('em', '') || "0")}
                    onChange={(e) => handleStyleChange("letterSpacing", `${e.target.value}em`)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Alignment</Label>
                <div className="flex gap-1">
                  <Button
                    variant={styles.textAlign === "left" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-7"
                    onClick={() => handleStyleChange("textAlign", "left")}
                  >
                    <AlignLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={styles.textAlign === "center" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-7"
                    onClick={() => handleStyleChange("textAlign", "center")}
                  >
                    <AlignCenter className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={styles.textAlign === "right" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-7"
                    onClick={() => handleStyleChange("textAlign", "right")}
                  >
                    <AlignRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Text Color */}
              <ColorPickerWithVariables
                value={styles.color || "#1e293b"}
                onChange={(value) => handleStyleChange("color", value)}
                label="Text Color"
              />
            </div>
          </PropertySection>
          <Separator />
        </>
      )}

      {/* Fill & Stroke Section - Phase 12: Advanced Style Engine */}
      <PropertySection title="Fill & Stroke" icon={<Palette className="w-3 h-3 text-muted-foreground" />}>
        <div className="space-y-4">
          {/* Advanced Fill Section for Shapes */}
          {isShape ? (
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground">Fill Type</Label>
              <Tabs 
                value={styles.fillType || 'solid'} 
                onValueChange={(value) => handleStyleChange("fillType", value)}
                className="w-full"
              >
                <TabsList className="w-full h-7 p-0.5">
                  <TabsTrigger value="solid" className="flex-1 h-6 text-[10px]">Solid</TabsTrigger>
                  <TabsTrigger value="linear" className="flex-1 h-6 text-[10px]">Linear</TabsTrigger>
                  <TabsTrigger value="radial" className="flex-1 h-6 text-[10px]">Radial</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Solid Fill */}
              {(styles.fillType === 'solid' || !styles.fillType) && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.fill || "#0d9488"}
                    onChange={(e) => handleStyleChange("fill", e.target.value)}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={styles.fill || "#0d9488"}
                    onChange={(e) => handleStyleChange("fill", e.target.value)}
                    className="h-7 text-xs flex-1 font-mono"
                  />
                </div>
              )}
              
              {/* Gradient Fill */}
              {(styles.fillType === 'linear' || styles.fillType === 'radial') && (
                <GradientBar
                  type={styles.fillType}
                  startColor={styles.gradientStart || "#FF0000"}
                  endColor={styles.gradientEnd || "#0000FF"}
                  angle={parseInt(styles.gradientAngle || "90")}
                  onStartColorChange={(color) => handleStyleChange("gradientStart", color)}
                  onEndColorChange={(color) => handleStyleChange("gradientEnd", color)}
                  onAngleChange={(angle) => handleStyleChange("gradientAngle", String(angle))}
                />
              )}
            </div>
          ) : (
            /* Simple Background for non-shapes */
            <ColorPickerWithVariables
              value={styles.backgroundColor || "#ffffff"}
              onChange={(value) => handleStyleChange("backgroundColor", value)}
              label="Background"
            />
          )}

          {/* Border / Stroke Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">
                {isShape ? 'Stroke' : 'Border'}
              </Label>
              <Switch
                checked={hasBorder || (isShape && parseInt(styles.strokeWidth || '0') > 0)}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    if (isShape) {
                      handleStyleChange("strokeWidth", "2");
                      handleStyleChange("stroke", "#000000");
                      handleStyleChange("borderStyle", "solid");
                    } else {
                      handleStyleChange("border", "2px solid #000000");
                      handleStyleChange("borderWidth", "2");
                      handleStyleChange("borderColor", "#000000");
                      handleStyleChange("borderStyle", "solid");
                    }
                  } else {
                    if (isShape) {
                      handleStyleChange("strokeWidth", "0");
                    } else {
                      handleStyleChange("border", "none");
                      handleStyleChange("borderWidth", "0");
                    }
                  }
                }}
              />
            </div>

            {(hasBorder || (isShape && parseInt(styles.strokeWidth || '0') > 0)) && (
              <div className="space-y-2">
                {/* Border Color and Width */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isShape ? (styles.stroke || "#000000") : borderColor}
                    onChange={(e) => {
                      if (isShape) {
                        handleStyleChange("stroke", e.target.value);
                      } else {
                        handleStyleChange("borderColor", e.target.value);
                        const style = styles.borderStyle || 'solid';
                        handleStyleChange("border", `${borderWidth}px ${style} ${e.target.value}`);
                      }
                    }}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={isShape ? parseInt(styles.strokeWidth || '2') : borderWidth}
                    onChange={(e) => {
                      const width = e.target.value;
                      if (isShape) {
                        handleStyleChange("strokeWidth", width);
                      } else {
                        handleStyleChange("borderWidth", width);
                        const style = styles.borderStyle || 'solid';
                        handleStyleChange("border", `${width}px ${style} ${borderColor}`);
                      }
                    }}
                    className="h-7 text-xs w-14 font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">px</span>
                </div>
                
                {/* Border Style Dropdown */}
                <div className="space-y-1">
                  <Label className="text-[9px] text-muted-foreground">Style</Label>
                  <Select
                    value={styles.borderStyle || 'solid'}
                    onValueChange={(value) => {
                      handleStyleChange("borderStyle", value);
                      if (!isShape) {
                        handleStyleChange("border", `${borderWidth}px ${value} ${borderColor}`);
                      }
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0 border-t-2 border-black" />
                          <span>Solid</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dashed">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0 border-t-2 border-dashed border-black" />
                          <span>Dashed</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dotted">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0 border-t-2 border-dotted border-black" />
                          <span>Dotted</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Corner Radius Section (not for circles or lines) */}
          {!(isShape && (content === 'circle' || content === 'line')) && (
            <CornerRadiusControl
              borderRadius={styles.borderRadius || "0px"}
              borderRadiusIndividual={styles.borderRadiusIndividual}
              onRadiusChange={(value) => handleStyleChange("borderRadius", value)}
              onIndividualChange={(value) => {
                if (value) {
                  handleStyleChange("borderRadiusIndividual", value);
                } else {
                  // Clear individual radius
                  updateBlock(selectedBlock.id, {
                    styles: { ...styles, borderRadiusIndividual: undefined }
                  });
                }
              }}
            />
          )}
        </div>
      </PropertySection>

      <Separator />

      {/* Social Links Section (Social blocks only) */}
      {isSocial && (
        <>
          <PropertySection title="Social Links" icon={<Share2 className="w-3 h-3 text-muted-foreground" />}>
            <div className="space-y-4">
              {/* Icon Size */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Icon Size</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedBlock.socialData?.iconSize || 24}px
                  </span>
                </div>
                <Slider
                  value={[selectedBlock.socialData?.iconSize || 24]}
                  onValueChange={([value]) => handleSocialDataChange({ iconSize: value })}
                  min={16}
                  max={48}
                  step={2}
                  className="w-full"
                />
              </div>

              {/* Spacing */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Spacing</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedBlock.socialData?.gap || 12}px
                  </span>
                </div>
                <Slider
                  value={[selectedBlock.socialData?.gap || 12]}
                  onValueChange={([value]) => handleSocialDataChange({ gap: value })}
                  min={0}
                  max={40}
                  step={4}
                  className="w-full"
                />
              </div>

              {/* Icon Style */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Icon Style</Label>
                <div className="flex gap-1">
                  {(['original', 'circle', 'rounded', 'square'] as const).map((style) => (
                    <Button
                      key={style}
                      variant={selectedBlock.socialData?.iconStyle === style ? "default" : "outline"}
                      size="sm"
                      className="flex-1 h-6 text-[10px] capitalize"
                      onClick={() => handleSocialDataChange({ iconStyle: style })}
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Icon Color */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Icon Color</Label>
                <Select
                  value={selectedBlock.socialData?.iconColor || 'brand'}
                  onValueChange={(value) => handleSocialDataChange({ 
                    iconColor: value as 'brand' | 'mono-dark' | 'mono-light' | 'custom' 
                  })}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand">Brand Colors</SelectItem>
                    <SelectItem value="mono-dark">Monochrome Dark</SelectItem>
                    <SelectItem value="mono-light">Monochrome Light</SelectItem>
                    <SelectItem value="custom">Custom Color</SelectItem>
                  </SelectContent>
                </Select>
                {selectedBlock.socialData?.iconColor === 'custom' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={selectedBlock.socialData?.customColor || '#0d9488'}
                      onChange={(e) => handleSocialDataChange({ customColor: e.target.value })}
                      className="w-8 h-7 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={selectedBlock.socialData?.customColor || '#0d9488'}
                      onChange={(e) => handleSocialDataChange({ customColor: e.target.value })}
                      className="h-7 text-xs font-mono flex-1"
                    />
                  </div>
                )}
              </div>

              <Separator className="my-2" />

              {/* Networks List */}
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground uppercase">Networks</Label>
                {(selectedBlock.socialData?.networks || DEFAULT_SOCIAL_NETWORKS).map((profile) => {
                  const IconComponent = NETWORK_ICONS[profile.network];
                  return (
                    <div key={profile.network} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={profile.enabled}
                          onCheckedChange={(checked) => 
                            handleNetworkChange(profile.network, { enabled: checked })
                          }
                          className="scale-75"
                        />
                        <IconComponent 
                          className="w-4 h-4" 
                          style={{ color: BRAND_COLORS[profile.network] }}
                        />
                        <span className="text-xs flex-1">{NETWORK_NAMES[profile.network]}</span>
                      </div>
                      {profile.enabled && (
                        <div className="ml-8">
                          <div className="flex items-center gap-1">
                            <Link className="w-3 h-3 text-muted-foreground" />
                            <Input
                              type="url"
                              placeholder={`https://${profile.network}.com/username`}
                              value={profile.url}
                              onChange={(e) => 
                                handleNetworkChange(profile.network, { url: e.target.value })
                              }
                              className="h-6 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </PropertySection>

          <Separator />
        </>
      )}

      {/* Table Section (Table blocks only) */}
      {isTable && (
        <>
          <PropertySection title="Table Structure" icon={<Table2 className="w-3 h-3 text-muted-foreground" />}>
            <div className="space-y-4">
              {/* Grid Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {selectedBlock.tableData?.rows || 2} rows × {selectedBlock.tableData?.cols || 2} cols
                </span>
              </div>

              {/* Row Controls */}
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Rows</Label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={handleAddRow}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Row
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={handleRemoveRow}
                    disabled={(selectedBlock.tableData?.rows || 2) <= 1}
                  >
                    <Minus className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </div>
              </div>

              {/* Column Controls */}
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Columns</Label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={handleAddCol}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Col
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={handleRemoveCol}
                    disabled={(selectedBlock.tableData?.cols || 2) <= 1}
                  >
                    <Minus className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </div>
              </div>

              {/* Header Row Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Header Row</Label>
                <Switch
                  checked={selectedBlock.tableData?.hasHeader ?? true}
                  onCheckedChange={(checked) => handleTableDataChange({ hasHeader: checked })}
                />
              </div>

              {/* Border Color */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Border Color</Label>
                <ColorPickerWithVariables
                  value={selectedBlock.tableData?.borderColor || '#e2e8f0'}
                  onChange={(color) => handleTableDataChange({ borderColor: color })}
                />
              </div>
            </div>
          </PropertySection>

          <Separator />
        </>
      )}

      {/* List Section (List blocks only) */}
      {isList && (
        <>
          <PropertySection title="List Options" icon={<List className="w-3 h-3 text-muted-foreground" />}>
            <div className="space-y-4">
              {/* Item Count */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{selectedBlock.listData?.items?.length || 3} items</span>
              </div>

              {/* List Style Selector */}
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Marker Style</Label>
                <div className="flex gap-1">
                  <Button
                    variant={selectedBlock.listData?.style === 'disc' ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => handleListDataChange({ style: 'disc' })}
                  >
                    <Circle className="w-2 h-2 mr-1 fill-current" /> Bullet
                  </Button>
                  <Button
                    variant={selectedBlock.listData?.style === 'decimal' ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => handleListDataChange({ style: 'decimal' })}
                  >
                    1. Number
                  </Button>
                  <Button
                    variant={selectedBlock.listData?.style === 'square' ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => handleListDataChange({ style: 'square' })}
                  >
                    <Square className="w-2 h-2 mr-1 fill-current" /> Square
                  </Button>
                </div>
              </div>

              {/* Add/Remove Items */}
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Items</Label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={handleAddListItem}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={handleRemoveListItem}
                    disabled={(selectedBlock.listData?.items?.length || 3) <= 1}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </div>
              </div>

              {/* Gap / Spacing */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Item Spacing</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {selectedBlock.listData?.gap || 8}px
                  </span>
                </div>
                <Slider
                  value={[selectedBlock.listData?.gap || 8]}
                  onValueChange={([value]) => handleListDataChange({ gap: value })}
                  min={0}
                  max={24}
                  step={2}
                  className="w-full"
                />
              </div>
            </div>
          </PropertySection>

          <Separator />
        </>
      )}

      {/* Constraints Section - Phase 14: Figma-style */}
      <PropertySection title="Constraints" icon={<Anchor className="w-3 h-3 text-muted-foreground" />}>
        <div className="space-y-3">
          {/* Visual Constraint Preview */}
          <div className="relative w-full aspect-square max-w-[120px] mx-auto border border-slate-200 rounded-md bg-slate-50">
            {/* Parent frame */}
            <div className="absolute inset-2 border border-dashed border-slate-300 rounded">
              {/* Child block representation */}
              <div 
                className="absolute bg-primary/20 border border-primary rounded-sm"
                style={{
                  width: '40%',
                  height: '30%',
                  left: selectedBlock.constraints?.horizontal === 'right' ? 'auto' : 
                        selectedBlock.constraints?.horizontal === 'center' ? '30%' : '10%',
                  right: selectedBlock.constraints?.horizontal === 'right' ? '10%' : 'auto',
                  top: selectedBlock.constraints?.vertical === 'bottom' ? 'auto' : 
                       selectedBlock.constraints?.vertical === 'center' ? '35%' : '10%',
                  bottom: selectedBlock.constraints?.vertical === 'bottom' ? '10%' : 'auto',
                }}
              />
            </div>
          </div>
          
          {/* Horizontal Constraint */}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MoveHorizontal className="w-3 h-3" />
              Horizontal
            </Label>
            <Select
              value={selectedBlock.constraints?.horizontal || 'left'}
              onValueChange={(value: 'left' | 'right' | 'center' | 'scale') => {
                updateBlock(selectedBlock.id, { 
                  constraints: { 
                    ...selectedBlock.constraints || { horizontal: 'left', vertical: 'top' },
                    horizontal: value 
                  } 
                });
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Vertical Constraint */}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MoveVertical className="w-3 h-3" />
              Vertical
            </Label>
            <Select
              value={selectedBlock.constraints?.vertical || 'top'}
              onValueChange={(value: 'top' | 'bottom' | 'center' | 'scale') => {
                updateBlock(selectedBlock.id, { 
                  constraints: { 
                    ...selectedBlock.constraints || { horizontal: 'left', vertical: 'top' },
                    vertical: value 
                  } 
                });
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Constraint Help Text */}
          <p className="text-[9px] text-muted-foreground mt-1">
            Resize the canvas edge to see constraints in action
          </p>
        </div>
      </PropertySection>

      <Separator />

      {/* Effects Section */}
      <PropertySection title="Effects" icon={<Sparkles className="w-3 h-3 text-muted-foreground" />}>
        <div className="space-y-3">
          {/* Drop Shadow Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Drop Shadow</Label>
              <Switch
                checked={hasShadow}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    handleStyleChange("boxShadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)");
                  } else {
                    handleStyleChange("boxShadow", "none");
                  }
                }}
              />
            </div>
            {hasShadow && (
              <div className="flex gap-1">
                <Button
                  variant={styles.boxShadow?.includes('0 4px') ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-6 text-[10px]"
                  onClick={() => handleStyleChange("boxShadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)")}
                >
                  Soft
                </Button>
                <Button
                  variant={styles.boxShadow?.includes('0 10px') ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-6 text-[10px]"
                  onClick={() => handleStyleChange("boxShadow", "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)")}
                >
                  Medium
                </Button>
                <Button
                  variant={styles.boxShadow?.includes('0 25px') ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-6 text-[10px]"
                  onClick={() => handleStyleChange("boxShadow", "0 25px 50px -12px rgba(0, 0, 0, 0.25)")}
                >
                  Large
                </Button>
              </div>
            )}
          </div>

          {/* Opacity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Opacity</Label>
              <span className="text-[10px] text-muted-foreground">{opacity}%</span>
            </div>
            <Slider
              value={[opacity]}
              onValueChange={([value]) => handleStyleChange("opacity", String(value / 100))}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </PropertySection>
    </div>
  );
}

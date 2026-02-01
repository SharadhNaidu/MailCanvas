/**
 * TopToolbar Component - "The Ribbon"
 * Phase 10: Tactile Interaction Upgrade
 * 
 * PowerPoint-style ribbon toolbar with menus, tools, zoom, and device preview
 */

"use client";

import { useState } from "react";
import { 
  MousePointer2, 
  Type, 
  Image, 
  Square, 
  Minus,
  SeparatorHorizontal,
  Share2,
  Undo2,
  Redo2,
  Download,
  Upload,
  ChevronDown,
  Mail,
  Save,
  Eye,
  ZoomIn,
  ZoomOut,
  Monitor,
  Smartphone,
  Circle,
  Pen,
  Shapes,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Ruler,
  Grid3X3,
  Table2,
  List,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  useEditorStore, 
  useCanvasSettings, 
  useSelectedBlockIds, 
  useViewport,
  useCanUndo,
  useCanRedo,
  useUndo,
  useRedo,
  useVariables,
} from "@/store/useEditorStore";
import type { BlockType } from "@/types/editor";
import { ExportModal } from "@/components/modals/ExportModal";
import { generateMJML } from "@/utils/mjml-generator";

/**
 * Tool definitions for the center toolbar
 */
const tools: { type: BlockType | 'select'; label: string; icon: React.ReactNode; shortcut?: string }[] = [
  { type: 'select', label: 'Select', icon: <MousePointer2 className="h-4 w-4" />, shortcut: 'V' },
  { type: 'text', label: 'Text', icon: <Type className="h-4 w-4" />, shortcut: 'T' },
  { type: 'image', label: 'Image', icon: <Image className="h-4 w-4" />, shortcut: 'I' },
  { type: 'button', label: 'Button', icon: <Square className="h-4 w-4" />, shortcut: 'B' },
  { type: 'spacer', label: 'Spacer', icon: <Minus className="h-4 w-4" />, shortcut: 'S' },
  { type: 'divider', label: 'Divider', icon: <SeparatorHorizontal className="h-4 w-4" />, shortcut: 'D' },
  { type: 'social', label: 'Social', icon: <Share2 className="h-4 w-4" />, shortcut: 'O' },
  { type: 'table', label: 'Table', icon: <Table2 className="h-4 w-4" />, shortcut: 'G' },
  { type: 'list', label: 'List', icon: <List className="h-4 w-4" />, shortcut: 'L' },
];

export function TopToolbar() {
  const { 
    addBlock, 
    addShape, 
    clearBlocks, 
    blocks, 
    updateCanvasSettings,
    resizeCanvasWithConstraints,
    zoomIn,
    zoomOut,
    resetZoom,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
    distributeHorizontal,
    distributeVertical,
  } = useEditorStore();
  const canvasSettings = useCanvasSettings();
  const selectedBlockIds = useSelectedBlockIds();
  const viewport = useViewport();
  const variables = useVariables();
  
  // Undo/Redo hooks
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const undo = useUndo();
  const redo = useRedo();
  
  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportData, setExportData] = useState<{
    mjml: string;
    html: string;
    errors: string[];
  }>({ mjml: "", html: "", errors: [] });
  
  const hasMultipleSelected = selectedBlockIds.length > 1;
  const canDistribute = selectedBlockIds.length >= 3;

  const handleToolClick = (type: BlockType | 'select') => {
    if (type === 'select') {
      // Select mode - deselect current selection
      useEditorStore.getState().selectBlock(null);
      return;
    }
    addBlock(type);
  };

  /**
   * Handle Export - generates MJML and converts to HTML
   */
  const handleExport = async () => {
    // Dynamic import mjml-browser to avoid SSR issues
    const { default: mjml2html } = await import("mjml-browser");
    
    // Generate MJML from blocks
    const mjmlCode = generateMJML(
      blocks,
      { width: canvasSettings.width, backgroundColor: canvasSettings.backgroundColor },
      variables
    );
    
    // Convert MJML to HTML
    const result = mjml2html(mjmlCode, {
      validationLevel: "soft",
    });
    
    // Extract errors if any
    const errors = result.errors?.map((e: { message: string }) => e.message) || [];
    
    setExportData({
      mjml: mjmlCode,
      html: result.html,
      errors,
    });
    
    setExportModalOpen(true);
  };

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-[60px] bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
        {/* Left Section - Logo & Menus */}
        <div className="flex items-center gap-1">
          {/* Logo */}
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200 mr-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">MailCanvas</span>
          </div>

          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-normal">
                File
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4" />
                New Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Save className="mr-2 h-4 w-4" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export HTML
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearBlocks} className="text-destructive">
                Clear Canvas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-normal">
              Edit
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={undo} disabled={!canUndo}>
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
              <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={redo} disabled={!canRedo}>
              <Redo2 className="mr-2 h-4 w-4" />
              Redo
              <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-normal">
              View
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Preview Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={canvasSettings.showRulers}
              onCheckedChange={(checked) => updateCanvasSettings({ showRulers: checked })}
            >
              <Ruler className="mr-2 h-4 w-4" />
              Show Rulers
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={canvasSettings.showGrid}
              onCheckedChange={(checked) => updateCanvasSettings({ showGrid: checked })}
            >
              <Grid3X3 className="mr-2 h-4 w-4" />
              Show Grid
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Separator */}
      <div className="h-8 w-px bg-slate-200 mx-2" />

      {/* Center Section - Tools */}
      <div className="flex items-center gap-1 flex-1 justify-center">
        <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-0.5">
          {tools.map((tool) => (
            <Button
              key={tool.type}
              variant="ghost"
              size="sm"
              onClick={() => handleToolClick(tool.type)}
              className="h-8 px-3 gap-1.5 hover:bg-white hover:shadow-sm transition-all"
              title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
            >
              {tool.icon}
              <span className="text-xs hidden md:inline">{tool.label}</span>
            </Button>
          ))}
          
          {/* Shapes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-1.5 hover:bg-white hover:shadow-sm transition-all"
                title="Shapes (H)"
              >
                <Shapes className="h-4 w-4" />
                <span className="text-xs hidden md:inline">Shapes</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              <DropdownMenuItem onClick={() => addShape('rectangle')}>
                <Square className="mr-2 h-4 w-4" />
                Rectangle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addShape('circle')}>
                <Circle className="mr-2 h-4 w-4" />
                Circle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addShape('line')}>
                <Minus className="mr-2 h-4 w-4" />
                Line
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Pen Tool (visual placeholder) */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 gap-1.5 hover:bg-white hover:shadow-sm transition-all opacity-50 cursor-not-allowed"
            title="Pen Tool (Coming Soon)"
            disabled
          >
            <Pen className="h-4 w-4" />
            <span className="text-xs hidden md:inline">Pen</span>
          </Button>
        </div>

        {/* Alignment Tools (visible when multiple blocks selected) */}
        {hasMultipleSelected && (
          <>
            <div className="h-8 w-px bg-slate-300 mx-1" />
            <div className="flex items-center bg-blue-50 rounded-lg p-1 gap-0.5 border border-blue-200">
              {/* Horizontal Alignment */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={alignLeft}
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={alignCenter}
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={alignRight}
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>

              <div className="h-5 w-px bg-blue-200 mx-0.5" />

              {/* Vertical Alignment */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={alignTop}
                    title="Align Top"
                  >
                    <AlignStartVertical className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Top</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={alignMiddle}
                    title="Align Middle"
                  >
                    <AlignCenterVertical className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Middle</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={alignBottom}
                    title="Align Bottom"
                  >
                    <AlignEndVertical className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Bottom</TooltipContent>
              </Tooltip>

              {canDistribute && (
                <>
                  <div className="h-5 w-px bg-blue-200 mx-0.5" />

                  {/* Distribution */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-blue-100"
                        onClick={distributeHorizontal}
                        title="Distribute Horizontally"
                      >
                        <AlignHorizontalSpaceAround className="h-4 w-4 text-blue-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Distribute Horizontally</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-blue-100"
                        onClick={distributeVertical}
                        title="Distribute Vertically"
                      >
                        <AlignVerticalSpaceAround className="h-4 w-4 text-blue-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Distribute Vertically</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Section - Zoom & Device Controls */}
        <div className="flex items-center gap-2">
          {/* Width Presets - Phase 14 */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={canvasSettings.width === 320 ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => resizeCanvasWithConstraints(320)}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mobile Width (320px)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={canvasSettings.width === 600 ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => resizeCanvasWithConstraints(600)}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Desktop Width (600px)</TooltipContent>
            </Tooltip>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={zoomOut}
                  disabled={viewport.zoom <= 0.1}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (Ctrl+-)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 min-w-[50px] font-mono text-xs"
                  onClick={resetZoom}
                >
                  {zoomPercent}%
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Zoom (Ctrl+0)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={zoomIn}
                  disabled={viewport.zoom >= 5}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (Ctrl+=)</TooltipContent>
            </Tooltip>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Block Count */}
          <span className="px-2 py-1 bg-slate-100 rounded text-xs text-muted-foreground">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </span>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Export Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5"
                onClick={handleExport}
              >
                <FileCode className="h-4 w-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export to HTML/MJML</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        mjmlCode={exportData.mjml}
        htmlCode={exportData.html}
        errors={exportData.errors}
      />
    </TooltipProvider>
  );
}

/**
 * Rulers Component - "The Measurement System"
 * Phase 10: Tactile Interaction Upgrade
 * 
 * Figma-style rulers for visual positioning reference
 * Syncs with viewport pan & zoom
 * Shows red cursor indicator tracking mouse position
 */

"use client";

import { useEffect, useRef, useState, memo } from "react";
import { useViewport } from "@/store/useEditorStore";
import { useCursor } from "./CursorManager";

/**
 * Ruler dimensions
 */
const RULER_SIZE = 24; // Height for top ruler, width for left ruler
const TICK_SMALL = 5;  // Small tick every 10px
const TICK_MEDIUM = 8; // Medium tick every 50px
const TICK_LARGE = 12; // Large tick every 100px

interface RulersProps {
  showRulers?: boolean;
}

/**
 * Generate tick marks based on viewport and zoom
 */
function generateTicks(
  length: number,
  offset: number,
  zoom: number
): { position: number; value: number; size: 'small' | 'medium' | 'large' }[] {
  const ticks: { position: number; value: number; size: 'small' | 'medium' | 'large' }[] = [];
  
  // Calculate step based on zoom level for readability
  let step = 10;
  if (zoom < 0.25) step = 100;
  else if (zoom < 0.5) step = 50;
  else if (zoom > 2) step = 5;
  
  // Calculate the visible range in canvas coordinates
  const startValue = Math.floor(-offset / zoom / step) * step;
  const endValue = Math.ceil((length - offset) / zoom / step) * step;
  
  for (let value = startValue; value <= endValue; value += step) {
    const position = value * zoom + offset;
    
    // Only include ticks that are visible
    if (position >= 0 && position <= length) {
      let size: 'small' | 'medium' | 'large' = 'small';
      if (value % 100 === 0) {
        size = 'large';
      } else if (value % 50 === 0) {
        size = 'medium';
      }
      
      ticks.push({ position, value, size });
    }
  }
  
  return ticks;
}

/**
 * Top Ruler (Horizontal)
 */
const TopRuler = memo(function TopRuler({ 
  offset, 
  zoom, 
  width,
  mouseX 
}: { 
  offset: number; 
  zoom: number; 
  width: number;
  mouseX: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw ruler using canvas for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = RULER_SIZE * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas with light grey background (Figma style)
    ctx.fillStyle = '#f1f3f4';
    ctx.fillRect(0, 0, width, RULER_SIZE);

    // Draw bottom border
    ctx.strokeStyle = '#d4d7dc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, RULER_SIZE - 0.5);
    ctx.lineTo(width, RULER_SIZE - 0.5);
    ctx.stroke();

    // Generate and draw ticks
    const ticks = generateTicks(width, offset, zoom);
    
    ctx.strokeStyle = '#8b8f96';
    ctx.fillStyle = '#4a4d52';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    ticks.forEach(({ position, value, size }) => {
      const tickHeight = size === 'large' ? TICK_LARGE : size === 'medium' ? TICK_MEDIUM : TICK_SMALL;
      
      ctx.beginPath();
      ctx.moveTo(Math.round(position) + 0.5, RULER_SIZE);
      ctx.lineTo(Math.round(position) + 0.5, RULER_SIZE - tickHeight);
      ctx.stroke();

      // Draw labels for large ticks
      if (size === 'large') {
        ctx.fillText(value.toString(), position, 10);
      }
    });
  }, [offset, zoom, width]);

  // Calculate canvas coordinate from mouse position
  const canvasValue = Math.round((mouseX - RULER_SIZE - offset) / zoom);

  return (
    <div
      className="relative select-none bg-[#f1f3f4] flex-1"
      style={{ height: RULER_SIZE }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: RULER_SIZE, display: 'block' }}
      />
      {/* Red cursor indicator line */}
      {mouseX > RULER_SIZE && (
        <>
          <div
            className="absolute top-0 w-0.5 bg-red-500 pointer-events-none z-10"
            style={{
              left: mouseX - RULER_SIZE,
              height: RULER_SIZE,
            }}
          />
          {/* Coordinate tooltip */}
          <div
            className="absolute -bottom-5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-medium rounded pointer-events-none whitespace-nowrap z-20"
            style={{ 
              left: mouseX - RULER_SIZE,
              transform: 'translateX(-50%)',
            }}
          >
            {canvasValue}
          </div>
        </>
      )}
    </div>
  );
});

/**
 * Left Ruler (Vertical)
 */
const LeftRuler = memo(function LeftRuler({ 
  offset, 
  zoom, 
  height,
  mouseY 
}: { 
  offset: number; 
  zoom: number; 
  height: number;
  mouseY: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw ruler using canvas for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || height <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = RULER_SIZE * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas with light grey background
    ctx.fillStyle = '#f1f3f4';
    ctx.fillRect(0, 0, RULER_SIZE, height);

    // Draw right border
    ctx.strokeStyle = '#d4d7dc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(RULER_SIZE - 0.5, 0);
    ctx.lineTo(RULER_SIZE - 0.5, height);
    ctx.stroke();

    // Generate and draw ticks
    const ticks = generateTicks(height, offset, zoom);
    
    ctx.strokeStyle = '#8b8f96';
    ctx.fillStyle = '#4a4d52';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textBaseline = 'middle';

    ticks.forEach(({ position, value, size }) => {
      const tickWidth = size === 'large' ? TICK_LARGE : size === 'medium' ? TICK_MEDIUM : TICK_SMALL;
      
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE, Math.round(position) + 0.5);
      ctx.lineTo(RULER_SIZE - tickWidth, Math.round(position) + 0.5);
      ctx.stroke();

      // Draw labels for large ticks (rotated)
      if (size === 'large') {
        ctx.save();
        ctx.translate(10, position);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), 0, 0);
        ctx.restore();
      }
    });
  }, [offset, zoom, height]);

  // Calculate canvas coordinate from mouse position
  const canvasValue = Math.round((mouseY - RULER_SIZE - offset) / zoom);

  return (
    <div
      className="relative select-none bg-[#f1f3f4]"
      style={{ width: RULER_SIZE, height: height }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: RULER_SIZE, height: '100%', display: 'block' }}
      />
      {/* Red cursor indicator line */}
      {mouseY > RULER_SIZE && (
        <>
          <div
            className="absolute left-0 h-0.5 bg-red-500 pointer-events-none z-10"
            style={{
              top: mouseY - RULER_SIZE,
              width: RULER_SIZE,
            }}
          />
          {/* Coordinate tooltip */}
          <div
            className="absolute left-7 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-medium rounded pointer-events-none whitespace-nowrap z-20"
            style={{ 
              top: mouseY - RULER_SIZE,
              transform: 'translateY(-50%)',
            }}
          >
            {canvasValue}
          </div>
        </>
      )}
    </div>
  );
});

/**
 * Corner Square (intersection of rulers)
 */
function RulerCorner() {
  return (
    <div
      className="bg-[#f1f3f4] border-r border-b border-[#d4d7dc] flex items-center justify-center flex-shrink-0"
      style={{ width: RULER_SIZE, height: RULER_SIZE }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        className="text-[#8b8f96]"
      >
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}

/**
 * Main Rulers Component
 */
export function Rulers({ showRulers = true }: RulersProps) {
  const viewport = useViewport();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Try to get mouse position from cursor context, fallback to local tracking
  let mouseX = 0;
  let mouseY = 0;
  try {
    const cursor = useCursor();
    mouseX = cursor.mousePosition.x;
    mouseY = cursor.mousePosition.y;
  } catch {
    // If not within CursorManager, use 0
  }

  // Track container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.clientWidth - RULER_SIZE,
            height: parent.clientHeight - RULER_SIZE,
          });
        }
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }

    return () => observer.disconnect();
  }, []);

  if (!showRulers) {
    return null;
  }

  // Calculate ruler offsets based on viewport
  // When viewport.x changes, the ruler should shift accordingly
  const rulerOffsetX = viewport.x + dimensions.width / 2;
  const rulerOffsetY = viewport.y + 32; // Account for initial top offset

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30">
      {/* Top row: Corner + Top Ruler */}
      <div className="absolute top-0 left-0 right-0 flex pointer-events-auto">
        <RulerCorner />
        <TopRuler
          offset={rulerOffsetX}
          zoom={viewport.zoom}
          width={dimensions.width}
          mouseX={mouseX}
        />
      </div>

      {/* Left Ruler */}
      <div className="absolute top-6 left-0 bottom-0 pointer-events-auto">
        <LeftRuler
          offset={rulerOffsetY}
          zoom={viewport.zoom}
          height={dimensions.height}
          mouseY={mouseY}
        />
      </div>
    </div>
  );
}

/**
 * Export ruler size for layout adjustments
 */
export const RULER_THICKNESS = RULER_SIZE;

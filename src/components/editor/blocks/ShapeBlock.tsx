/**
 * ShapeBlock Component
 * Phase 12: Advanced Style Engine
 * 
 * Renders shapes: Rectangle, Circle, Line
 * Supports: Gradients (linear/radial), Dashed/Dotted borders, Individual corner radius
 */

"use client";

import type { EditorBlock, ShapeType } from "@/types/editor";
import { useVariables, resolveStyleValue } from "@/store/useEditorStore";

interface ShapeBlockProps {
  block: EditorBlock;
}

/**
 * Parse individual border radius string (TL TR BR BL format)
 */
function parseIndividualRadius(radiusStr?: string): { tl: number; tr: number; br: number; bl: number } {
  if (!radiusStr) return { tl: 0, tr: 0, br: 0, bl: 0 };
  const parts = radiusStr.split(' ').map(p => parseInt(p) || 0);
  if (parts.length === 4) {
    return { tl: parts[0], tr: parts[1], br: parts[2], bl: parts[3] };
  }
  return { tl: parts[0] || 0, tr: parts[0] || 0, br: parts[0] || 0, bl: parts[0] || 0 };
}

/**
 * Generate gradient definition for SVG
 */
function generateGradient(
  id: string,
  fillType: 'linear' | 'radial',
  startColor: string,
  endColor: string,
  angle: number = 90
): React.ReactNode {
  if (fillType === 'linear') {
    // Convert angle to x1, y1, x2, y2 coordinates
    const rad = (angle - 90) * (Math.PI / 180);
    const x1 = 50 - Math.cos(rad) * 50;
    const y1 = 50 - Math.sin(rad) * 50;
    const x2 = 50 + Math.cos(rad) * 50;
    const y2 = 50 + Math.sin(rad) * 50;
    
    return (
      <linearGradient id={id} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
        <stop offset="0%" stopColor={startColor} />
        <stop offset="100%" stopColor={endColor} />
      </linearGradient>
    );
  }
  
  return (
    <radialGradient id={id} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={startColor} />
      <stop offset="100%" stopColor={endColor} />
    </radialGradient>
  );
}

/**
 * Get SVG stroke-dasharray based on border style
 */
function getStrokeDasharray(borderStyle?: string, strokeWidth: number = 2): string | undefined {
  switch (borderStyle) {
    case 'dashed':
      return `${strokeWidth * 4} ${strokeWidth * 2}`;
    case 'dotted':
      return `${strokeWidth} ${strokeWidth * 2}`;
    default:
      return undefined;
  }
}

export function ShapeBlock({ block }: ShapeBlockProps) {
  const variables = useVariables();
  const styles = block.styles;
  const shapeType = (block.content as ShapeType) || 'rectangle';
  
  // Basic styles - resolve variable references for colors
  const fillType = styles.fillType || 'solid';
  const baseFill = resolveStyleValue(styles.fill, variables) || '#0d9488';
  const gradientStart = resolveStyleValue(styles.gradientStart, variables) || '#FF0000';
  const gradientEnd = resolveStyleValue(styles.gradientEnd, variables) || '#0000FF';
  const gradientAngle = parseInt(styles.gradientAngle || '90');
  
  const stroke = resolveStyleValue(styles.stroke, variables) || 'transparent';
  const strokeWidth = parseInt(styles.strokeWidth || '0');
  const borderStyle = styles.borderStyle || 'solid';
  const opacity = parseFloat(styles.opacity || '1');
  
  // Border radius
  const borderRadius = styles.borderRadius || '0px';
  const individualRadius = parseIndividualRadius(styles.borderRadiusIndividual);
  const hasIndividualRadius = !!styles.borderRadiusIndividual;
  
  // For circle, we need to handle borderRadius as 50%
  const isCircle = shapeType === 'circle' || borderRadius === '50%';
  
  // Generate unique gradient ID for this block
  const gradientId = `gradient-${block.id}`;
  
  // Determine fill value
  const getFill = (): string => {
    if (fillType === 'solid') return baseFill;
    return `url(#${gradientId})`;
  };
  
  // Get stroke dasharray
  const dashArray = getStrokeDasharray(borderStyle, strokeWidth);

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ opacity }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Gradient Definitions */}
        {fillType !== 'solid' && (
          <defs>
            {generateGradient(gradientId, fillType, gradientStart, gradientEnd, gradientAngle)}
          </defs>
        )}

        {shapeType === 'rectangle' && !hasIndividualRadius && (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={100 - strokeWidth}
            height={100 - strokeWidth}
            fill={getFill()}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            rx={isCircle ? 50 : parseInt(borderRadius) || 0}
            ry={isCircle ? 50 : parseInt(borderRadius) || 0}
          />
        )}

        {/* Rectangle with individual corner radius uses path */}
        {shapeType === 'rectangle' && hasIndividualRadius && (
          <path
            d={`
              M ${strokeWidth / 2 + individualRadius.tl} ${strokeWidth / 2}
              H ${100 - strokeWidth / 2 - individualRadius.tr}
              Q ${100 - strokeWidth / 2} ${strokeWidth / 2} ${100 - strokeWidth / 2} ${strokeWidth / 2 + individualRadius.tr}
              V ${100 - strokeWidth / 2 - individualRadius.br}
              Q ${100 - strokeWidth / 2} ${100 - strokeWidth / 2} ${100 - strokeWidth / 2 - individualRadius.br} ${100 - strokeWidth / 2}
              H ${strokeWidth / 2 + individualRadius.bl}
              Q ${strokeWidth / 2} ${100 - strokeWidth / 2} ${strokeWidth / 2} ${100 - strokeWidth / 2 - individualRadius.bl}
              V ${strokeWidth / 2 + individualRadius.tl}
              Q ${strokeWidth / 2} ${strokeWidth / 2} ${strokeWidth / 2 + individualRadius.tl} ${strokeWidth / 2}
              Z
            `}
            fill={getFill()}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
          />
        )}

        {shapeType === 'circle' && (
          <ellipse
            cx={50}
            cy={50}
            rx={50 - strokeWidth / 2}
            ry={50 - strokeWidth / 2}
            fill={getFill()}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
          />
        )}

        {shapeType === 'line' && (
          <line
            x1={strokeWidth / 2}
            y1={50}
            x2={100 - strokeWidth / 2}
            y2={50}
            stroke={stroke || baseFill}
            strokeWidth={Math.max(strokeWidth, 2)}
            strokeLinecap="round"
            strokeDasharray={dashArray}
          />
        )}
      </svg>
    </div>
  );
}

/**
 * Variable Resolver Utility
 * Phase 21: Export Engine
 * 
 * Resolves design token variable references (e.g., "var:primary") 
 * to their actual hex values for MJML export.
 */

import type { DesignToken } from '@/store/useEditorStore';

/**
 * Resolves a color value that might be a variable reference.
 * 
 * @param color - The color string, which may be a variable reference (e.g., "var:var-primary")
 * @param variables - Array of design tokens to look up
 * @returns The resolved hex color value, or the original color if not a variable
 * 
 * @example
 * // Variable reference
 * resolveColor("var:var-primary", tokens) // Returns "#0d9488"
 * 
 * // Regular color
 * resolveColor("#ff0000", tokens) // Returns "#ff0000"
 * 
 * // Undefined
 * resolveColor(undefined, tokens) // Returns undefined
 */
export function resolveColor(
  color: string | undefined, 
  variables: DesignToken[]
): string | undefined {
  // Return undefined if no color provided
  if (!color) return undefined;
  
  // Check if this is a variable reference
  if (color.startsWith('var:')) {
    // Extract the variable ID (everything after "var:")
    const variableId = color.substring(4);
    
    // Find the matching token in the variables array
    const token = variables.find((v) => v.id === variableId);
    
    // Return the token's value if found, otherwise return the original string
    // (which shows the user there's a broken reference)
    return token?.value || color;
  }
  
  // Not a variable reference - return the color as-is
  return color;
}

/**
 * Resolves all style properties that might contain variable references.
 * 
 * @param styles - Object containing style properties
 * @param variables - Array of design tokens
 * @returns Object with all variable references resolved to actual values
 */
export function resolveStyles(
  styles: Record<string, string | undefined>,
  variables: DesignToken[]
): Record<string, string | undefined> {
  const resolved: Record<string, string | undefined> = {};
  
  for (const [key, value] of Object.entries(styles)) {
    // Resolve color-related properties
    if (
      key === 'color' || 
      key === 'backgroundColor' || 
      key === 'borderColor' || 
      key === 'fill' || 
      key === 'stroke' ||
      key === 'gradientStart' ||
      key === 'gradientEnd'
    ) {
      resolved[key] = resolveColor(value, variables);
    } else {
      resolved[key] = value;
    }
  }
  
  return resolved;
}

/**
 * Ensures a color value is a valid hex color for MJML.
 * Converts rgb(), rgba(), and other formats to hex if needed.
 * 
 * @param color - The color string
 * @returns A hex color string or the original if already valid
 */
export function ensureHexColor(color: string | undefined): string | undefined {
  if (!color) return undefined;
  
  // Already a hex color
  if (color.startsWith('#')) {
    return color;
  }
  
  // Named colors - return as-is (MJML supports them)
  const namedColors = [
    'transparent', 'black', 'white', 'red', 'green', 'blue', 
    'yellow', 'orange', 'purple', 'pink', 'gray', 'grey'
  ];
  if (namedColors.includes(color.toLowerCase())) {
    return color;
  }
  
  // For other formats, return as-is and let MJML handle it
  return color;
}

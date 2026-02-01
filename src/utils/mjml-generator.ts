/**
 * MJML Generator (The Compiler)
 * Phase 21: Export Engine
 * 
 * Converts the absolute-positioned canvas blocks into email-compatible MJML code.
 * 
 * Strategy: "The Flow Approximation"
 * 1. Sort blocks by Y coordinate (top to bottom)
 * 2. Stack each block in its own mj-section (vertical flow)
 * 3. Resolve all variable tokens to actual values
 */

import type { EditorBlock, SocialData, TableData, ListData } from '@/types/editor';
import type { DesignToken } from '@/store/useEditorStore';
import { resolveColor, resolveStyles } from './variable-resolver';

/**
 * Canvas settings interface (subset of what we need)
 */
interface CanvasSettings {
  width: number;
  backgroundColor: string;
}

/**
 * Social network brand colors for export
 */
const SOCIAL_BRAND_COLORS: Record<string, string> = {
  x: '#000000',
  linkedin: '#0A66C2',
  facebook: '#1877F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#000000',
  threads: '#000000',
  pinterest: '#E60023',
  snapchat: '#FFFC00',
  whatsapp: '#25D366',
  telegram: '#26A5E4',
  discord: '#5865F2',
  reddit: '#FF4500',
  github: '#181717',
  dribbble: '#EA4C89',
  behance: '#1769FF',
  medium: '#000000',
  twitch: '#9146FF',
  spotify: '#1DB954',
  apple: '#000000',
  email: '#EA4335',
  website: '#6B7280',
};

/**
 * Social network icon URLs (using simple-icons CDN)
 * These are SVG icons that work in email
 * Reserved for future use with custom icon rendering
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SOCIAL_ICON_URLS: Record<string, string> = {
  x: 'https://cdn.simpleicons.org/x/000000',
  linkedin: 'https://cdn.simpleicons.org/linkedin/0A66C2',
  facebook: 'https://cdn.simpleicons.org/facebook/1877F2',
  instagram: 'https://cdn.simpleicons.org/instagram/E4405F',
  youtube: 'https://cdn.simpleicons.org/youtube/FF0000',
  tiktok: 'https://cdn.simpleicons.org/tiktok/000000',
  github: 'https://cdn.simpleicons.org/github/181717',
  twitter: 'https://cdn.simpleicons.org/twitter/1DA1F2',
};

/**
 * Escape HTML entities in text content
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate MJML for a Text block
 */
function generateTextMJML(
  block: EditorBlock,
  variables: DesignToken[]
): string {
  const styles = resolveStyles(block.styles as Record<string, string | undefined>, variables);
  
  const color = styles.color || '#1e293b';
  const fontSize = styles.fontSize || '16px';
  const fontFamily = styles.fontFamily || 'Arial, sans-serif';
  const fontWeight = styles.fontWeight || '400';
  const textAlign = styles.textAlign || 'left';
  const lineHeight = styles.lineHeight || '1.5';
  const padding = styles.padding || '12px';
  
  return `<mj-text 
    color="${color}" 
    font-size="${fontSize}" 
    font-family="${fontFamily}" 
    font-weight="${fontWeight}" 
    align="${textAlign}" 
    line-height="${lineHeight}"
    padding="${padding}"
  >${escapeHtml(block.content)}</mj-text>`;
}

/**
 * Generate MJML for a Button block
 */
function generateButtonMJML(
  block: EditorBlock,
  variables: DesignToken[]
): string {
  const styles = resolveStyles(block.styles as Record<string, string | undefined>, variables);
  
  const backgroundColor = styles.backgroundColor || '#0d9488';
  const color = styles.color || '#ffffff';
  const fontSize = styles.fontSize || '14px';
  const fontFamily = styles.fontFamily || 'Arial, sans-serif';
  const fontWeight = styles.fontWeight || '600';
  const borderRadius = styles.borderRadius || '6px';
  const padding = styles.padding || '12px 24px';
  const href = block.link || '#';
  
  return `<mj-button 
    background-color="${backgroundColor}" 
    color="${color}" 
    font-size="${fontSize}" 
    font-family="${fontFamily}" 
    font-weight="${fontWeight}" 
    border-radius="${borderRadius}" 
    padding="${padding}"
    href="${escapeHtml(href)}"
  >${escapeHtml(block.content)}</mj-button>`;
}

/**
 * Generate MJML for an Image block
 */
function generateImageMJML(
  block: EditorBlock,
  variables: DesignToken[]
): string {
  const styles = resolveStyles(block.styles as Record<string, string | undefined>, variables);
  
  const src = block.content;
  const width = `${block.layout.width}px`;
  const borderRadius = styles.borderRadius || '0px';
  const padding = styles.padding || '0';
  const alt = block.name || 'Image';
  
  // Skip blob URLs (local uploads) - they won't work in emails
  if (src.startsWith('blob:')) {
    return `<mj-text padding="10px" color="#ef4444" font-size="12px">
      [Image: Please replace with a hosted URL]
    </mj-text>`;
  }
  
  return `<mj-image 
    src="${escapeHtml(src)}" 
    width="${width}" 
    border-radius="${borderRadius}"
    padding="${padding}"
    alt="${escapeHtml(alt)}"
  />`;
}

/**
 * Generate MJML for a Spacer block
 */
function generateSpacerMJML(block: EditorBlock): string {
  const height = typeof block.layout.height === 'number' 
    ? `${block.layout.height}px` 
    : '40px';
  
  return `<mj-spacer height="${height}" />`;
}

/**
 * Generate MJML for a Divider block
 */
function generateDividerMJML(
  block: EditorBlock,
  variables: DesignToken[]
): string {
  const styles = resolveStyles(block.styles as Record<string, string | undefined>, variables);
  
  const borderColor = styles.borderColor || '#e2e8f0';
  const borderWidth = styles.borderWidth || '1px';
  
  return `<mj-divider 
    border-color="${borderColor}" 
    border-width="${borderWidth}"
    padding="16px 0"
  />`;
}

/**
 * Generate MJML for a Shape block
 * Note: Email clients have limited shape support, so we approximate with colored divs
 */
function generateShapeMJML(
  block: EditorBlock,
  variables: DesignToken[]
): string {
  const styles = resolveStyles(block.styles as Record<string, string | undefined>, variables);
  const shapeType = block.content; // 'rectangle', 'circle', 'line'
  
  const fill = styles.fill || '#0d9488';
  // Note: width is derived from block.layout but MJML sections are full-width by default
  // For shapes, we use the height for spacing and let MJML handle responsive width
  const height = typeof block.layout.height === 'number' 
    ? `${block.layout.height}px` 
    : '100px';
  const borderRadius = shapeType === 'circle' ? '50%' : (styles.borderRadius || '0px');
  
  if (shapeType === 'line') {
    // Lines become dividers
    return `<mj-divider 
      border-color="${fill}" 
      border-width="${height}"
      padding="0"
    />`;
  }
  
  // Rectangles and circles become colored sections
  return `<mj-section 
    background-color="${fill}" 
    border-radius="${borderRadius}"
    padding="0"
  >
    <mj-column>
      <mj-spacer height="${height}" />
    </mj-column>
  </mj-section>`;
}

/**
 * Generate MJML for a Social block
 */
function generateSocialMJML(
  block: EditorBlock,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variables: DesignToken[]
): string {
  const socialData: SocialData | undefined = block.socialData;
  
  if (!socialData) {
    return `<mj-text>Social links not configured</mj-text>`;
  }
  
  const enabledNetworks = socialData.networks.filter(n => n.enabled);
  
  if (enabledNetworks.length === 0) {
    return `<mj-text color="#9ca3af" font-size="12px">No social icons enabled</mj-text>`;
  }
  
  const iconSize = `${socialData.iconSize || 24}px`;
  const padding = `${Math.round((socialData.gap || 12) / 2)}px`;
  
  // Generate social element for each enabled network (icons only, no text labels)
  const socialElements = enabledNetworks.map(profile => {
    const color = socialData.iconColor === 'brand' 
      ? SOCIAL_BRAND_COLORS[profile.network] || '#6B7280'
      : socialData.iconColor === 'mono-dark' 
        ? '#1F2937'
        : socialData.iconColor === 'mono-light'
          ? '#F9FAFB'
          : socialData.customColor || '#6B7280';
    
    const href = profile.url || '#';
    
    // Use icon-only mode (no text label) to match canvas design
    return `<mj-social-element 
      name="${profile.network}" 
      href="${escapeHtml(href)}"
      icon-size="${iconSize}"
      icon-padding="${padding}"
      background-color="${color}"
    />`;
  }).join('\n      ');
  
  return `<mj-social 
    mode="horizontal" 
    icon-size="${iconSize}"
    icon-padding="${padding}"
    text-mode="false"
  >
      ${socialElements}
    </mj-social>`;
}

/**
 * Generate MJML for a Table block
 */
function generateTableMJML(
  block: EditorBlock,
  variables: DesignToken[]
): string {
  const styles = resolveStyles(block.styles as Record<string, string | undefined>, variables);
  const tableData: TableData | undefined = block.tableData;
  
  if (!tableData || !tableData.data || tableData.data.length === 0) {
    return `<mj-text>Empty table</mj-text>`;
  }
  
  const borderColor = tableData.borderColor || '#e2e8f0';
  const bgColor = styles.backgroundColor || '#ffffff';
  const textColor = styles.color || '#1e293b';
  const fontSize = styles.fontSize || '14px';
  const fontFamily = styles.fontFamily || 'Arial, sans-serif';
  
  // Build HTML table
  const rows = tableData.data.map((row, rowIndex) => {
    const isHeader = tableData.hasHeader && rowIndex === 0;
    const cells = row.map(cell => {
      const tag = isHeader ? 'th' : 'td';
      const style = `
        border: 1px solid ${borderColor}; 
        padding: 8px; 
        text-align: left;
        background-color: ${isHeader ? borderColor : bgColor};
        ${isHeader ? 'font-weight: 600;' : ''}
      `.trim();
      return `<${tag} style="${style}">${escapeHtml(cell)}</${tag}>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('\n        ');
  
  return `<mj-table 
    color="${textColor}"
    font-size="${fontSize}"
    font-family="${fontFamily}"
  >
        ${rows}
    </mj-table>`;
}

/**
 * Generate MJML for a List block
 */
function generateListMJML(
  block: EditorBlock,
  variables: DesignToken[]
): string {
  const styles = resolveStyles(block.styles as Record<string, string | undefined>, variables);
  const listData: ListData | undefined = block.listData;
  
  if (!listData || !listData.items || listData.items.length === 0) {
    return `<mj-text>Empty list</mj-text>`;
  }
  
  const textColor = styles.color || '#1e293b';
  const fontSize = styles.fontSize || '14px';
  const fontFamily = styles.fontFamily || 'Arial, sans-serif';
  const gap = listData.gap || 8;
  
  // Determine list marker
  const markers: Record<string, string> = {
    disc: '&#8226;',      // •
    decimal: '',          // We'll add numbers
    square: '&#9632;',    // ■
  };
  
  const isNumbered = listData.style === 'decimal';
  const marker = markers[listData.style] || '&#8226;';
  
  // Build list items as mj-text
  const listItems = listData.items.map((item, index) => {
    const prefix = isNumbered ? `${index + 1}.` : marker;
    return `${prefix} ${escapeHtml(item)}`;
  }).join(`<br/>`);
  
  return `<mj-text 
    color="${textColor}"
    font-size="${fontSize}"
    font-family="${fontFamily}"
    line-height="${1.5 + (gap / 16)}"
    padding="8px"
  >${listItems}</mj-text>`;
}

/**
 * Generate MJML for a Group block
 * Groups are flattened - we export their children in Y-sorted order
 */
function generateGroupMJML(
  block: EditorBlock,
  allBlocks: EditorBlock[],
  variables: DesignToken[]
): string {
  // Find all children of this group
  const children = allBlocks.filter(b => b.parentId === block.id);
  
  if (children.length === 0) {
    return ''; // Empty group
  }
  
  // Sort children by Y position
  const sorted = [...children].sort((a, b) => a.layout.y - b.layout.y);
  
  // Generate MJML for each child (recursively)
  const childMJML = sorted.map(child => 
    generateBlockMJML(child, allBlocks, variables)
  ).filter(Boolean).join('\n');
  
  return childMJML;
}

/**
 * Generate MJML for a single block (dispatcher)
 */
function generateBlockMJML(
  block: EditorBlock,
  allBlocks: EditorBlock[],
  variables: DesignToken[]
): string {
  // Skip invisible blocks
  if (!block.isVisible) {
    return '';
  }
  
  switch (block.type) {
    case 'text':
      return generateTextMJML(block, variables);
    case 'button':
      return generateButtonMJML(block, variables);
    case 'image':
      return generateImageMJML(block, variables);
    case 'spacer':
      return generateSpacerMJML(block);
    case 'divider':
      return generateDividerMJML(block, variables);
    case 'shape':
      return generateShapeMJML(block, variables);
    case 'social':
      return generateSocialMJML(block, variables);
    case 'table':
      return generateTableMJML(block, variables);
    case 'list':
      return generateListMJML(block, variables);
    case 'group':
      return generateGroupMJML(block, allBlocks, variables);
    default:
      return `<!-- Unknown block type: ${block.type} -->`;
  }
}

/**
 * Wrap a block's MJML in a section/column structure
 */
function wrapInSection(blockMJML: string, block: EditorBlock): string {
  if (!blockMJML.trim()) return '';
  
  // Shapes that generate their own sections shouldn't be wrapped again
  if (block.type === 'shape' && block.content !== 'line') {
    return blockMJML;
  }
  
  // Group children are already sectioned
  if (block.type === 'group') {
    return blockMJML;
  }
  
  return `    <mj-section padding="0">
      <mj-column>
        ${blockMJML}
      </mj-column>
    </mj-section>`;
}

/**
 * Main MJML Generator Function
 * 
 * Converts canvas blocks to MJML source code.
 * 
 * @param blocks - Array of all blocks from the editor
 * @param settings - Canvas settings (width, background color)
 * @param variables - Design tokens for variable resolution
 * @returns Complete MJML document as a string
 */
export function generateMJML(
  blocks: EditorBlock[],
  settings: CanvasSettings,
  variables: DesignToken[]
): string {
  // Filter to only root-level blocks (not children of groups)
  const rootBlocks = blocks.filter(b => !b.parentId);
  
  // Sort by Y coordinate (top to bottom) - THE KEY TO FLOW APPROXIMATION
  const sorted = [...rootBlocks].sort((a, b) => a.layout.y - b.layout.y);
  
  // Generate MJML for each block
  const sectionsContent = sorted
    .map(block => {
      const blockMJML = generateBlockMJML(block, blocks, variables);
      return wrapInSection(blockMJML, block);
    })
    .filter(Boolean)
    .join('\n');
  
  // Resolve canvas background color
  const bgColor = resolveColor(settings.backgroundColor, variables) || '#ffffff';
  
  // Build complete MJML document
  const mjml = `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Arial, Helvetica, sans-serif" />
      <mj-body background-color="${bgColor}" />
    </mj-attributes>
    <mj-style>
      /* Generated by MailCanvas */
      a { color: inherit; text-decoration: none; }
    </mj-style>
  </mj-head>
  <mj-body width="${settings.width}px" background-color="${bgColor}">
${sectionsContent}
  </mj-body>
</mjml>`;
  
  return mjml;
}

/**
 * Export interface for the generator result
 */
export interface ExportResult {
  mjml: string;
  html: string;
  errors: string[];
}

/**
 * MailCanvas Editor Types
 * Phase 15: Hierarchy Engine (Grouping & Nesting)
 * 
 * Defines the data structure for email building blocks with absolute positioning
 */

/**
 * Union type for all supported block types
 * Phase 15: Added 'group' for grouping multiple blocks
 */
export type BlockType = 'text' | 'image' | 'button' | 'spacer' | 'divider' | 'social' | 'shape' | 'group' | 'table' | 'list';

/**
 * Shape types for the shape block
 */
export type ShapeType = 'rectangle' | 'circle' | 'line';

/**
 * Social network types - comprehensive list of popular platforms
 */
export type SocialNetworkType = 
  | 'x'           // X (formerly Twitter)
  | 'linkedin' 
  | 'facebook' 
  | 'instagram' 
  | 'youtube' 
  | 'tiktok' 
  | 'threads'
  | 'pinterest'
  | 'snapchat'
  | 'whatsapp'
  | 'telegram'
  | 'discord'
  | 'reddit'
  | 'github'
  | 'dribbble'
  | 'behance'
  | 'medium'
  | 'twitch'
  | 'spotify'
  | 'apple'
  | 'email'
  | 'website';

/**
 * Social Profile - Individual network configuration
 */
export interface SocialProfile {
  network: SocialNetworkType;
  enabled: boolean;
  url: string;
}

/**
 * Social Data - Configuration for social block
 */
export interface SocialData {
  networks: SocialProfile[];
  iconSize: number;     // 16-48px
  gap: number;          // 0-40px spacing between icons
  iconStyle: 'circle' | 'rounded' | 'square' | 'original';
  iconColor: 'brand' | 'mono-dark' | 'mono-light' | 'custom';
  customColor?: string; // Used when iconColor is 'custom'
}

/**
 * Default social networks configuration
 */
export const DEFAULT_SOCIAL_NETWORKS: SocialProfile[] = [
  { network: 'x', enabled: true, url: '' },
  { network: 'linkedin', enabled: true, url: '' },
  { network: 'facebook', enabled: true, url: '' },
  { network: 'instagram', enabled: true, url: '' },
  { network: 'youtube', enabled: false, url: '' },
  { network: 'tiktok', enabled: false, url: '' },
  { network: 'threads', enabled: false, url: '' },
  { network: 'pinterest', enabled: false, url: '' },
  { network: 'snapchat', enabled: false, url: '' },
  { network: 'whatsapp', enabled: false, url: '' },
  { network: 'telegram', enabled: false, url: '' },
  { network: 'discord', enabled: false, url: '' },
  { network: 'reddit', enabled: false, url: '' },
  { network: 'github', enabled: false, url: '' },
  { network: 'dribbble', enabled: false, url: '' },
  { network: 'behance', enabled: false, url: '' },
  { network: 'medium', enabled: false, url: '' },
  { network: 'twitch', enabled: false, url: '' },
  { network: 'spotify', enabled: false, url: '' },
  { network: 'apple', enabled: false, url: '' },
  { network: 'email', enabled: false, url: '' },
  { network: 'website', enabled: false, url: '' },
];

/**
 * Default social data
 */
export const DEFAULT_SOCIAL_DATA: SocialData = {
  networks: DEFAULT_SOCIAL_NETWORKS,
  iconSize: 24,
  gap: 12,
  iconStyle: 'original',
  iconColor: 'brand',
};

/**
 * Table Data - Configuration for table block
 */
export interface TableData {
  rows: number;
  cols: number;
  data: string[][]; // 2D array of cell content
  hasHeader: boolean;
  borderColor: string;
}

/**
 * List Data - Configuration for list block
 */
export interface ListData {
  items: string[]; // Array of list items
  style: 'disc' | 'decimal' | 'square'; // Bullet vs Number
  gap: number; // Spacing between items in px
}

/**
 * Default table data (2x2 grid)
 */
export const DEFAULT_TABLE_DATA: TableData = {
  rows: 2,
  cols: 2,
  data: [
    ['Header 1', 'Header 2'],
    ['Cell 1', 'Cell 2'],
  ],
  hasHeader: true,
  borderColor: '#e2e8f0',
};

/**
 * Default list data (3 items)
 */
export const DEFAULT_LIST_DATA: ListData = {
  items: ['First item', 'Second item', 'Third item'],
  style: 'disc',
  gap: 8,
};

/**
 * Layout Interface - Position and dimensions for free-form canvas
 */
export interface BlockLayout {
  x: number;       // Distance from left (px)
  y: number;       // Distance from top (px)
  width: number;   // Width (px)
  height: number | 'auto'; // Height (px or auto)
  zIndex: number;  // Layer order
}

/**
 * Advanced Block Styles Interface
 * Phase 12: Advanced Style Engine
 */
export interface BlockStyles {
  // Typography
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string;
  
  // Text Sizing Mode (auto = grows with content, fixed = wraps text)
  textAutoSize?: 'auto' | 'fixed';
  
  // Appearance - Basic
  backgroundColor?: string;
  opacity?: string;
  
  // Appearance - Advanced Fill (Phase 12)
  fillType?: 'solid' | 'linear' | 'radial';
  gradient?: string;  // CSS gradient string e.g., 'linear-gradient(90deg, #FF0000 0%, #0000FF 100%)'
  gradientStart?: string;  // Start color for gradient
  gradientEnd?: string;    // End color for gradient
  gradientAngle?: string;  // Angle for linear gradient (degrees)
  
  // Border & Effects - Basic
  borderRadius?: string;
  border?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
  
  // Border - Advanced (Phase 12)
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadiusIndividual?: string;  // Format: '10px 0px 10px 0px' (TL TR BR BL)
  
  // Layout
  padding?: string;
  margin?: string;
  
  // Shape-specific
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  
  // Other
  [key: string]: string | undefined;
}

/**
 * EditorBlock Interface
 * Represents a single draggable block in the email editor
 */
export interface EditorBlock {
  /** Unique identifier for the block */
  id: string;
  
  /** Type of the block - determines rendering and editing behavior */
  type: BlockType;
  
  /** Content of the block - text content, image URL, or shape type */
  content: string;
  
  /** CSS styles applied to the block */
  styles: BlockStyles;
  
  /** Layout for free-form positioning */
  layout: BlockLayout;
  
  /** Display name for the Layers panel (e.g., "Text Layer 1") */
  name: string;
  
  /** Whether the block is locked from editing */
  isLocked: boolean;
  
  /** Whether the block is visible on the canvas */
  isVisible: boolean;
  
  /** Parent block ID for grouping (null if top-level) */
  parentId: string | null;
  
  /** Social block data (only for type: 'social') */
  socialData?: SocialData;
  
  /** Table block data (only for type: 'table') */
  tableData?: TableData;
  
  /** List block data (only for type: 'list') */
  listData?: ListData;
  
  /** Responsive behavior mode (Phase 13 - deprecated, use constraints) */
  responsiveMode?: 'fixed' | 'scale';
  
  /** Original desktop layout (stored when switching to mobile, restored when switching back) */
  desktopLayout?: BlockLayout;
  
  /** Link URL for button blocks */
  link?: string;
  
  /** Figma-style constraints for responsive behavior (Phase 14) */
  constraints: {
    horizontal: 'left' | 'right' | 'center' | 'scale';
    vertical: 'top' | 'bottom' | 'center' | 'scale';
  };
}

/**
 * Default names for each block type (used with counter)
 */
export const DEFAULT_BLOCK_NAMES: Record<BlockType, string> = {
  text: 'Text Layer',
  image: 'Image Layer',
  button: 'Button Layer',
  spacer: 'Spacer',
  divider: 'Divider',
  social: 'Social Links',
  shape: 'Shape',
  group: 'Group',
  table: 'Table',
  list: 'List',
};

/**
 * Default styles for each block type
 */
export const DEFAULT_BLOCK_STYLES: Record<BlockType, BlockStyles> = {
  text: {
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
    color: '#1e293b',
    textAlign: 'left',
    padding: '12px',
    lineHeight: '1.5',
    letterSpacing: '0em',
    opacity: '1',
    textAutoSize: 'fixed',
  },
  image: {
    padding: '0',
    borderRadius: '0px',
    opacity: '1',
  },
  button: {
    backgroundColor: '#0d9488',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
    opacity: '1',
  },
  spacer: {
    padding: '0',
    opacity: '1',
  },
  divider: {
    borderTop: '1px solid #e2e8f0',
    margin: '16px 0',
    padding: '0',
    opacity: '1',
  },
  social: {
    textAlign: 'center',
    padding: '16px',
    opacity: '1',
  },
  shape: {
    fill: '#0d9488',
    stroke: '#000000',
    strokeWidth: '0',
    borderRadius: '0px',
    opacity: '1',
  },
  group: {
    opacity: '1',
  },
  table: {
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    padding: '8px',
    opacity: '1',
  },
  list: {
    color: '#1e293b',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    padding: '8px',
    opacity: '1',
  },
};

/**
 * Default content for each block type
 */
export const DEFAULT_BLOCK_CONTENT: Record<BlockType, string> = {
  text: 'Hello World! Start typing your content here...',
  image: 'https://placehold.co/600x200/0d9488/ffffff?text=MailCanvas+Image',
  button: 'Click Me',
  spacer: '',
  divider: '',
  social: 'twitter,linkedin,facebook',
  shape: 'rectangle',
  group: '',
  table: '',
  list: '',
};

/**
 * Default layout dimensions for each block type
 */
export const DEFAULT_BLOCK_LAYOUT: Record<BlockType, { width: number; height: number | 'auto' }> = {
  text: { width: 300, height: 'auto' },
  image: { width: 400, height: 200 },
  button: { width: 150, height: 48 },
  spacer: { width: 200, height: 40 },
  divider: { width: 400, height: 2 },
  social: { width: 200, height: 60 },
  shape: { width: 120, height: 120 },
  group: { width: 200, height: 200 },
  table: { width: 300, height: 'auto' },
  list: { width: 250, height: 'auto' },
};

/**
 * Available Google Fonts
 */
export const GOOGLE_FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Roboto Mono', value: 'Roboto Mono, monospace' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
] as const;

/**
 * Font weight options
 */
export const FONT_WEIGHTS = [
  { name: 'Light', value: '300' },
  { name: 'Regular', value: '400' },
  { name: 'Medium', value: '500' },
  { name: 'Semi Bold', value: '600' },
  { name: 'Bold', value: '700' },
  { name: 'Extra Bold', value: '800' },
] as const;

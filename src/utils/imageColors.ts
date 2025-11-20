/**
 * Professional color extraction utility for images
 * Extracts dominant colors and creates personalized gradients
 */

export interface ExtractedColors {
  primary: string;
  secondary: string;
  tertiary: string;
  dominant: string;
  vibrant: string;
  muted: string;
}

export interface GradientColors {
  colors: string[];
  locations: number[];
}

/**
 * Converts RGB values to RGBA string
 */
function rgbToRgba(r: number, g: number, b: number, alpha: number = 1): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates the luminance of a color (for accessibility)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Adjusts color brightness
 */
function adjustBrightness(r: number, g: number, b: number, factor: number): { r: number; g: number; b: number } {
  return {
    r: Math.max(0, Math.min(255, r * factor)),
    g: Math.max(0, Math.min(255, g * factor)),
    b: Math.max(0, Math.min(255, b * factor)),
  };
}

/**
 * Creates a gradient from extracted colors that transitions to black
 */
export function createGradientFromColors(extractedColors: ExtractedColors): GradientColors {
  const { primary, secondary, vibrant, dominant } = extractedColors;

  // Parse colors
  const primaryRgb = hexToRgb(primary) || hexToRgb(dominant) || { r: 186, g: 85, b: 211 };
  const secondaryRgb = hexToRgb(secondary) || primaryRgb;
  const vibrantRgb = hexToRgb(vibrant) || primaryRgb;

  // Create gradient stops with varying opacity
  // Start with vibrant/primary colors at high opacity
  // Gradually transition to darker versions and finally to black
  const dark1 = adjustBrightness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.3);
  const dark2 = adjustBrightness(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.15);
  
  const colors = [
    rgbToRgba(vibrantRgb.r, vibrantRgb.g, vibrantRgb.b, 0.9), // Top: vibrant color
    rgbToRgba(primaryRgb.r, primaryRgb.g, primaryRgb.b, 0.8), // Slightly darker
    rgbToRgba(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b, 0.6), // More muted
    rgbToRgba(dark1.r, dark1.g, dark1.b, 1), // Dark version
    rgbToRgba(dark2.r, dark2.g, dark2.b, 1), // Very dark
    rgbToRgba(10, 10, 10, 1), // Near black
    rgbToRgba(0, 0, 0, 1), // Pure black
  ];

  // Smooth gradient locations
  const locations = [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1];

  return { colors, locations };
}

/**
 * Fallback gradient presets (used when color extraction fails)
 */
const FALLBACK_GRADIENTS: GradientColors[] = [
  {
    colors: [
      'rgba(186, 85, 211, 0.9)',
      'rgba(75, 0, 130, 0.6)',
      'rgba(10, 0, 15, 0.7)',
      'rgba(0, 0, 0, 0.92)',
      'rgba(0, 0, 0, 0.97)',
      'rgba(0, 0, 0, 0.993)',
      'rgba(0, 0, 0, 1)',
    ],
    locations: [0, 0.2, 0.5, 0.75, 0.9, 0.97, 1],
  },
  {
    colors: [
      'rgba(0, 191, 255, 0.9)',
      'rgba(0, 100, 200, 0.6)',
      'rgba(0, 10, 20, 0.7)',
      'rgba(0, 0, 0, 0.92)',
      'rgba(0, 0, 0, 0.97)',
      'rgba(0, 0, 0, 0.993)',
      'rgba(0, 0, 0, 1)',
    ],
    locations: [0, 0.2, 0.5, 0.75, 0.9, 0.97, 1],
  },
];

/**
 * Gets a fallback gradient based on echoId hash
 */
export function getFallbackGradient(echoId?: string): GradientColors {
  if (!echoId) return FALLBACK_GRADIENTS[0];

  const hash = echoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % FALLBACK_GRADIENTS.length;
  return FALLBACK_GRADIENTS[index];
}


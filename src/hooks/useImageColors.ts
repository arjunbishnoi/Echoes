import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { ExtractedColors } from '@/utils/imageColors';

interface UseImageColorsResult {
  colors: ExtractedColors | null;
  isLoading: boolean;
  error: Error | null;
}

// Dynamically import react-native-image-colors to handle cases where it might not be available
let getColors: ((uri: string, options?: any) => Promise<any>) | null = null;

try {
  // Try to import the library - it might not be available in Expo Go
  const imageColorsModule = require('react-native-image-colors');
  getColors = imageColorsModule.getColors;
} catch {
  // Library not available - will use fallback
  getColors = null;
}

/**
 * Professional hook to extract dominant colors from an image
 * Uses react-native-image-colors for cross-platform color extraction
 * Falls back gracefully if the library is not available
 */
export function useImageColors(imageUrl: string | undefined): UseImageColorsResult {
  const [colors, setColors] = useState<ExtractedColors | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when imageUrl changes
    setColors(null);
    setError(null);
    setIsLoading(false);

    if (!imageUrl || !getColors) {
      // Library not available or no image URL - use fallback
      return;
    }

    let isCancelled = false;

    const extractColors = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getColors!(imageUrl, {
          fallback: '#000000',
          cache: true,
          key: imageUrl,
        });

        if (isCancelled) return;

        // Extract colors based on platform
        // iOS provides more detailed color information
        // Android provides dominant and vibrant colors
        const extractedColors: ExtractedColors = {
          dominant: result.dominant || '#000000',
          primary: Platform.OS === 'ios' ? (result.primary || result.dominant || '#000000') : (result.dominant || '#000000'),
          secondary: Platform.OS === 'ios' ? (result.secondary || result.dominant || '#000000') : (result.dominant || '#000000'),
          tertiary: Platform.OS === 'ios' ? (result.detail || result.dominant || '#000000') : (result.dominant || '#000000'),
          vibrant: result.vibrant || result.dominant || '#000000',
          muted: result.muted || result.dominant || '#000000',
        };

        setColors(extractedColors);
      } catch (err) {
        // Silently handle errors - fallback will be used
        if (!isCancelled && err instanceof Error) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    extractColors();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  return { colors, isLoading, error };
}


/**
 * Image utilities for handling user uploads and optimization
 */

interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  format?: string;
  size?: number;
}

interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1920;
const DEFAULT_QUALITY = 0.8;

/**
 * Validates an image file for upload
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Unsupported format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}` 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  return { 
    isValid: true, 
    format: file.type,
    size: file.size 
  };
}

/**
 * Processes an image file with optional optimization
 */
export async function processImageFile(
  file: File, 
  options: ImageProcessingOptions = {}
): Promise<File> {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    format
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        const { width: newWidth, height: newHeight } = calculateOptimalDimensions(
          img.naturalWidth,
          img.naturalHeight,
          maxWidth,
          maxHeight
        );

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File(
                [blob], 
                file.name, 
                { 
                  type: format ? `image/${format}` : file.type,
                  lastModified: Date.now()
                }
              );
              resolve(processedFile);
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          format ? `image/${format}` : file.type,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculates optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (originalWidth > originalHeight) {
    const width = Math.min(maxWidth, originalWidth);
    const height = Math.round(width / aspectRatio);
    return { width, height: Math.min(height, maxHeight) };
  } else {
    const height = Math.min(maxHeight, originalHeight);
    const width = Math.round(height * aspectRatio);
    return { width: Math.min(width, maxWidth), height };
  }
}

/**
 * Creates a preview URL for an image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes a preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Detects if an image URL is from user uploads (vs static assets)
 */
export function isUserUploadedImage(src: string): boolean {
  return src.includes('lovable-uploads') || 
         src.includes('supabase') ||
         src.startsWith('blob:') ||
         src.startsWith('data:');
}

/**
 * Gets appropriate loading strategy for image
 */
export function getImageLoadingStrategy(src: string, isAboveFold: boolean = false): {
  priority: boolean;
  loading: 'eager' | 'lazy';
} {
  // User uploaded images should be handled more carefully
  if (isUserUploadedImage(src)) {
    return {
      priority: isAboveFold,
      loading: isAboveFold ? 'eager' : 'lazy'
    };
  }

  // Static assets can be more aggressive
  return {
    priority: isAboveFold,
    loading: isAboveFold ? 'eager' : 'lazy'
  };
}
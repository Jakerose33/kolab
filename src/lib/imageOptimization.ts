// Image optimization utilities
export interface ImageOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export const ImageSizes = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 200 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  hero: { width: 1920, height: 1080 },
} as const;

export class ImageOptimizer {
  static async compressImage(
    file: File,
    options: ImageOptions = {}
  ): Promise<File> {
    const {
      quality = 0.8,
      maxWidth = 1200,
      maxHeight = 800,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const { width: newWidth, height: newHeight } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'));
              return;
            }
            
            const compressedFile = new File(
              [blob],
              `${file.name.split('.')[0]}.${format}`,
              { type: `image/${format}` }
            );
            
            resolve(compressedFile);
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Could not load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  static generateSrcSet(baseUrl: string, sizes: Array<{ width: number; suffix: string }>): string {
    return sizes
      .map(({ width, suffix }) => `${baseUrl}${suffix} ${width}w`)
      .join(', ');
  }

  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File too large. Maximum size is 10MB.'
      };
    }

    return { isValid: true };
  }

  static async createThumbnail(file: File): Promise<string> {
    const compressed = await this.compressImage(file, {
      maxWidth: ImageSizes.thumbnail.width,
      maxHeight: ImageSizes.thumbnail.height,
      quality: 0.7
    });

    return URL.createObjectURL(compressed);
  }
}

// React hook for image optimization
export function useImageOptimization() {
  const optimizeImage = async (file: File, options?: ImageOptions): Promise<File> => {
    const validation = ImageOptimizer.validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return ImageOptimizer.compressImage(file, options);
  };

  const createThumbnail = async (file: File): Promise<string> => {
    return ImageOptimizer.createThumbnail(file);
  };

  return {
    optimizeImage,
    createThumbnail,
    validateImage: ImageOptimizer.validateImageFile,
    ImageSizes,
  };
}
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { processImageFile, validateImageFile, getImageLoadingStrategy } from '@/lib/imageUtils';

interface UseImageUploadOptions {
  bucket?: string;
  folder?: string;
  optimize?: boolean;
  debug?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

export function useImageUpload({
  bucket = 'images',
  folder,
  optimize = true,
  debug = false
}: UseImageUploadOptions = {}) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    url: null
  });

  const log = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`[useImageUpload] ${message}`, data || '');
    }
  }, [debug]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    log('Starting upload', { fileName: file.name, size: file.size });

    setState({
      isUploading: true,
      progress: 0,
      error: null,
      url: null
    });

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      setState(prev => ({ ...prev, progress: 20 }));

      // Process image if optimization is enabled
      let fileToUpload = file;
      if (optimize) {
        log('Optimizing image...');
        fileToUpload = await processImageFile(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85
        });
        log('Image optimized', { 
          originalSize: file.size, 
          optimizedSize: fileToUpload.size 
        });
      }

      setState(prev => ({ ...prev, progress: 50 }));

      // Generate file path
      const timestamp = Date.now();
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      log('Uploading to Supabase', { bucket, filePath });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      setState(prev => ({ ...prev, progress: 80 }));

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      log('Upload completed', { publicUrl });

      setState({
        isUploading: false,
        progress: 100,
        error: null,
        url: publicUrl
      });

      return publicUrl;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      log('Upload failed', { error: errorMessage });
      
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        url: null
      });

      return null;
    }
  }, [bucket, folder, optimize, log]);

  const deleteImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const filePath = pathParts.slice(-1)[0]; // Get the last part (filename)

      log('Deleting image', { filePath });

      const { error } = await supabase.storage
        .from(bucket)
        .remove([folder ? `${folder}/${filePath}` : filePath]);

      if (error) {
        throw error;
      }

      log('Image deleted successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      log('Delete failed', { error: errorMessage });
      return false;
    }
  }, [bucket, folder, log]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      url: null
    });
  }, []);

  return {
    ...state,
    uploadImage,
    deleteImage,
    reset
  };
}
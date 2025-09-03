import { useState, useCallback, useRef } from 'react';
import { UnifiedImage } from './UnifiedImage';
import { processImageFile, validateImageFile, createImagePreview, revokeImagePreview } from '@/lib/imageUtils';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  accept?: string;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  debug?: boolean;
}

interface UploadState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  preview: string | null;
  file: File | null;
}

export function ImageUploader({
  onImageSelect,
  onImageRemove,
  currentImage,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
  debug = false
}: ImageUploaderProps) {
  const [state, setState] = useState<UploadState>({
    isProcessing: false,
    progress: 0,
    error: null,
    preview: null,
    file: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const log = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`[ImageUploader] ${message}`, data || '');
    }
  }, [debug]);

  const resetState = useCallback(() => {
    if (state.preview) {
      revokeImagePreview(state.preview);
    }
    setState({
      isProcessing: false,
      progress: 0,
      error: null,
      preview: null,
      file: null
    });
  }, [state.preview]);

  const handleFileSelect = useCallback(async (file: File) => {
    log('File selected', { name: file.name, type: file.type, size: file.size });
    
    // Reset previous state
    resetState();

    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 10,
      error: null
    }));

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      setState(prev => ({ ...prev, progress: 30 }));

      // Create preview
      const previewUrl = createImagePreview(file);
      log('Preview created', { url: previewUrl });

      setState(prev => ({ 
        ...prev, 
        preview: previewUrl,
        file,
        progress: 60 
      }));

      // Process image (resize/optimize if needed)
      const processedFile = await processImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85
      });

      log('Image processed', { 
        originalSize: file.size, 
        processedSize: processedFile.size,
        compression: ((file.size - processedFile.size) / file.size * 100).toFixed(1) + '%'
      });

      setState(prev => ({ ...prev, progress: 90 }));

      // Notify parent component
      onImageSelect(processedFile);

      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        progress: 100,
        file: processedFile
      }));

      log('Upload completed successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      log('Upload failed', { error: errorMessage });
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        error: errorMessage
      }));
    }
  }, [onImageSelect, log, resetState]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && !disabled) {
      handleFileSelect(file);
    }
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleRemove = useCallback(() => {
    log('Image removed');
    resetState();
    onImageRemove?.();
  }, [resetState, onImageRemove, log]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const displayImage = state.preview || currentImage;
  const showUploadArea = !displayImage;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload area or image preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {showUploadArea ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={!disabled ? triggerFileInput : undefined}
              className={cn(
                'relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors',
                !disabled && 'hover:border-primary/50 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Upload an image</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPEG, PNG, WebP, GIF (max {Math.round(maxSize / 1024 / 1024)}MB)
                  </p>
                </div>

                {!disabled && (
                  <Button type="button" variant="outline" size="sm">
                    Choose File
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative group">
              <UnifiedImage
                src={displayImage}
                alt="Uploaded image"
                className="w-full h-64"
                aspectRatio="16/9"
                priority={true}
                debug={debug}
              />
              
              {/* Remove button */}
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Processing overlay */}
              {state.isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 min-w-48">
                    <div className="text-center space-y-2">
                      <div className="text-sm font-medium">Processing image...</div>
                      <Progress value={state.progress} className="w-full" />
                      <div className="text-xs text-muted-foreground">{state.progress}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success indicator */}
              {state.file && !state.isProcessing && !state.error && (
                <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error display */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Debug info */}
      {debug && state.file && (
        <Alert>
          <AlertDescription>
            <div className="text-xs space-y-1">
              <div><strong>Original:</strong> {(state.file.size / 1024).toFixed(1)}KB</div>
              <div><strong>Type:</strong> {state.file.type}</div>
              <div><strong>Name:</strong> {state.file.name}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
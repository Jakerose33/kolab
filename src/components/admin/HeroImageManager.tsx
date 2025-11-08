import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/ImageUploader';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';
import { Loader2, Save, Upload } from 'lucide-react';

export function HeroImageManager() {
  const { getSetting, updateSetting, loading } = useSiteSettings();
  const [imageUrl, setImageUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');

  // Get current hero image URL
  const currentHeroUrl = getSetting('hero_image_url', '/src/assets/hero-boiler-room.jpg');

  React.useEffect(() => {
    if (!loading) {
      setImageUrl(currentHeroUrl);
    }
  }, [currentHeroUrl, loading]);

  const handleSave = async () => {
    if (!imageUrl.trim()) {
      toast.error('Please provide an image URL');
      return;
    }

    setIsUpdating(true);
    try {
      await updateSetting('hero_image_url', imageUrl);
      toast.success('Hero image updated successfully!');
    } catch (error) {
      console.error('Error updating hero image:', error);
      toast.error('Failed to update hero image');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    toast.success('Image uploaded! Click Save to apply changes.');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Hero Background Image
        </CardTitle>
        <CardDescription>
          Upload or set a URL for the main hero background image on the homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Image Preview */}
        <div>
          <Label className="text-sm font-medium">Current Hero Image</Label>
          <div className="mt-2 relative rounded-lg overflow-hidden bg-muted">
            <img
              src={currentHeroUrl}
              alt="Current hero background"
              className="w-full h-48 object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-lg font-semibold">Discover events. Grow your scene.</p>
            </div>
          </div>
        </div>

        {/* Upload Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={uploadMode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('url')}
          >
            Image URL
          </Button>
          <Button
            variant={uploadMode === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('upload')}
          >
            Upload Image
          </Button>
        </div>

        {/* URL Input */}
        {uploadMode === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="hero-url">Image URL</Label>
            <Input
              id="hero-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        )}

        {/* Image Uploader */}
        {uploadMode === 'upload' && (
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <ImageUploader
              onImageSelect={(file) => {
                // Convert file to URL for preview
                const url = URL.createObjectURL(file);
                handleImageUpload(url);
              }}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isUpdating || !imageUrl.trim()}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Hero Image
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
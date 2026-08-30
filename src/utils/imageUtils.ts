/**
 * Converts a standard File or Blob (JPEG, PNG, GIF, BMP, etc.)
 * to a lightweight, modern WebP data URL or Blob.
 * 
 * Features:
 * - Browser-native Canvas WebP encoding
 * - Automatic resizing (max dimension constraint) to avoid huge memory/DOM payloads
 * - High-efficiency compression (default 82% quality)
 * - Fallback to standard data URL if WebP is unsupported
 */
export async function convertImageToWebP(
  file: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<{ dataUrl: string; originalSize: number; optimizedSize: number; compressionRatio: number }> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const rawUrl = readerEvent.target?.result as string;
          return resolve({
            dataUrl: rawUrl,
            originalSize,
            optimizedSize: originalSize,
            compressionRatio: 0,
          });
        }

        // Draw image onto canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format
        try {
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          // Calculate approx base64 size
          const head = 'data:image/webp;base64,';
          const base64Length = webpDataUrl.startsWith(head) ? webpDataUrl.length - head.length : webpDataUrl.length;
          const optimizedSize = Math.round((base64Length * 3) / 4);
          const compressionRatio = originalSize > 0 ? Math.round(((originalSize - optimizedSize) / originalSize) * 100) : 0;

          resolve({
            dataUrl: webpDataUrl,
            originalSize,
            optimizedSize,
            compressionRatio: Math.max(0, compressionRatio),
          });
        } catch {
          // Fallback to original
          resolve({
            dataUrl: readerEvent.target?.result as string,
            originalSize,
            optimizedSize: originalSize,
            compressionRatio: 0,
          });
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file for optimization'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file buffer'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Ensures an image URL uses modern formatting parameters (such as auto=format&fit=crop for Unsplash/Cloudinary)
 */
export function getOptimizedImageUrl(url: string | undefined, defaultFallback = '/logo.png'): string {
  if (!url) return defaultFallback;

  // If already a data URL or local asset
  if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:')) {
    return url;
  }

  // Unsplash dynamic WebP format
  if (url.includes('images.unsplash.com') && !url.includes('fm=webp') && !url.includes('auto=format')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=format&fm=webp&q=80`;
  }

  return url;
}

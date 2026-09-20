/**
 * Compresses an image file if it exceeds the maximum size (or to optimize upload speed).
 * Automatically scales down massive camera/poster resolutions and encodes to high-quality WebP/JPEG.
 * 
 * @param {File} file - The file to compress.
 * @param {number} maxSizeBytes - Target max size in bytes (default 8MB to stay safely under Cloudinary 10MB limit).
 * @returns {Promise<File>} - The optimized file.
 */
export async function compressImageIfNeeded(file, maxSizeBytes = 8 * 1024 * 1024) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // Skip SVGs and animated GIFs to preserve vector scalability and animations
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If already under 4MB, no need to compress
  if (file.size <= 4 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      const maxDimension = 2560; // 2.5K max dimension for ultra-sharp crisp display

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output mime type - WebP is superior for high compression with alpha support
      const outputFormat = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
      let quality = 0.88;

      const attemptCompression = (currentQuality) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            if (blob.size > maxSizeBytes && currentQuality > 0.4) {
              attemptCompression(currentQuality - 0.15);
            } else {
              const extension = outputFormat === 'image/webp' ? '.webp' : '.jpg';
              const cleanName = file.name.replace(/\.[^/.]+$/, "") + extension;
              const compressedFile = new File([blob], cleanName, {
                type: outputFormat,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }
          },
          outputFormat,
          currentQuality
        );
      };

      attemptCompression(quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

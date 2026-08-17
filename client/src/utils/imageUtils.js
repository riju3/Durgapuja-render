/**
 * Automatically applies Cloudinary format and quality optimization (f_auto, q_auto)
 * to Cloudinary CDN URLs without changing image dimensions, cropping, or layout aspect ratios.
 */
export const getOptimizedImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('f_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  return url;
};

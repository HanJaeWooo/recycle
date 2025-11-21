/**
 * Cloudinary configuration for serving videos and images
 */

// Cloudinary cloud name
const CLOUDINARY_CLOUD_NAME = 'dahlpf7fr';

// Base URL for Cloudinary videos
export const CLOUDINARY_VIDEO_BASE_URL = `https://res.cloudinary.com/$dahlpf7fr/video/upload/`;

// Base URL for Cloudinary images
export const CLOUDINARY_IMAGE_BASE_URL = `https://res.cloudinary.com/$dahlpf7fr/image/upload/`;

/**
 * Generate Cloudinary video URL
 * @param publicId - The public ID of the video in Cloudinary (e.g., "v1762350365/gw1jln")
 * @param transformations - Optional Cloudinary transformations (e.g., "q_auto,f_auto")
 * @returns Full Cloudinary URL
 */
export function getCloudinaryVideoUrl(publicId: string, transformations?: string): string {
  const baseUrl = CLOUDINARY_VIDEO_BASE_URL;
  if (transformations) {
    return `${baseUrl}${transformations}/${publicId}`;
  }
  return `${baseUrl}${publicId}`;
}

/**
 * Generate Cloudinary image URL
 * @param publicId - The public ID of the image in Cloudinary
 * @param transformations - Optional Cloudinary transformations (e.g., "w_500,h_500,c_fill")
 * @returns Full Cloudinary URL
 */
export function getCloudinaryImageUrl(publicId: string, transformations?: string): string {
  const baseUrl = CLOUDINARY_IMAGE_BASE_URL;
  if (transformations) {
    return `${baseUrl}${transformations}/${publicId}`;
  }
  return `${baseUrl}${publicId}`;
}

export default {
  cloudName: CLOUDINARY_CLOUD_NAME,
  videoBaseUrl: CLOUDINARY_VIDEO_BASE_URL,
  imageBaseUrl: CLOUDINARY_IMAGE_BASE_URL,
  getVideoUrl: getCloudinaryVideoUrl,
  getImageUrl: getCloudinaryImageUrl,
};

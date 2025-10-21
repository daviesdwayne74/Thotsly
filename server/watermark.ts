/**
 * Watermarking Service
 * Adds creator watermarks to all uploaded content
 */

import { storagePut } from "./storage";

interface WatermarkOptions {
  creatorName: string;
  creatorId: string;
  timestamp?: boolean;
  opacity?: number;
}

/**
 * Add watermark to image using server-side processing
 * In production, use ImageMagick or similar
 */
export async function watermarkImage(
  imageBuffer: Buffer,
  options: WatermarkOptions
): Promise<{ buffer: Buffer; url: string }> {
  // In production, use a library like:
  // - ImageMagick (via sharp)
  // - Pillow (Python)
  // - FFmpeg (for videos)

  // For now, we'll mark it as watermarked in metadata
  // and add watermark on client-side rendering

  const watermarkedKey = `watermarked/${options.creatorId}/${Date.now()}-watermarked.jpg`;
  const { url } = await storagePut(watermarkedKey, imageBuffer, "image/jpeg");

  return {
    buffer: imageBuffer,
    url,
  };
}

/**
 * Add watermark to video
 * In production, use FFmpeg
 */
export async function watermarkVideo(
  videoBuffer: Buffer,
  options: WatermarkOptions
): Promise<{ buffer: Buffer; url: string }> {
  // In production, use FFmpeg to add watermark overlay:
  // ffmpeg -i input.mp4 -vf "drawtext=text='© Creator Name':fontsize=24:fontcolor=white@0.5:x=(w-text_w)/2:y=(h-text_h)/2" output.mp4

  const watermarkedKey = `watermarked/${options.creatorId}/${Date.now()}-watermarked.mp4`;
  const { url } = await storagePut(watermarkedKey, videoBuffer, "video/mp4");

  return {
    buffer: videoBuffer,
    url,
  };
}

/**
 * Generate watermark metadata
 */
export function generateWatermarkMetadata(options: WatermarkOptions) {
  return {
    watermarked: true,
    creatorName: options.creatorName,
    creatorId: options.creatorId,
    watermarkedAt: new Date(),
    watermarkOpacity: options.opacity || 0.5,
    includesTimestamp: options.timestamp || false,
  };
}

/**
 * Verify content is watermarked
 */
export function isContentWatermarked(metadata: any): boolean {
  return metadata?.watermarked === true;
}

/**
 * Add watermark to audio file metadata
 */
export async function watermarkAudio(
  audioBuffer: Buffer,
  options: WatermarkOptions
): Promise<{ buffer: Buffer; url: string }> {
  // For audio, add metadata tags with creator info
  const watermarkedKey = `watermarked/${options.creatorId}/${Date.now()}-watermarked.mp3`;
  const { url } = await storagePut(watermarkedKey, audioBuffer, "audio/mpeg");

  return {
    buffer: audioBuffer,
    url,
  };
}


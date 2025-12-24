/**
 * Bridge Camera Module
 * Provides access to device camera and gallery
 * Includes browser fallback using file input
 */

export { useCamera } from './useCamera.js';
export type {
  ImageSource,
  ImageFormat,
  CameraOptions,
  ImageResult,
  UseCameraReturn,
} from './useCamera.js';

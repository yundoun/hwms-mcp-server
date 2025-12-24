/**
 * useCamera Hook
 * Provides camera and gallery access functionality
 * Includes browser fallback using file input
 */

import { BridgeCore, type BridgeResponse } from '../../native-bridge-core/src/index.js';

/** Image source type */
export type ImageSource = 'camera' | 'gallery';

/** Image return format */
export type ImageFormat = 'base64' | 'uri';

/** Camera options */
export interface CameraOptions {
  /** Maximum width of the image */
  maxWidth?: number;
  /** Maximum height of the image */
  maxHeight?: number;
  /** Image quality (0.0 to 1.0) */
  quality?: number;
  /** Return format */
  format?: ImageFormat;
  /** Allow editing before return */
  allowEdit?: boolean;
}

/** Image result */
export interface ImageResult {
  /** Image data (base64 string or file URI) */
  data: string;
  /** Image format */
  format: ImageFormat;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** File size in bytes (if available) */
  fileSize?: number;
  /** MIME type */
  mimeType: string;
}

/** Camera hook return type */
export interface UseCameraReturn {
  /** Take a photo using device camera */
  takePhoto: (options?: CameraOptions) => Promise<BridgeResponse<ImageResult>>;
  /** Select image from gallery */
  selectFromGallery: (options?: CameraOptions) => Promise<BridgeResponse<ImageResult>>;
  /** Check if camera is available */
  isCameraAvailable: () => boolean;
  /** Check if browser fallback is being used */
  isUsingBrowserFallback: () => boolean;
}

/**
 * Process image file and return ImageResult
 */
async function processImageFile(
  file: File,
  options: CameraOptions
): Promise<ImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions respecting max constraints
        let width = img.width;
        let height = img.height;
        const maxWidth = options.maxWidth || 1920;
        const maxHeight = options.maxHeight || 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas to resize and convert
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('캔버스 컨텍스트를 생성할 수 없습니다.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Get base64 data
        const quality = options.quality || 0.8;
        const mimeType = file.type || 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Remove data URL prefix for pure base64
        const base64Data = dataUrl.split(',')[1];

        resolve({
          data: options.format === 'uri' ? dataUrl : base64Data,
          format: options.format || 'base64',
          width,
          height,
          fileSize: file.size,
          mimeType,
        });
      };

      img.onerror = () => {
        reject(new Error('이미지를 로드할 수 없습니다.'));
      };

      img.src = reader.result as string;
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Open file picker with specified options
 */
function openFilePicker(capture: boolean): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    // Use capture attribute for camera on mobile
    if (capture) {
      input.setAttribute('capture', 'environment');
    }

    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = () => {
      const file = input.files?.[0];
      document.body.removeChild(input);

      if (file) {
        resolve(file);
      } else {
        reject(new Error('파일이 선택되지 않았습니다.'));
      }
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      reject(new Error('사용자가 취소했습니다.'));
    };

    // Trigger file picker
    input.click();
  });
}

/**
 * Camera hook for accessing device camera and gallery
 */
export function useCamera(): UseCameraReturn {
  const bridge = BridgeCore.getInstance();

  const defaultOptions: CameraOptions = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'base64',
    allowEdit: false,
  };

  /**
   * Check if using browser fallback
   */
  const isUsingBrowserFallback = (): boolean => {
    return !bridge.isNativeAvailable();
  };

  /**
   * Take a photo using the device camera
   */
  const takePhoto = async (
    options?: CameraOptions
  ): Promise<BridgeResponse<ImageResult>> => {
    const mergedOptions = { ...defaultOptions, ...options };

    // Try native first
    if (bridge.isNativeAvailable()) {
      const response = await bridge.callNative<ImageResult>('camera.takePhoto', {
        maxWidth: mergedOptions.maxWidth,
        maxHeight: mergedOptions.maxHeight,
        quality: mergedOptions.quality,
        format: mergedOptions.format,
        allowEdit: mergedOptions.allowEdit,
      });
      return response;
    }

    // Browser fallback using file input with capture
    try {
      const file = await openFilePicker(true);
      const result = await processImageFile(file, mergedOptions);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CAMERA_ERROR',
          message: error instanceof Error ? error.message : '카메라 접근에 실패했습니다.',
        },
      };
    }
  };

  /**
   * Select an image from the device gallery
   */
  const selectFromGallery = async (
    options?: CameraOptions
  ): Promise<BridgeResponse<ImageResult>> => {
    const mergedOptions = { ...defaultOptions, ...options };

    // Try native first
    if (bridge.isNativeAvailable()) {
      const response = await bridge.callNative<ImageResult>('camera.selectFromGallery', {
        maxWidth: mergedOptions.maxWidth,
        maxHeight: mergedOptions.maxHeight,
        quality: mergedOptions.quality,
        format: mergedOptions.format,
        allowEdit: mergedOptions.allowEdit,
      });
      return response;
    }

    // Browser fallback using file input
    try {
      const file = await openFilePicker(false);
      const result = await processImageFile(file, mergedOptions);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GALLERY_ERROR',
          message: error instanceof Error ? error.message : '갤러리 접근에 실패했습니다.',
        },
      };
    }
  };

  /**
   * Check if camera is available on the device
   * Returns true for both native and browser (file input fallback)
   */
  const isCameraAvailable = (): boolean => {
    // Camera is always "available" because we have browser fallback
    return typeof document !== 'undefined';
  };

  return {
    takePhoto,
    selectFromGallery,
    isCameraAvailable,
    isUsingBrowserFallback,
  };
}

export default useCamera;

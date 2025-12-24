/**
 * useDeviceInfo Hook
 * Provides device information access functionality
 */

import { BridgeCore, type BridgeResponse, type Platform } from '../../native-bridge-core/src/index.js';

/** Operating system information */
export interface OSInfo {
  /** OS name (iOS, Android, Web) */
  name: string;
  /** OS version */
  version: string;
  /** Build number (if available) */
  buildNumber?: string;
}

/** App information */
export interface AppInfo {
  /** App version (e.g., "1.0.0") */
  version: string;
  /** Build number */
  buildNumber: string;
  /** Bundle/Package identifier */
  bundleId: string;
  /** App name */
  name: string;
}

/** Screen information */
export interface ScreenInfo {
  /** Screen width in pixels */
  width: number;
  /** Screen height in pixels */
  height: number;
  /** Device pixel ratio */
  scale: number;
}

/** Device information */
export interface DeviceInfo {
  /** Platform type */
  platform: Platform;
  /** Device unique identifier (may change on reinstall) */
  deviceId: string;
  /** Device model (e.g., "iPhone 15 Pro") */
  model: string;
  /** Device manufacturer */
  manufacturer: string;
  /** Is physical device (not simulator/emulator) */
  isPhysicalDevice: boolean;
  /** Operating system info */
  os: OSInfo;
  /** App info */
  app: AppInfo;
  /** Screen info */
  screen: ScreenInfo;
  /** Device locale (e.g., "ko-KR") */
  locale: string;
  /** Device timezone */
  timezone: string;
}

/** Device info hook return type */
export interface UseDeviceInfoReturn {
  /** Get complete device information */
  getDeviceInfo: () => Promise<BridgeResponse<DeviceInfo>>;
  /** Get OS information only */
  getOSInfo: () => Promise<BridgeResponse<OSInfo>>;
  /** Get app information only */
  getAppInfo: () => Promise<BridgeResponse<AppInfo>>;
  /** Get current platform */
  getPlatform: () => Platform;
  /** Check if running on physical device */
  isPhysicalDevice: () => Promise<BridgeResponse<boolean>>;
}

/**
 * Device info hook for accessing device information
 */
export function useDeviceInfo(): UseDeviceInfoReturn {
  const bridge = BridgeCore.getInstance();

  /**
   * Get complete device information
   */
  const getDeviceInfo = async (): Promise<BridgeResponse<DeviceInfo>> => {
    // If native bridge is not available, return web fallback
    if (!bridge.isNativeAvailable()) {
      const webInfo = getWebFallbackInfo();
      return {
        success: true,
        data: webInfo,
      };
    }

    const response = await bridge.callNative<DeviceInfo>('device.getInfo', {});
    return response;
  };

  /**
   * Get OS information only
   */
  const getOSInfo = async (): Promise<BridgeResponse<OSInfo>> => {
    if (!bridge.isNativeAvailable()) {
      const webInfo = getWebFallbackInfo();
      return {
        success: true,
        data: webInfo.os,
      };
    }

    const response = await bridge.callNative<OSInfo>('device.getOSInfo', {});
    return response;
  };

  /**
   * Get app information only
   */
  const getAppInfo = async (): Promise<BridgeResponse<AppInfo>> => {
    const response = await bridge.callNative<AppInfo>('device.getAppInfo', {});
    return response;
  };

  /**
   * Get current platform
   */
  const getPlatform = (): Platform => {
    return bridge.getPlatform();
  };

  /**
   * Check if running on physical device
   */
  const isPhysicalDevice = async (): Promise<BridgeResponse<boolean>> => {
    const response = await bridge.callNative<boolean>('device.isPhysicalDevice', {});
    return response;
  };

  return {
    getDeviceInfo,
    getOSInfo,
    getAppInfo,
    getPlatform,
    isPhysicalDevice,
  };
}

/**
 * Get fallback device info for web environment
 */
function getWebFallbackInfo(): DeviceInfo {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const language = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const screenWidth = typeof screen !== 'undefined' ? screen.width : 0;
  const screenHeight = typeof screen !== 'undefined' ? screen.height : 0;
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  return {
    platform: 'web',
    deviceId: 'web-' + generateWebId(),
    model: 'Web Browser',
    manufacturer: getBrowserName(userAgent),
    isPhysicalDevice: true,
    os: {
      name: getOSName(userAgent),
      version: getOSVersion(userAgent),
    },
    app: {
      version: '1.0.0',
      buildNumber: '1',
      bundleId: typeof location !== 'undefined' ? location.hostname : 'localhost',
      name: 'Web App',
    },
    screen: {
      width: screenWidth,
      height: screenHeight,
      scale: devicePixelRatio,
    },
    locale: language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function generateWebId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Google Chrome';
  if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
  if (userAgent.includes('Safari')) return 'Apple Safari';
  if (userAgent.includes('Edge')) return 'Microsoft Edge';
  return 'Unknown Browser';
}

function getOSName(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone')) return 'iOS';
  return 'Unknown';
}

function getOSVersion(userAgent: string): string {
  const match = userAgent.match(/(?:Windows NT|Mac OS X|Android|iOS)[/ ]?([\d._]+)/);
  return match ? match[1].replace(/_/g, '.') : 'Unknown';
}

export default useDeviceInfo;

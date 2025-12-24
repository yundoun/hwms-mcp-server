/**
 * BridgeCore
 * Core bridge communication class for web-to-native messaging
 * Includes browser mock support for testing without native app
 */

import type {
  Platform,
  BridgeParams,
  BridgeResponse,
  BridgeCallback,
  CallbackInfo,
  BridgeMessage,
} from './types.js';

/** Mock handler function type */
export type MockHandler<T = unknown> = (
  action: string,
  params: BridgeParams
) => Promise<BridgeResponse<T>> | BridgeResponse<T>;

export class BridgeCore {
  private static instance: BridgeCore | null = null;
  private callbacks: Map<string, CallbackInfo> = new Map();
  private callbackIdCounter: number = 0;
  private defaultTimeout: number = 30000; // 30 seconds
  private mockHandlers: Map<string, MockHandler> = new Map();
  private useMockInBrowser: boolean = true; // Enable mock fallback in browser

  private constructor() {
    this.setupResponseHandler();
    this.registerDefaultMocks();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BridgeCore {
    if (!BridgeCore.instance) {
      BridgeCore.instance = new BridgeCore();
    }
    return BridgeCore.instance;
  }

  /**
   * Enable or disable mock fallback in browser
   */
  public setUseMockInBrowser(enabled: boolean): void {
    this.useMockInBrowser = enabled;
  }

  /**
   * Register a mock handler for testing
   */
  public registerMockHandler(actionPrefix: string, handler: MockHandler): void {
    this.mockHandlers.set(actionPrefix, handler);
  }

  /**
   * Register default mock handlers for browser testing
   */
  private registerDefaultMocks(): void {
    // Device info mock
    this.registerMockHandler('device', async (action, params) => {
      if (action === 'device.getInfo' || action === 'device.getOSInfo') {
        return {
          success: true,
          data: this.getBrowserDeviceInfo(),
        };
      }
      if (action === 'device.getAppInfo') {
        return {
          success: true,
          data: {
            version: '1.0.0',
            buildNumber: '1',
            bundleId: window.location.hostname,
            name: document.title || 'Web App',
          },
        };
      }
      if (action === 'device.isPhysicalDevice') {
        return { success: true, data: true };
      }
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
    });

    // Camera mock - will be handled by browser file input
    this.registerMockHandler('camera', async (action, params) => {
      return {
        success: false,
        error: {
          code: 'USE_BROWSER_FALLBACK',
          message: '브라우저에서는 파일 선택 UI를 사용하세요.',
        },
      };
    });

    // Push mock
    this.registerMockHandler('push', async (action, params) => {
      if (action === 'push.getPermissionStatus') {
        const permission = Notification?.permission || 'not_determined';
        return { success: true, data: permission };
      }
      if (action === 'push.requestPermission') {
        if ('Notification' in window) {
          const result = await Notification.requestPermission();
          return { success: true, data: result };
        }
        return { success: true, data: 'denied' };
      }
      if (action === 'push.getToken') {
        return {
          success: true,
          data: {
            token: `browser-mock-token-${Date.now()}`,
            type: 'fcm',
          },
        };
      }
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
    });
  }

  /**
   * Get browser device info
   */
  private getBrowserDeviceInfo(): object {
    const ua = navigator.userAgent;
    const platform = this.getPlatform();

    return {
      platform,
      deviceId: `browser-${this.generateSimpleId()}`,
      model: this.getBrowserName(ua),
      manufacturer: this.getOSName(ua),
      isPhysicalDevice: true,
      os: {
        name: this.getOSName(ua),
        version: this.getOSVersion(ua),
      },
      app: {
        version: '1.0.0',
        buildNumber: '1',
        bundleId: window.location.hostname,
        name: document.title || 'Web App',
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        scale: window.devicePixelRatio || 1,
      },
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private generateSimpleId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  private getBrowserName(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
  }

  private getOSName(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    return 'Unknown';
  }

  private getOSVersion(ua: string): string {
    const match = ua.match(/(?:Windows NT |Mac OS X |Android |CPU (?:iPhone )?OS )([\d._]+)/);
    return match ? match[1].replace(/_/g, '.') : 'Unknown';
  }

  /**
   * Detect current platform
   */
  public getPlatform(): Platform {
    if (typeof window === 'undefined') {
      return 'unknown';
    }

    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }

    if (/android/.test(userAgent)) {
      return 'android';
    }

    return 'web';
  }

  /**
   * Check if native bridge is available
   */
  public isNativeAvailable(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const platform = this.getPlatform();

    if (platform === 'ios') {
      return !!window.webkit?.messageHandlers?.NativeBridge;
    }

    if (platform === 'android') {
      return !!window.NativeBridge;
    }

    return false;
  }

  /**
   * Check if mock is available for action
   */
  private getMockHandler(action: string): MockHandler | null {
    for (const [prefix, handler] of this.mockHandlers) {
      if (action.startsWith(prefix)) {
        return handler;
      }
    }
    return null;
  }

  /**
   * Call native function (with mock fallback for browser)
   */
  public async callNative<T = unknown>(
    action: string,
    params: BridgeParams = {},
    timeout?: number
  ): Promise<BridgeResponse<T>> {
    // Try native first
    if (this.isNativeAvailable()) {
      return this.callNativeInternal<T>(action, params, timeout);
    }

    // Fallback to mock in browser
    if (this.useMockInBrowser) {
      const mockHandler = this.getMockHandler(action);
      if (mockHandler) {
        try {
          const result = await mockHandler(action, params);
          return result as BridgeResponse<T>;
        } catch (error) {
          return {
            success: false,
            error: {
              code: 'MOCK_ERROR',
              message: error instanceof Error ? error.message : 'Mock handler failed',
            },
          };
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'BRIDGE_NOT_AVAILABLE',
        message: '네이티브 브릿지를 사용할 수 없습니다. 브라우저에서 실행 중입니다.',
      },
    };
  }

  /**
   * Internal native call (original implementation)
   */
  private callNativeInternal<T = unknown>(
    action: string,
    params: BridgeParams = {},
    timeout?: number
  ): Promise<BridgeResponse<T>> {
    return new Promise((resolve) => {
      const callbackId = this.generateCallbackId();
      const effectiveTimeout = timeout ?? this.defaultTimeout;

      const timeoutHandle = setTimeout(() => {
        this.removeCallback(callbackId);
        resolve({
          success: false,
          error: {
            code: 'TIMEOUT',
            message: `요청 시간이 초과되었습니다. (${effectiveTimeout}ms)`,
          },
        });
      }, effectiveTimeout);

      this.callbacks.set(callbackId, {
        callback: (response: BridgeResponse) => {
          clearTimeout(timeoutHandle);
          this.removeCallback(callbackId);
          resolve(response as BridgeResponse<T>);
        },
        timeout: timeoutHandle,
      });

      const message: BridgeMessage = {
        action,
        callbackId,
        params,
      };

      this.postMessage(message);
    });
  }

  /**
   * Register a persistent callback for events
   */
  public registerCallback<T = unknown>(
    eventName: string,
    callback: BridgeCallback<T>
  ): () => void {
    const callbackId = `event_${eventName}`;

    this.callbacks.set(callbackId, {
      callback: callback as BridgeCallback,
    });

    return () => {
      this.removeCallback(callbackId);
    };
  }

  /**
   * Setup global response handler
   */
  private setupResponseHandler(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.__bridgeCallbacks = this.callbacks;
    window.__handleBridgeResponse = (
      callbackId: string,
      response: BridgeResponse
    ) => {
      const callbackInfo = this.callbacks.get(callbackId);
      if (callbackInfo) {
        callbackInfo.callback(response);
      }
    };
  }

  /**
   * Post message to native
   */
  private postMessage(message: BridgeMessage): void {
    const messageString = JSON.stringify(message);
    const platform = this.getPlatform();

    try {
      if (platform === 'ios' && window.webkit?.messageHandlers?.NativeBridge) {
        window.webkit.messageHandlers.NativeBridge.postMessage(messageString);
      } else if (window.NativeBridge) {
        window.NativeBridge.postMessage(messageString);
      }
    } catch (error) {
      console.error('Failed to post message to native:', error);
    }
  }

  /**
   * Generate unique callback ID
   */
  private generateCallbackId(): string {
    return `cb_${Date.now()}_${++this.callbackIdCounter}`;
  }

  /**
   * Remove callback by ID
   */
  private removeCallback(callbackId: string): void {
    const callbackInfo = this.callbacks.get(callbackId);
    if (callbackInfo?.timeout) {
      clearTimeout(callbackInfo.timeout);
    }
    this.callbacks.delete(callbackId);
  }
}

export default BridgeCore;

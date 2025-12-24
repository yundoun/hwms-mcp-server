/**
 * usePush Hook
 * Provides push notification functionality
 */

import { BridgeCore, type BridgeResponse, type BridgeCallback } from '../../native-bridge-core/src/index.js';

/** Push permission status */
export type PermissionStatus = 'granted' | 'denied' | 'not_determined' | 'provisional';

/** Push token type */
export type TokenType = 'fcm' | 'apns';

/** Push token result */
export interface PushToken {
  /** The push token string */
  token: string;
  /** Token type (FCM or APNs) */
  type: TokenType;
}

/** Push notification payload */
export interface PushNotification {
  /** Notification ID */
  id: string;
  /** Notification title */
  title: string;
  /** Notification body */
  body: string;
  /** Custom data payload */
  data?: Record<string, unknown>;
  /** Badge count (iOS) */
  badge?: number;
  /** Sound name */
  sound?: string;
  /** Received timestamp */
  receivedAt: number;
}

/** Push hook return type */
export interface UsePushReturn {
  /** Get the push token */
  getToken: () => Promise<BridgeResponse<PushToken>>;
  /** Request push notification permission */
  requestPermission: () => Promise<BridgeResponse<PermissionStatus>>;
  /** Get current permission status */
  getPermissionStatus: () => Promise<BridgeResponse<PermissionStatus>>;
  /** Register notification received handler */
  onNotificationReceived: (callback: BridgeCallback<PushNotification>) => () => void;
  /** Register notification opened handler */
  onNotificationOpened: (callback: BridgeCallback<PushNotification>) => () => void;
  /** Check if push is available */
  isPushAvailable: () => boolean;
}

/**
 * Push notification hook for FCM/APNs integration
 */
export function usePush(): UsePushReturn {
  const bridge = BridgeCore.getInstance();

  /**
   * Get the device push token (FCM or APNs)
   */
  const getToken = async (): Promise<BridgeResponse<PushToken>> => {
    const response = await bridge.callNative<PushToken>('push.getToken', {});
    return response;
  };

  /**
   * Request push notification permission
   */
  const requestPermission = async (): Promise<BridgeResponse<PermissionStatus>> => {
    const response = await bridge.callNative<PermissionStatus>('push.requestPermission', {});
    return response;
  };

  /**
   * Get current permission status
   */
  const getPermissionStatus = async (): Promise<BridgeResponse<PermissionStatus>> => {
    const response = await bridge.callNative<PermissionStatus>('push.getPermissionStatus', {});
    return response;
  };

  /**
   * Register handler for incoming notifications (when app is in foreground)
   */
  const onNotificationReceived = (
    callback: BridgeCallback<PushNotification>
  ): (() => void) => {
    return bridge.registerCallback<PushNotification>('push.notificationReceived', callback);
  };

  /**
   * Register handler for notification tap (when user opens notification)
   */
  const onNotificationOpened = (
    callback: BridgeCallback<PushNotification>
  ): (() => void) => {
    return bridge.registerCallback<PushNotification>('push.notificationOpened', callback);
  };

  /**
   * Check if push notifications are available
   */
  const isPushAvailable = (): boolean => {
    return bridge.isNativeAvailable();
  };

  return {
    getToken,
    requestPermission,
    getPermissionStatus,
    onNotificationReceived,
    onNotificationOpened,
    isPushAvailable,
  };
}

export default usePush;

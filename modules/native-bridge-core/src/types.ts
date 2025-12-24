/**
 * Native Bridge Core Types
 * Type definitions for the native bridge communication layer
 */

/** Supported platforms */
export type Platform = 'web' | 'ios' | 'android' | 'unknown';

/** Bridge action parameters */
export interface BridgeParams {
  [key: string]: unknown;
}

/** Bridge response structure */
export interface BridgeResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/** Callback function type */
export type BridgeCallback<T = unknown> = (response: BridgeResponse<T>) => void;

/** Native bridge interface (injected by native app) */
export interface NativeBridgeInterface {
  postMessage(message: string): void;
}

/** Callback registration info */
export interface CallbackInfo {
  callback: BridgeCallback;
  timeout?: NodeJS.Timeout;
}

/** Bridge message structure */
export interface BridgeMessage {
  action: string;
  callbackId: string;
  params: BridgeParams;
}

/** Global window interface extension */
declare global {
  interface Window {
    NativeBridge?: NativeBridgeInterface;
    webkit?: {
      messageHandlers?: {
        NativeBridge?: {
          postMessage(message: string): void;
        };
      };
    };
    __bridgeCallbacks?: Map<string, CallbackInfo>;
    __handleBridgeResponse?: (callbackId: string, response: BridgeResponse) => void;
  }
}

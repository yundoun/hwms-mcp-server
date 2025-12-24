/**
 * Native Bridge Core Module
 * Provides the core communication interface between web and native apps
 */

export { BridgeCore } from './BridgeCore.js';
export * from './types.js';

// Convenience export for default instance
import { BridgeCore } from './BridgeCore.js';
export const bridgeCore = BridgeCore.getInstance();

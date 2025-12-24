#!/usr/bin/env node
/**
 * HWMS MCP Server Entry Point
 * Hybrid WebApp Module System - AI-driven module selection
 */

import { createServer } from './server.js';

async function main(): Promise<void> {
  try {
    const server = await createServer();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start HWMS MCP Server:', error);
    process.exit(1);
  }
}

main();

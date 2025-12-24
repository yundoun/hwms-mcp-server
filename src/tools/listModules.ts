/**
 * list_modules MCP Tool
 * Returns a list of available modules with metadata
 */

import { loadAllModules } from '../utils/moduleLoader.js';

/** Module summary for listing */
export interface ModuleSummary {
  name: string;
  displayName: string;
  category: string;
  description: string;
  platforms: string[];
}

/** Tool input schema */
export const listModulesSchema = {
  type: 'object' as const,
  properties: {
    category: {
      type: 'string',
      description: '모듈 카테고리로 필터링 (예: core, media, notification, device)',
    },
  },
  required: [] as string[],
};

/**
 * List all available modules
 * @param category Optional category filter
 * @returns Array of module summaries
 */
export async function listModules(category?: string): Promise<ModuleSummary[]> {
  const modules = await loadAllModules();

  let filteredModules = modules;

  // Apply category filter if provided
  if (category) {
    filteredModules = modules.filter(
      (m) => m.meta.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Map to summary format
  const summaries: ModuleSummary[] = filteredModules.map((m) => ({
    name: m.meta.name,
    displayName: m.meta.displayName,
    category: m.meta.category,
    description: m.meta.description,
    platforms: m.meta.platforms,
  }));

  // Sort by category, then by name
  summaries.sort((a, b) => {
    if (a.category !== b.category) {
      // Core modules first
      if (a.category === 'core') return -1;
      if (b.category === 'core') return 1;
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return summaries;
}

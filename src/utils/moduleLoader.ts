/**
 * Module Loader Utility
 * Loads and validates modules from the modules/ directory
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modules directory path (relative to src/utils)
const MODULES_DIR = path.resolve(__dirname, '../../modules');

export interface EnvVariable {
  name: string;
  description: string;
  required: boolean;
  default?: string;
}

export interface SetupStep {
  platform: string;
  instruction: string;
}

export interface ModuleDependencies {
  modules: string[];
  npm?: Record<string, string>;
}

export interface RouteSlot {
  path: string;
  component: string;
  children?: Array<{ path: string; component: string }>;
}

export interface MenuSlot {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  url?: string;
  icon?: string;
  children?: Array<{
    id: string;
    title: string;
    type: 'item' | 'collapse';
    url?: string;
    icon?: string;
  }>;
}

export interface ModuleSlots {
  'web.routes'?: RouteSlot;
  'web.menu'?: MenuSlot;
}

export interface ModuleMeta {
  name: string;
  displayName: string;
  version: string;
  category: string;
  description: string;
  platforms: string[];
  dependencies: ModuleDependencies;
  provides: string[];
  conflicts: string[];
  envVariables: EnvVariable[];
  setupSteps: SetupStep[];
  // Optional: Path to template directory for base modules
  templatePath?: string;
  // Optional: Slots for page modules (route and menu injection)
  slots?: ModuleSlots;
}

export interface LoadedModule {
  meta: ModuleMeta;
  path: string;
}

/**
 * Loads all modules from the modules directory
 */
export async function loadAllModules(): Promise<LoadedModule[]> {
  const modules: LoadedModule[] = [];

  if (!fs.existsSync(MODULES_DIR)) {
    return modules;
  }

  const entries = fs.readdirSync(MODULES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const modulePath = path.join(MODULES_DIR, entry.name);
      const metaPath = path.join(modulePath, 'module.meta.json');

      if (fs.existsSync(metaPath)) {
        try {
          const metaContent = fs.readFileSync(metaPath, 'utf-8');
          const meta = JSON.parse(metaContent) as ModuleMeta;
          modules.push({
            meta,
            path: modulePath,
          });
        } catch (error) {
          console.error(`Failed to load module ${entry.name}:`, error);
        }
      }
    }
  }

  return modules;
}

/**
 * Loads a specific module by name
 */
export async function loadModule(moduleName: string): Promise<LoadedModule | null> {
  const modulePath = path.join(MODULES_DIR, moduleName);
  const metaPath = path.join(modulePath, 'module.meta.json');

  if (!fs.existsSync(metaPath)) {
    return null;
  }

  try {
    const metaContent = fs.readFileSync(metaPath, 'utf-8');
    const meta = JSON.parse(metaContent) as ModuleMeta;
    return {
      meta,
      path: modulePath,
    };
  } catch (error) {
    console.error(`Failed to load module ${moduleName}:`, error);
    return null;
  }
}

/**
 * Gets the modules directory path
 */
export function getModulesDir(): string {
  return MODULES_DIR;
}

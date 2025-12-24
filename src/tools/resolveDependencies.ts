/**
 * resolve_dependencies MCP Tool
 * Resolves module dependencies with conflict detection
 */

import {
  loadAllModules,
  type ModuleMeta,
  type EnvVariable,
} from '../utils/moduleLoader.js';

/** Resolved dependencies result */
export interface ResolvedDependencies {
  /** All modules including resolved dependencies */
  resolvedModules: string[];
  /** Combined environment variables from all modules */
  envVariables: EnvVariable[];
  /** Combined setup steps from all modules */
  setupSteps: string[];
  /** Warning messages (e.g., conflicts) */
  warnings: string[];
  /** NPM dependencies to install */
  npmDependencies: Record<string, string>;
}

/** Tool input schema */
export const resolveDependenciesSchema = {
  type: 'object' as const,
  properties: {
    modules: {
      type: 'array',
      items: { type: 'string' },
      description: '선택된 모듈 이름 배열 (예: ["bridge-camera", "bridge-push"])',
    },
  },
  required: ['modules'],
};

/**
 * Resolve dependencies for selected modules
 * @param moduleNames Array of selected module names
 * @returns Resolved dependencies with all required modules
 */
export async function resolveDependencies(
  moduleNames: string[]
): Promise<ResolvedDependencies> {
  const allModules = await loadAllModules();
  const moduleMap = new Map<string, ModuleMeta>();

  for (const m of allModules) {
    moduleMap.set(m.meta.name, m.meta);
  }

  const resolved = new Set<string>();
  const visiting = new Set<string>();
  const warnings: string[] = [];
  const envVariables: EnvVariable[] = [];
  const setupSteps: string[] = [];
  const npmDependencies: Record<string, string> = {};
  const providesSet = new Set<string>();

  // Validate input modules exist
  for (const name of moduleNames) {
    if (!moduleMap.has(name)) {
      throw new Error(`모듈을 찾을 수 없습니다: ${name}`);
    }
  }

  // Resolve dependencies using DFS
  const resolveDfs = (moduleName: string): void => {
    if (resolved.has(moduleName)) {
      return;
    }

    if (visiting.has(moduleName)) {
      warnings.push(`순환 의존성이 감지되었습니다: ${moduleName}`);
      return;
    }

    visiting.add(moduleName);

    const moduleMeta = moduleMap.get(moduleName);
    if (!moduleMeta) {
      warnings.push(`의존 모듈을 찾을 수 없습니다: ${moduleName}`);
      visiting.delete(moduleName);
      return;
    }

    // Resolve dependencies first (depth-first)
    for (const depName of moduleMeta.dependencies.modules) {
      resolveDfs(depName);
    }

    visiting.delete(moduleName);
    resolved.add(moduleName);

    // Check for conflicts (safely handle missing field)
    const conflicts = moduleMeta.conflicts || [];
    for (const conflict of conflicts) {
      if (resolved.has(conflict)) {
        warnings.push(`충돌 감지: ${moduleName}과(와) ${conflict}은(는) 함께 사용할 수 없습니다.`);
      }
    }

    // Check for provides overlap (safely handle missing field)
    const provides = moduleMeta.provides || [];
    for (const provide of provides) {
      if (providesSet.has(provide)) {
        warnings.push(`기능 중복: "${provide}" 기능을 제공하는 모듈이 이미 있습니다.`);
      }
      providesSet.add(provide);
    }

    // Collect env variables (deduplicate by name, safely handle missing field)
    const existingEnvNames = new Set(envVariables.map((e) => e.name));
    const moduleEnvVars = moduleMeta.envVariables || [];
    for (const env of moduleEnvVars) {
      if (!existingEnvNames.has(env.name)) {
        envVariables.push(env);
        existingEnvNames.add(env.name);
      }
    }

    // Collect setup steps (safely handle missing field)
    const moduleSetupSteps = moduleMeta.setupSteps || [];
    for (const step of moduleSetupSteps) {
      const stepStr = `[${step.platform.toUpperCase()}] ${step.instruction}`;
      if (!setupSteps.includes(stepStr)) {
        setupSteps.push(stepStr);
      }
    }

    // Collect NPM dependencies
    if (moduleMeta.dependencies.npm) {
      Object.assign(npmDependencies, moduleMeta.dependencies.npm);
    }
  };

  // Resolve all requested modules
  for (const name of moduleNames) {
    resolveDfs(name);
  }

  // Convert resolved set to sorted array (dependencies first)
  const resolvedModules = sortByDependencyOrder(
    Array.from(resolved),
    moduleMap
  );

  return {
    resolvedModules,
    envVariables,
    setupSteps,
    warnings,
    npmDependencies,
  };
}

/**
 * Sort modules by dependency order (dependencies come first)
 */
function sortByDependencyOrder(
  modules: string[],
  moduleMap: Map<string, ModuleMeta>
): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  const visit = (name: string): void => {
    if (visited.has(name)) return;
    visited.add(name);

    const meta = moduleMap.get(name);
    if (meta) {
      for (const dep of meta.dependencies.modules) {
        if (modules.includes(dep)) {
          visit(dep);
        }
      }
    }

    result.push(name);
  };

  for (const name of modules) {
    visit(name);
  }

  return result;
}

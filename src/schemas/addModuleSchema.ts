/**
 * add_module MCP Tool Schema
 * Schema definitions for the add_module tool
 */

/** Tool input schema */
export const addModuleSchema = {
  type: 'object' as const,
  properties: {
    projectPath: {
      type: 'string',
      description:
        '기존 HWMS 프로젝트의 절대 경로 (예: "/Users/user/my-project")',
    },
    modules: {
      type: 'array',
      items: { type: 'string' },
      description:
        '추가할 모듈 이름 배열 (예: ["page-user-management", "bridge-push"])',
    },
  },
  required: ['projectPath', 'modules'],
};

/** Add module result interface */
export interface AddModuleResult {
  success: boolean;
  projectPath: string;
  addedModules: string[];
  skippedModules: Array<{
    name: string;
    reason: 'already_installed' | 'conflict' | 'dependency_missing';
  }>;
  warnings: string[];
  updatedFiles: string[];
  backupFiles: string[];
  newNpmDependencies: Record<string, string>;
  setupInstructions: string[];
}

/** Validation result interface */
export interface ValidationResult {
  canProceed: boolean;
  modulesToAdd: string[];
  skippedModules: Array<{
    name: string;
    reason: 'already_installed' | 'conflict' | 'dependency_missing';
  }>;
  warnings: string[];
}

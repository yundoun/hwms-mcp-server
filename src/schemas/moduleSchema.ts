/**
 * Module Schema Definitions
 * Zod schemas for validating module.meta.json files
 */

import { z } from 'zod';

// ==============================|| ENV VARIABLE SCHEMA ||============================== //

export const EnvVariableSchema = z.object({
  name: z.string().min(1, 'Environment variable name is required'),
  description: z.string().min(1, 'Description is required'),
  required: z.boolean(),
  default: z.string().optional()
});

export type EnvVariable = z.infer<typeof EnvVariableSchema>;

// ==============================|| SETUP STEP SCHEMA ||============================== //

export const SetupStepSchema = z.object({
  platform: z.enum(['web', 'ios', 'android', 'all']),
  instruction: z.string().min(1, 'Instruction is required')
});

export type SetupStep = z.infer<typeof SetupStepSchema>;

// ==============================|| DEPENDENCIES SCHEMA ||============================== //

export const DependenciesSchema = z.object({
  modules: z.array(z.string()).default([]),
  npm: z.record(z.string(), z.string()).optional()
});

export type ModuleDependencies = z.infer<typeof DependenciesSchema>;

// ==============================|| MODULE META SCHEMA ||============================== //

export const ModuleMetaSchema = z.object({
  name: z
    .string()
    .min(1, 'Module name is required')
    .regex(/^[a-z][a-z0-9-]*$/, 'Module name must be lowercase with hyphens only'),
  displayName: z.string().min(1, 'Display name is required'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (x.y.z)'),
  category: z.enum(['base', 'page', 'core', 'media', 'notification', 'device', 'storage', 'auth', 'ui', 'util']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  platforms: z
    .array(z.enum(['web', 'ios', 'android']))
    .min(1, 'At least one platform is required'),
  dependencies: DependenciesSchema,
  provides: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  envVariables: z.array(EnvVariableSchema).default([]),
  setupSteps: z.array(SetupStepSchema).default([]),
  // Optional: Path to template directory for base modules
  templatePath: z.string().optional(),
  // Optional: Slots for page modules (route and menu injection)
  slots: z.object({
    'web.routes': z.object({
      path: z.string(),
      component: z.string(),
      children: z.array(z.object({
        path: z.string(),
        component: z.string()
      })).optional()
    }).optional(),
    'web.menu': z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['item', 'collapse', 'group']),
      url: z.string().optional(),
      icon: z.string().optional(),
      children: z.array(z.object({
        id: z.string(),
        title: z.string(),
        type: z.enum(['item', 'collapse']),
        url: z.string().optional(),
        icon: z.string().optional()
      })).optional()
    }).optional()
  }).optional()
});

export type ModuleMeta = z.infer<typeof ModuleMetaSchema>;

// ==============================|| VALIDATION FUNCTIONS ||============================== //

/**
 * Validates a module meta object
 * @param data - The data to validate
 * @returns Parsed and validated ModuleMeta object
 * @throws ZodError if validation fails
 */
export function validateModuleMeta(data: unknown): ModuleMeta {
  return ModuleMetaSchema.parse(data);
}

/**
 * Safely validates a module meta object
 * @param data - The data to validate
 * @returns Result object with success/error status
 */
export function safeValidateModuleMeta(data: unknown): z.SafeParseReturnType<unknown, ModuleMeta> {
  return ModuleMetaSchema.safeParse(data);
}

/**
 * Validates an array of module names
 * @param modules - Array of module names
 * @returns Validated array
 */
export const ModuleListSchema = z.array(z.string().min(1)).min(1, 'At least one module is required');

export function validateModuleList(modules: unknown): string[] {
  return ModuleListSchema.parse(modules);
}

/**
 * Validates project name
 */
export const ProjectNameSchema = z
  .string()
  .min(1, 'Project name is required')
  .regex(/^[a-z][a-z0-9-]*$/, 'Project name must be lowercase with hyphens only');

export function validateProjectName(name: unknown): string {
  return ProjectNameSchema.parse(name);
}

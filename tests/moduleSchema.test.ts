/**
 * Module Schema Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateModuleMeta,
  safeValidateModuleMeta,
  validateModuleList,
  validateProjectName,
  ModuleMetaSchema
} from '../src/schemas/moduleSchema';

describe('ModuleMetaSchema', () => {
  const validModuleMeta = {
    name: 'bridge-camera',
    displayName: 'Camera Bridge',
    version: '1.0.0',
    category: 'media',
    description: 'Camera access bridge for hybrid apps with native integration',
    platforms: ['web', 'ios', 'android'],
    dependencies: {
      modules: ['core-bridge'],
      npm: {
        'some-package': '^1.0.0'
      }
    },
    provides: ['camera-access'],
    conflicts: [],
    envVariables: [
      {
        name: 'CAMERA_API_KEY',
        description: 'API key for camera service',
        required: false,
        default: ''
      }
    ],
    setupSteps: [
      {
        platform: 'ios',
        instruction: 'Add NSCameraUsageDescription to Info.plist'
      }
    ]
  };

  describe('validateModuleMeta', () => {
    it('should validate a correct module meta', () => {
      const result = validateModuleMeta(validModuleMeta);
      expect(result.name).toBe('bridge-camera');
      expect(result.version).toBe('1.0.0');
    });

    it('should throw on invalid module name format', () => {
      const invalid = { ...validModuleMeta, name: 'Invalid_Name' };
      expect(() => validateModuleMeta(invalid)).toThrow();
    });

    it('should throw on invalid version format', () => {
      const invalid = { ...validModuleMeta, version: 'v1.0' };
      expect(() => validateModuleMeta(invalid)).toThrow();
    });

    it('should throw on missing required fields', () => {
      const invalid = { name: 'test-module' };
      expect(() => validateModuleMeta(invalid)).toThrow();
    });

    it('should throw on invalid category', () => {
      const invalid = { ...validModuleMeta, category: 'invalid-category' };
      expect(() => validateModuleMeta(invalid)).toThrow();
    });

    it('should validate base category module', () => {
      const baseModule = {
        ...validModuleMeta,
        name: 'base-mantis-admin',
        category: 'base',
        templatePath: 'template/'
      };
      const result = validateModuleMeta(baseModule);
      expect(result.category).toBe('base');
      expect(result.templatePath).toBe('template/');
    });

    it('should validate module without templatePath', () => {
      const result = validateModuleMeta(validModuleMeta);
      expect(result.templatePath).toBeUndefined();
    });

    it('should throw on empty platforms array', () => {
      const invalid = { ...validModuleMeta, platforms: [] };
      expect(() => validateModuleMeta(invalid)).toThrow();
    });

    it('should throw on description too short', () => {
      const invalid = { ...validModuleMeta, description: 'Short' };
      expect(() => validateModuleMeta(invalid)).toThrow();
    });
  });

  describe('safeValidateModuleMeta', () => {
    it('should return success for valid data', () => {
      const result = safeValidateModuleMeta(validModuleMeta);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('bridge-camera');
      }
    });

    it('should return error for invalid data', () => {
      const result = safeValidateModuleMeta({ name: 'Invalid' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateModuleList', () => {
    it('should validate a valid module list', () => {
      const modules = ['module-a', 'module-b'];
      const result = validateModuleList(modules);
      expect(result).toEqual(modules);
    });

    it('should throw on empty array', () => {
      expect(() => validateModuleList([])).toThrow();
    });

    it('should throw on array with empty strings', () => {
      expect(() => validateModuleList(['valid', ''])).toThrow();
    });
  });

  describe('validateProjectName', () => {
    it('should validate a valid project name', () => {
      const result = validateProjectName('my-project');
      expect(result).toBe('my-project');
    });

    it('should throw on uppercase letters', () => {
      expect(() => validateProjectName('MyProject')).toThrow();
    });

    it('should throw on starting with number', () => {
      expect(() => validateProjectName('123project')).toThrow();
    });

    it('should throw on empty string', () => {
      expect(() => validateProjectName('')).toThrow();
    });
  });
});

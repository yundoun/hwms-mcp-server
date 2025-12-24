/**
 * Module Loader Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn()
}));

// Import after mocking
import { loadAllModules, loadModule, getModulesDir } from '../src/utils/moduleLoader';

describe('moduleLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getModulesDir', () => {
    it('should return a valid path string', () => {
      const result = getModulesDir();
      expect(typeof result).toBe('string');
      expect(result).toContain('modules');
    });
  });

  describe('loadAllModules', () => {
    it('should return empty array if modules directory does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = await loadAllModules();
      expect(result).toEqual([]);
    });

    it('should load modules from directory', async () => {
      const mockMeta = {
        name: 'test-module',
        displayName: 'Test Module',
        version: '1.0.0',
        category: 'core',
        description: 'A test module for testing purposes',
        platforms: ['web'],
        dependencies: { modules: [] },
        provides: [],
        conflicts: [],
        envVariables: [],
        setupSteps: []
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'test-module', isDirectory: () => true }
      ] as any);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockMeta));

      const result = await loadAllModules();
      expect(result.length).toBe(1);
      expect(result[0].meta.name).toBe('test-module');
    });

    it('should skip non-directory entries', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'some-file.txt', isDirectory: () => false }
      ] as any);

      const result = await loadAllModules();
      expect(result).toEqual([]);
    });

    it('should handle JSON parse errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'bad-module', isDirectory: () => true }
      ] as any);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

      const result = await loadAllModules();
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('loadModule', () => {
    it('should return null if module does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = await loadModule('non-existent');
      expect(result).toBeNull();
    });

    it('should load a specific module', async () => {
      const mockMeta = {
        name: 'specific-module',
        displayName: 'Specific Module',
        version: '2.0.0',
        category: 'media',
        description: 'A specific module for testing',
        platforms: ['ios', 'android'],
        dependencies: { modules: [] },
        provides: [],
        conflicts: [],
        envVariables: [],
        setupSteps: []
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockMeta));

      const result = await loadModule('specific-module');
      expect(result).not.toBeNull();
      expect(result?.meta.name).toBe('specific-module');
      expect(result?.meta.version).toBe('2.0.0');
    });

    it('should handle read errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = await loadModule('error-module');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});

/**
 * MCP Tools Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock moduleLoader before importing tools
vi.mock('../src/utils/moduleLoader', () => ({
  loadAllModules: vi.fn(),
  loadModule: vi.fn(),
  getModulesDir: vi.fn(() => '/mock/modules')
}));

import { listModules } from '../src/tools/listModules';
import { resolveDependencies } from '../src/tools/resolveDependencies';
import { loadAllModules } from '../src/utils/moduleLoader';

describe('MCP Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listModules', () => {
    const mockModules = [
      {
        meta: {
          name: 'core-bridge',
          displayName: 'Core Bridge',
          version: '1.0.0',
          category: 'core',
          description: 'Core bridge functionality',
          platforms: ['web', 'ios', 'android'],
          dependencies: { modules: [] },
          provides: ['bridge-core'],
          conflicts: [],
          envVariables: [],
          setupSteps: []
        },
        path: '/modules/core-bridge'
      },
      {
        meta: {
          name: 'bridge-camera',
          displayName: 'Camera Bridge',
          version: '1.0.0',
          category: 'media',
          description: 'Camera access for hybrid apps',
          platforms: ['ios', 'android'],
          dependencies: { modules: ['core-bridge'] },
          provides: ['camera-access'],
          conflicts: [],
          envVariables: [],
          setupSteps: []
        },
        path: '/modules/bridge-camera'
      },
      {
        meta: {
          name: 'base-mantis-admin',
          displayName: 'Mantis Admin 기반',
          version: '1.0.0',
          category: 'base',
          description: 'Mantis Admin 템플릿의 핵심 기반',
          platforms: ['web'],
          dependencies: { modules: [] },
          provides: ['admin-base', 'mui-theme'],
          conflicts: [],
          envVariables: [],
          setupSteps: [],
          templatePath: 'template/'
        },
        path: '/modules/base-mantis-admin'
      }
    ];

    it('should list all modules', async () => {
      vi.mocked(loadAllModules).mockResolvedValue(mockModules);

      const result = await listModules();
      // listModules returns ModuleSummary[] directly, not { modules: [...] }
      expect(result).toHaveLength(3);
      // Sorted: core first, then alphabetically by category (base, media)
      expect(result[0].name).toBe('core-bridge');
      expect(result[1].name).toBe('base-mantis-admin');
      expect(result[2].name).toBe('bridge-camera');
    });

    it('should filter by base category', async () => {
      vi.mocked(loadAllModules).mockResolvedValue(mockModules);

      const result = await listModules('base');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('base-mantis-admin');
    });

    it('should filter by page category', async () => {
      const modulesWithPage = [
        ...mockModules,
        {
          meta: {
            name: 'page-dashboard',
            displayName: '대시보드 페이지',
            version: '1.0.0',
            category: 'page',
            description: '대시보드 페이지 모듈',
            platforms: ['web'],
            dependencies: { modules: ['base-mantis-admin'] },
            provides: ['dashboard-page'],
            conflicts: [],
            envVariables: [],
            setupSteps: [],
            slots: {
              'web.routes': { path: 'dashboard', component: 'DashboardPage' },
              'web.menu': { id: 'dashboard', title: '대시보드', type: 'item', url: '/dashboard' }
            }
          },
          path: '/modules/page-dashboard'
        }
      ];
      vi.mocked(loadAllModules).mockResolvedValue(modulesWithPage);

      const result = await listModules('page');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('page-dashboard');
    });

    it('should filter by category', async () => {
      vi.mocked(loadAllModules).mockResolvedValue(mockModules);

      const result = await listModules('media');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('bridge-camera');
    });

    it('should return empty for non-existent category', async () => {
      vi.mocked(loadAllModules).mockResolvedValue(mockModules);

      const result = await listModules('nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('resolveDependencies', () => {
    const mockCoreModule = {
      meta: {
        name: 'core-bridge',
        displayName: 'Core Bridge',
        version: '1.0.0',
        category: 'core',
        description: 'Core bridge',
        platforms: ['web'],
        dependencies: { modules: [], npm: { 'core-lib': '^1.0.0' } },
        provides: ['bridge-core'],
        conflicts: [],
        envVariables: [],
        setupSteps: []
      },
      path: '/modules/core-bridge'
    };

    const mockCameraModule = {
      meta: {
        name: 'bridge-camera',
        displayName: 'Camera Bridge',
        version: '1.0.0',
        category: 'media',
        description: 'Camera access',
        platforms: ['ios'],
        dependencies: { modules: ['core-bridge'], npm: { 'camera-lib': '^2.0.0' } },
        provides: ['camera-access'],
        conflicts: [],
        envVariables: [
          { name: 'CAMERA_KEY', description: 'API Key', required: true }
        ],
        setupSteps: [
          { platform: 'ios', instruction: 'Add camera permission' }
        ]
      },
      path: '/modules/bridge-camera'
    };

    // resolveDependencies uses loadAllModules, not loadModule
    it('should resolve simple dependencies', async () => {
      vi.mocked(loadAllModules).mockResolvedValue([mockCoreModule]);

      const result = await resolveDependencies(['core-bridge']);
      expect(result.resolvedModules).toContain('core-bridge');
      expect(result.npmDependencies).toHaveProperty('core-lib');
    });

    it('should resolve transitive dependencies', async () => {
      vi.mocked(loadAllModules).mockResolvedValue([mockCoreModule, mockCameraModule]);

      const result = await resolveDependencies(['bridge-camera']);
      expect(result.resolvedModules).toContain('bridge-camera');
      expect(result.resolvedModules).toContain('core-bridge');
    });

    it('should merge npm dependencies', async () => {
      vi.mocked(loadAllModules).mockResolvedValue([mockCoreModule, mockCameraModule]);

      const result = await resolveDependencies(['bridge-camera']);
      expect(result.npmDependencies).toHaveProperty('core-lib');
      expect(result.npmDependencies).toHaveProperty('camera-lib');
    });

    it('should collect env variables', async () => {
      vi.mocked(loadAllModules).mockResolvedValue([mockCoreModule, mockCameraModule]);

      const result = await resolveDependencies(['bridge-camera']);
      expect(result.envVariables).toHaveLength(1);
      expect(result.envVariables[0].name).toBe('CAMERA_KEY');
    });

    it('should collect setup steps', async () => {
      vi.mocked(loadAllModules).mockResolvedValue([mockCoreModule, mockCameraModule]);

      const result = await resolveDependencies(['bridge-camera']);
      // setupSteps is string[] like "[IOS] Add camera permission"
      expect(result.setupSteps).toHaveLength(1);
      expect(result.setupSteps[0]).toContain('IOS');
      expect(result.setupSteps[0]).toContain('Add camera permission');
    });

    it('should throw error for missing module', async () => {
      vi.mocked(loadAllModules).mockResolvedValue([]);

      await expect(resolveDependencies(['non-existent'])).rejects.toThrow();
    });
  });
});

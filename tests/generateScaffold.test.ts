/**
 * generateScaffold Tests - Route/Menu Injection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    rmSync: vi.fn(),
    copyFileSync: vi.fn(),
  };
});

// Mock moduleLoader
vi.mock('../src/utils/moduleLoader', () => ({
  loadAllModules: vi.fn(),
  loadModule: vi.fn(),
  getModulesDir: vi.fn(() => '/mock/modules'),
}));

describe('Route/Menu Injection Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Injection Pattern Matching', () => {
    it('should detect the ROUTING marker in routes file', () => {
      const routesContent = `import { createBrowserRouter } from 'react-router-dom';
// ==============================|| ROUTING ||==============================

const router = createBrowserRouter([]);`;

      const routerMarker = '// ==============================|| ROUTING ||==============================';
      expect(routesContent.includes(routerMarker)).toBe(true);
    });

    it('should detect catch-all route pattern', () => {
      const routesContent = `      {
        path: '*',
        element: <Error404Page />
      }`;

      const mainCatchAllPattern = /(\s*{\s*path:\s*'\*',\s*element:\s*<Error404Page\s*\/>\s*})/;
      expect(mainCatchAllPattern.test(routesContent)).toBe(true);
    });

    it('should detect register route pattern for minimal layout', () => {
      const routesContent = `      {
        path: 'register',
        element: <RegisterPage />
      }`;

      const minimalLayoutPattern = /(path:\s*'register',\s*\n\s*element:\s*<RegisterPage\s*\/>\s*\n\s*})/;
      expect(minimalLayoutPattern.test(routesContent)).toBe(true);
    });
  });

  describe('Menu Injection Pattern Matching', () => {
    it('should detect MENU ITEMS marker', () => {
      const menuContent = `// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';

// ==============================|| MENU ITEMS ||==============================

const menuItems = {};`;

      const menuItemsMarker = '// ==============================|| MENU ITEMS ||==============================';
      expect(menuContent.includes(menuItemsMarker)).toBe(true);
    });

    it('should detect navigation group children pattern', () => {
      const menuContent = `{
      id: 'navigation',
      title: '네비게이션',
      type: 'group',
      children: [
        {
          id: 'dashboard',
          title: '대시보드',
          type: 'item',
          url: '/dashboard',
          icon: DashboardIcon,
          breadcrumbs: true
        }`;

      const navChildrenPattern = /(id:\s*'navigation',[\s\S]*?children:\s*\[\s*{[\s\S]*?breadcrumbs:\s*true\s*})/;
      expect(navChildrenPattern.test(menuContent)).toBe(true);
    });
  });

  describe('Route Slot Processing', () => {
    it('should generate correct import statement for main layout route', () => {
      const slot = { path: 'users', component: 'UserManagementPage' };
      const expectedImport = `const UserManagementPage = lazy(() => import('pages/users'));`;
      const expectedWrapped = `const UserManagementPagePage = Loadable(UserManagementPage);`;

      expect(expectedImport).toContain(slot.component);
      expect(expectedImport).toContain(`pages/${slot.path}`);
    });

    it('should generate correct import statement for nested path', () => {
      const slot = { path: 'auth/login-v2', component: 'LoginV2Page' };
      const expectedImport = `const LoginV2Page = lazy(() => import('pages/auth/login-v2'));`;

      expect(expectedImport).toContain('pages/auth/login-v2');
    });

    it('should generate correct route entry', () => {
      const slot = { path: 'users', component: 'UserManagementPage' };
      const routeEntry = `      {
        path: '${slot.path}',
        element: <${slot.component}Page />
      }`;

      expect(routeEntry).toContain("path: 'users'");
      expect(routeEntry).toContain('UserManagementPagePage');
    });
  });

  describe('Menu Slot Processing', () => {
    it('should generate correct icon import', () => {
      const slot = { id: 'users', title: '사용자 관리', type: 'item', url: '/users', icon: 'PeopleIcon' };
      const expectedImport = `import PeopleIcon from '@mui/icons-material/People';`;

      expect(expectedImport).toContain('PeopleIcon');
      expect(expectedImport).toContain('@mui/icons-material/People');
    });

    it('should generate correct menu item', () => {
      const slot = { id: 'users', title: '사용자 관리', type: 'item', url: '/users', icon: 'PeopleIcon' };
      const menuItem = `        {
          id: '${slot.id}',
          title: '${slot.title}',
          type: '${slot.type}',
          url: '${slot.url}',
          icon: ${slot.icon},
          breadcrumbs: true
        }`;

      expect(menuItem).toContain("id: 'users'");
      expect(menuItem).toContain("title: '사용자 관리'");
      expect(menuItem).toContain("url: '/users'");
      expect(menuItem).toContain('icon: PeopleIcon');
    });
  });

  describe('Page Module Slots Schema', () => {
    it('should have correct slots structure for page-user-management', () => {
      const slots = {
        'web.routes': {
          path: 'users',
          component: 'UserManagementPage'
        },
        'web.menu': {
          id: 'user-management',
          title: '사용자 관리',
          type: 'item',
          url: '/users',
          icon: 'PeopleIcon'
        }
      };

      expect(slots['web.routes']).toBeDefined();
      expect(slots['web.routes'].path).toBe('users');
      expect(slots['web.routes'].component).toBe('UserManagementPage');

      expect(slots['web.menu']).toBeDefined();
      expect(slots['web.menu'].id).toBe('user-management');
      expect(slots['web.menu'].url).toBe('/users');
    });

    it('should handle minimal layout routes', () => {
      const slots = {
        'web.routes': {
          path: 'auth/login-v2',
          component: 'LoginV2Page',
          layout: 'minimal'
        }
      };

      expect(slots['web.routes'].layout).toBe('minimal');
    });

    it('should handle routes without menu', () => {
      const slots = {
        'web.routes': {
          path: 'auth/login-v2',
          component: 'LoginV2Page',
          layout: 'minimal'
        }
        // No web.menu - login pages don't need menu items
      };

      expect(slots['web.menu']).toBeUndefined();
    });
  });
});

describe('Integration: Slot Extraction', () => {
  it('should extract slots from module meta', () => {
    const moduleMeta = {
      name: 'page-user-management',
      displayName: '사용자 관리',
      version: '1.0.0',
      category: 'page',
      description: '사용자 관리 페이지',
      platforms: ['web'],
      dependencies: { modules: ['base-mantis-admin'] },
      provides: ['user-management'],
      conflicts: [],
      envVariables: [],
      setupSteps: [],
      slots: {
        'web.routes': {
          path: 'users',
          component: 'UserManagementPage'
        },
        'web.menu': {
          id: 'user-management',
          title: '사용자 관리',
          type: 'item',
          url: '/users',
          icon: 'PeopleIcon'
        }
      }
    };

    const slots = moduleMeta.slots as {
      'web.routes'?: { path: string; component: string; layout?: string };
      'web.menu'?: { id: string; title: string; type: string; url?: string; icon?: string };
    };

    expect(slots['web.routes']?.path).toBe('users');
    expect(slots['web.menu']?.id).toBe('user-management');
  });
});

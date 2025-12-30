/**
 * Project Detector Utility
 * Detects and validates HWMS projects, manages hwms.config.json
 */

import * as fs from 'fs';
import * as path from 'path';

/** HWMS 프로젝트 설정 파일 구조 */
export interface HwmsConfig {
  version: string;
  createdAt: string;
  updatedAt: string;
  baseTemplate?: string;
  installedModules: Array<{
    name: string;
    version: string;
    installedAt: string;
  }>;
}

/** HWMS 프로젝트 정보 */
export interface HwmsProjectInfo {
  isValid: boolean;
  projectPath: string;
  webPath: string;
  androidPath?: string;
  configPath?: string;
  baseTemplate?: string;
  installedModules: string[];
  detectionMethod: 'config' | 'marker' | 'inference';
}

/** 알려진 페이지 모듈 매핑 */
const KNOWN_PAGE_MODULES: Record<string, string> = {
  dashboard: 'page-dashboard',
  login: 'page-login',
  register: 'page-register',
  users: 'page-user-management',
  'user-management': 'page-user-management',
  'sample-crud': 'page-sample-crud',
  'advanced-table': 'page-advanced-table',
  'multi-step-form': 'page-multi-step-form',
  'device-info': 'bridge-device-info',
};

/** 알려진 브릿지 모듈 매핑 */
const KNOWN_BRIDGE_MODULES: Record<string, string> = {
  core: 'native-bridge-core',
  camera: 'bridge-camera',
  'device-info': 'bridge-device-info',
  push: 'bridge-push',
};

/**
 * 주어진 경로가 유효한 HWMS 프로젝트인지 확인
 */
export async function detectHwmsProject(
  projectPath: string
): Promise<HwmsProjectInfo | null> {
  // 절대 경로로 변환
  const absPath = path.resolve(projectPath);

  // 기본 디렉토리 존재 확인
  if (!fs.existsSync(absPath)) {
    return null;
  }

  const webPath = path.join(absPath, 'web');
  const androidPath = path.join(absPath, 'android');
  const configPath = path.join(absPath, 'hwms.config.json');

  // web 디렉토리 필수
  if (!fs.existsSync(webPath)) {
    return null;
  }

  // 1. hwms.config.json으로 감지 시도
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(
        fs.readFileSync(configPath, 'utf-8')
      ) as HwmsConfig;
      return {
        isValid: true,
        projectPath: absPath,
        webPath,
        androidPath: fs.existsSync(androidPath) ? androidPath : undefined,
        configPath,
        baseTemplate: config.baseTemplate,
        installedModules: config.installedModules.map((m) => m.name),
        detectionMethod: 'config',
      };
    } catch {
      // config 파일이 손상된 경우 다른 방법으로 시도
    }
  }

  // 2. 마커 기반 감지
  if (detectByMarkers(webPath)) {
    const inferredModules = inferInstalledModules(webPath);
    const baseTemplate = detectBaseTemplate(webPath);

    return {
      isValid: true,
      projectPath: absPath,
      webPath,
      androidPath: fs.existsSync(androidPath) ? androidPath : undefined,
      configPath: undefined,
      baseTemplate,
      installedModules: inferredModules,
      detectionMethod: 'marker',
    };
  }

  // 3. 추론 기반 감지 (최소 조건)
  const routesFile = path.join(webPath, 'src', 'routes', 'index.jsx');
  const menuFile = path.join(webPath, 'src', 'menu-items', 'index.js');

  if (fs.existsSync(routesFile) || fs.existsSync(menuFile)) {
    const inferredModules = inferInstalledModules(webPath);
    const baseTemplate = detectBaseTemplate(webPath);

    return {
      isValid: true,
      projectPath: absPath,
      webPath,
      androidPath: fs.existsSync(androidPath) ? androidPath : undefined,
      configPath: undefined,
      baseTemplate,
      installedModules: inferredModules,
      detectionMethod: 'inference',
    };
  }

  return null;
}

/**
 * 마커 기반 HWMS 프로젝트 감지
 */
export function detectByMarkers(webPath: string): boolean {
  const routesFile = path.join(webPath, 'src', 'routes', 'index.jsx');
  const menuFile = path.join(webPath, 'src', 'menu-items', 'index.js');

  // routes 파일에서 HWMS 마커 확인
  if (fs.existsSync(routesFile)) {
    const content = fs.readFileSync(routesFile, 'utf-8');
    if (
      content.includes('ROUTING') ||
      content.includes('auto-generated') ||
      content.includes('HWMS')
    ) {
      return true;
    }
  }

  // menu-items 파일에서 마커 확인
  if (fs.existsSync(menuFile)) {
    const content = fs.readFileSync(menuFile, 'utf-8');
    if (
      content.includes('MENU ITEMS') ||
      content.includes('Auto-generated') ||
      content.includes('HWMS')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 디렉토리 스캔으로 설치된 모듈 추론
 */
export function inferInstalledModules(webPath: string): string[] {
  const installed: string[] = [];

  // 1. bridge 디렉토리 스캔
  const bridgeDir = path.join(webPath, 'src', 'bridge');
  if (fs.existsSync(bridgeDir)) {
    try {
      const entries = fs.readdirSync(bridgeDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const moduleName = KNOWN_BRIDGE_MODULES[entry.name];
          if (moduleName) {
            installed.push(moduleName);
          } else if (entry.name !== 'index.ts' && entry.name !== 'index.js') {
            // 알려지지 않은 브릿지 모듈 추론
            installed.push(`bridge-${entry.name}`);
          }
        }
      }
    } catch {
      // 디렉토리 읽기 실패 무시
    }
  }

  // 2. pages 디렉토리 스캔
  const pagesDir = path.join(webPath, 'src', 'pages');
  if (fs.existsSync(pagesDir)) {
    try {
      const entries = fs.readdirSync(pagesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const moduleName = KNOWN_PAGE_MODULES[entry.name];
          if (moduleName) {
            installed.push(moduleName);
          }
        }
      }
    } catch {
      // 디렉토리 읽기 실패 무시
    }
  }

  // 3. components 디렉토리에서 UI 모듈 감지
  const componentsDir = path.join(webPath, 'src', 'components');
  if (fs.existsSync(componentsDir)) {
    try {
      const entries = fs.readdirSync(componentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          // 알려진 UI 모듈 패턴
          if (entry.name === 'toast' || entry.name === 'Toast') {
            installed.push('ui-toast');
          } else if (entry.name === 'loading' || entry.name === 'Loading') {
            installed.push('ui-loading');
          } else if (
            entry.name === 'bottom-sheet' ||
            entry.name === 'BottomSheet'
          ) {
            installed.push('ui-bottom-sheet');
          }
        }
      }
    } catch {
      // 디렉토리 읽기 실패 무시
    }
  }

  // 중복 제거
  return [...new Set(installed)];
}

/**
 * 베이스 템플릿 감지
 */
export function detectBaseTemplate(webPath: string): string | undefined {
  // Mantis Admin 특징 확인
  const themeDir = path.join(webPath, 'src', 'themes');
  const layoutDir = path.join(webPath, 'src', 'layout');
  const menuItemsDir = path.join(webPath, 'src', 'menu-items');

  if (
    fs.existsSync(themeDir) &&
    fs.existsSync(layoutDir) &&
    fs.existsSync(menuItemsDir)
  ) {
    return 'base-mantis-admin';
  }

  return undefined;
}

/**
 * hwms.config.json 로드 또는 생성
 */
export async function loadOrCreateConfig(
  projectPath: string
): Promise<HwmsConfig> {
  const configPath = path.join(projectPath, 'hwms.config.json');

  // 기존 설정 파일이 있으면 로드
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as HwmsConfig;
    } catch {
      // 파싱 실패 시 새로 생성
    }
  }

  // 추론으로 초기 설정 생성
  const webPath = path.join(projectPath, 'web');
  const inferredModules = fs.existsSync(webPath)
    ? inferInstalledModules(webPath)
    : [];
  const baseTemplate = fs.existsSync(webPath)
    ? detectBaseTemplate(webPath)
    : undefined;

  const now = new Date().toISOString();
  const config: HwmsConfig = {
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
    baseTemplate,
    installedModules: inferredModules.map((name) => ({
      name,
      version: '1.0.0',
      installedAt: now,
    })),
  };

  return config;
}

/**
 * hwms.config.json 저장
 */
export async function saveConfig(
  projectPath: string,
  config: HwmsConfig
): Promise<void> {
  const configPath = path.join(projectPath, 'hwms.config.json');

  // 업데이트 시간 갱신
  config.updatedAt = new Date().toISOString();

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * 설정에 모듈 추가
 */
export function addModuleToConfig(config: HwmsConfig, moduleName: string): void {
  const now = new Date().toISOString();

  // 이미 있는지 확인
  const existing = config.installedModules.find((m) => m.name === moduleName);
  if (!existing) {
    config.installedModules.push({
      name: moduleName,
      version: '1.0.0',
      installedAt: now,
    });
  }
}

/**
 * 파일 백업 생성
 */
export function createBackup(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const backupPath = `${filePath}.backup`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * add_module MCP Tool
 * Adds new modules to an existing HWMS project
 */

import * as fs from 'fs';
import * as path from 'path';
import { resolveDependencies } from './resolveDependencies.js';
import { loadModule, type LoadedModule } from '../utils/moduleLoader.js';
import {
  detectHwmsProject,
  loadOrCreateConfig,
  saveConfig,
  addModuleToConfig,
  createBackup,
  type HwmsProjectInfo,
  type HwmsConfig,
} from '../utils/projectDetector.js';
import {
  loadModules,
  classifyModules,
  injectRoutes,
  injectMenuItems,
  injectNpmDependencies,
  addBridgeAliasToJsConfig,
  copyBridgeModule,
  copyUiModule,
  transformImports,
  generateBridgeHandlerKt,
  generateBridgeInterfaceKt,
  generateMainActivityKt,
  extractHandlerInfo,
  type ClassifiedModules,
  type RouteSlot,
  type MenuSlot,
  type HandlerInfo,
} from './generateScaffold.js';
import {
  type AddModuleResult,
  type ValidationResult,
} from '../schemas/addModuleSchema.js';

export { addModuleSchema } from '../schemas/addModuleSchema.js';

/**
 * Add modules to an existing HWMS project
 */
export async function addModule(
  projectPath: string,
  moduleNames: string[]
): Promise<AddModuleResult> {
  const result: AddModuleResult = {
    success: false,
    projectPath,
    addedModules: [],
    skippedModules: [],
    warnings: [],
    updatedFiles: [],
    backupFiles: [],
    newNpmDependencies: {},
    setupInstructions: [],
  };

  try {
    // 1. Detect and validate HWMS project
    const projectInfo = await detectHwmsProject(projectPath);
    if (!projectInfo || !projectInfo.isValid) {
      throw new Error(
        `유효한 HWMS 프로젝트가 아닙니다: ${projectPath}\n` +
          'HWMS로 생성된 프로젝트이거나 web/src/routes/index.jsx 파일이 있어야 합니다.'
      );
    }

    // 2. Load or create config
    const config = await loadOrCreateConfig(projectPath);

    // 3. Resolve dependencies
    const resolved = await resolveDependencies(moduleNames);

    // 4. Validate and filter modules
    const validation = validateModuleAddition(
      projectInfo,
      resolved.resolvedModules,
      resolved.warnings
    );

    result.skippedModules = validation.skippedModules;
    result.warnings = [...validation.warnings, ...resolved.warnings];

    if (validation.modulesToAdd.length === 0) {
      result.success = true;
      result.warnings.push('추가할 새 모듈이 없습니다.');
      return result;
    }

    // 5. Load and classify modules to add
    const loadedModules = await loadModules(validation.modulesToAdd);
    const classified = classifyModules(loadedModules);

    // 6. Add modules by category
    const webPath = projectInfo.webPath;

    // 6.1 Add bridge modules
    for (const mod of classified.bridgeModules) {
      const addedFiles = await addBridgeModuleToProject(
        mod,
        webPath,
        result.backupFiles
      );
      result.updatedFiles.push(...addedFiles);
      result.addedModules.push(mod.meta.name);
      addModuleToConfig(config, mod.meta.name);
    }

    // Add @bridge/* alias if bridge modules were added
    if (classified.bridgeModules.length > 0) {
      await addBridgeAliasToJsConfig(webPath);
    }

    // 6.2 Add UI modules
    for (const mod of classified.uiModules) {
      const addedFiles = await addUiModuleToProject(
        mod,
        webPath,
        result.backupFiles
      );
      result.updatedFiles.push(...addedFiles);
      result.addedModules.push(mod.meta.name);
      addModuleToConfig(config, mod.meta.name);
    }

    // 6.3 Add page modules
    if (classified.pageModules.length > 0) {
      const addedFiles = await addPageModulesToProject(
        classified.pageModules,
        webPath,
        result.backupFiles
      );
      result.updatedFiles.push(...addedFiles);

      // Inject npm dependencies
      await injectNpmDependencies(webPath, classified.pageModules);

      for (const mod of classified.pageModules) {
        result.addedModules.push(mod.meta.name);
        addModuleToConfig(config, mod.meta.name);

        // Collect npm dependencies for result
        if (mod.meta.dependencies?.npm) {
          Object.assign(result.newNpmDependencies, mod.meta.dependencies.npm);
        }
      }
    }

    // 7. Update Android if bridge modules added and android directory exists
    if (classified.bridgeModules.length > 0 && projectInfo.androidPath) {
      const androidFiles = await updateAndroidBridge(
        projectInfo.androidPath,
        config,
        result.backupFiles
      );
      result.updatedFiles.push(...androidFiles);
    }

    // 8. Save updated config
    await saveConfig(projectPath, config);
    result.updatedFiles.push('hwms.config.json');

    // 9. Collect setup instructions
    result.setupInstructions = resolved.setupSteps;

    // 10. Add npm install reminder if new dependencies
    if (Object.keys(result.newNpmDependencies).length > 0) {
      result.setupInstructions.unshift(
        '[WEB] cd web && npm install 실행하여 새 의존성을 설치하세요.'
      );
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.warnings.push(
      `오류 발생: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return result;
}

/**
 * Validate module addition
 */
function validateModuleAddition(
  projectInfo: HwmsProjectInfo,
  newModules: string[],
  resolveWarnings: string[]
): ValidationResult {
  const result: ValidationResult = {
    canProceed: true,
    modulesToAdd: [],
    skippedModules: [],
    warnings: [],
  };

  for (const moduleName of newModules) {
    // Check if already installed
    if (projectInfo.installedModules.includes(moduleName)) {
      result.skippedModules.push({
        name: moduleName,
        reason: 'already_installed',
      });
      continue;
    }

    // Check for conflict warnings
    const hasConflict = resolveWarnings.some(
      (w) => w.includes(moduleName) && w.includes('충돌')
    );
    if (hasConflict) {
      result.warnings.push(`경고: ${moduleName}에 충돌이 감지되었습니다.`);
      // Still add but with warning
    }

    result.modulesToAdd.push(moduleName);
  }

  return result;
}

/**
 * Add a bridge module to the project
 */
async function addBridgeModuleToProject(
  mod: LoadedModule,
  webPath: string,
  backupFiles: string[]
): Promise<string[]> {
  const addedFiles: string[] = [];
  const directories: string[] = [];
  const files: string[] = [];

  // Determine destination folder name
  let destName = mod.meta.name;
  if (destName === 'native-bridge-core') {
    destName = 'core';
  } else if (destName.startsWith('bridge-')) {
    destName = destName.replace('bridge-', '');
  }

  const destPath = path.join(webPath, 'src/bridge', destName);

  // Backup existing if present
  if (fs.existsSync(destPath)) {
    const backup = createBackup(destPath);
    if (backup) backupFiles.push(backup);
  }

  // Use the existing copyBridgeModule function
  await copyBridgeModule(mod, webPath, directories, files);

  addedFiles.push(...files);
  return addedFiles;
}

/**
 * Add a UI module to the project
 */
async function addUiModuleToProject(
  mod: LoadedModule,
  webPath: string,
  backupFiles: string[]
): Promise<string[]> {
  const addedFiles: string[] = [];
  const directories: string[] = [];
  const files: string[] = [];

  // Determine destination folder name
  let destName = mod.meta.name;
  if (destName.startsWith('ui-')) {
    destName = destName.replace('ui-', '');
  }

  const componentPath = path.join(webPath, 'src/components', destName);

  // Backup existing if present
  if (fs.existsSync(componentPath)) {
    const backup = createBackup(componentPath);
    if (backup) backupFiles.push(backup);
  }

  // Use the existing copyUiModule function
  await copyUiModule(mod, webPath, directories, files);

  addedFiles.push(...files);
  return addedFiles;
}

/**
 * Add page modules to the project
 */
async function addPageModulesToProject(
  pageModules: LoadedModule[],
  webPath: string,
  backupFiles: string[]
): Promise<string[]> {
  const addedFiles: string[] = [];
  const routeSlots: RouteSlot[] = [];
  const menuSlots: MenuSlot[] = [];

  for (const mod of pageModules) {
    const srcPath = path.join(mod.path, 'src');
    if (!fs.existsSync(srcPath)) continue;

    // Determine destination folder name
    let destName = mod.meta.name;
    if (destName.startsWith('page-')) {
      destName = destName.replace('page-', '');
    }

    // Extract slots from module meta
    const slots = mod.meta.slots as {
      'web.routes'?: RouteSlot | RouteSlot[];
      'web.menu'?: MenuSlot;
    } | undefined;

    // Handle routes
    const webRoutes = slots?.['web.routes'];
    if (webRoutes) {
      if (Array.isArray(webRoutes)) {
        // Multi-route module
        const baseDir = destName;
        webRoutes.forEach((route) => {
          routeSlots.push({ ...route, baseDir });
        });

        // Copy files to base directory
        const destDir = path.join(webPath, 'src/pages', baseDir);

        // Backup if exists
        if (fs.existsSync(destDir)) {
          const backup = createBackup(destDir);
          if (backup) backupFiles.push(backup);
        }

        fs.mkdirSync(destDir, { recursive: true });

        const entries = fs.readdirSync(srcPath);
        for (const entry of entries) {
          const srcFile = path.join(srcPath, entry);
          if (fs.statSync(srcFile).isFile()) {
            const destFile = path.join(destDir, entry);
            fs.copyFileSync(srcFile, destFile);
            addedFiles.push(`web/src/pages/${baseDir}/${entry}`);
          }
        }
      } else {
        // Single route module
        routeSlots.push(webRoutes);

        const routePath = webRoutes.path;
        const destDir = path.join(
          webPath,
          'src/pages',
          routePath.replace(/\//g, path.sep)
        );

        // Backup if exists
        if (fs.existsSync(destDir)) {
          const backup = createBackup(destDir);
          if (backup) backupFiles.push(backup);
        }

        fs.mkdirSync(destDir, { recursive: true });

        const entries = fs.readdirSync(srcPath);
        for (const entry of entries) {
          const srcFile = path.join(srcPath, entry);
          if (fs.statSync(srcFile).isFile()) {
            const destFile = path.join(destDir, entry);
            fs.copyFileSync(srcFile, destFile);
            addedFiles.push(`web/src/pages/${routePath}/${entry}`);
          }
        }
      }
    }

    if (slots?.['web.menu']) {
      menuSlots.push(slots['web.menu']);
    }
  }

  // Backup and inject routes
  if (routeSlots.length > 0) {
    const routesFile = path.join(webPath, 'src/routes/index.jsx');
    if (fs.existsSync(routesFile)) {
      const backup = createBackup(routesFile);
      if (backup) backupFiles.push(backup);
    }
    await injectRoutes(webPath, routeSlots, addedFiles);
    addedFiles.push('web/src/routes/index.jsx');
  }

  // Backup and inject menu items
  if (menuSlots.length > 0) {
    const menuFile = path.join(webPath, 'src/menu-items/index.js');
    if (fs.existsSync(menuFile)) {
      const backup = createBackup(menuFile);
      if (backup) backupFiles.push(backup);
    }
    await injectMenuItems(webPath, menuSlots, addedFiles);
    addedFiles.push('web/src/menu-items/index.js');
  }

  return addedFiles;
}

/**
 * Update Android bridge handlers
 */
async function updateAndroidBridge(
  androidPath: string,
  config: HwmsConfig,
  backupFiles: string[]
): Promise<string[]> {
  const updatedFiles: string[] = [];

  // Get all installed bridge modules
  const bridgeModuleNames = config.installedModules
    .map((m) => m.name)
    .filter(
      (name) => name.startsWith('bridge-') || name === 'native-bridge-core'
    );

  if (bridgeModuleNames.length === 0) {
    return updatedFiles;
  }

  // Load bridge modules
  const bridgeModules: LoadedModule[] = [];
  for (const name of bridgeModuleNames) {
    const loaded = await loadModule(name);
    if (loaded) {
      bridgeModules.push(loaded);
    }
  }

  // Bridge directory
  const bridgeDest = path.join(
    androidPath,
    'app/src/main/java/com/template/bridge'
  );

  if (!fs.existsSync(bridgeDest)) {
    fs.mkdirSync(bridgeDest, { recursive: true });
  }

  // Collect handler info
  const handlerInfos: HandlerInfo[] = [];

  // Copy handlers and extract info
  for (const mod of bridgeModules) {
    const androidDir = path.join(mod.path, 'android');
    if (fs.existsSync(androidDir)) {
      const handlers = fs
        .readdirSync(androidDir)
        .filter((f) => f.endsWith('.kt'));
      for (const handler of handlers) {
        const srcFile = path.join(androidDir, handler);
        const destFile = path.join(bridgeDest, handler);

        // Backup existing
        if (fs.existsSync(destFile)) {
          const backup = createBackup(destFile);
          if (backup) backupFiles.push(backup);
        }

        fs.copyFileSync(srcFile, destFile);
        updatedFiles.push(
          `android/app/src/main/java/com/template/bridge/${handler}`
        );

        // Extract handler info
        const content = fs.readFileSync(srcFile, 'utf-8');
        const handlerInfo = extractHandlerInfo(handler, content, mod.meta.name);
        if (handlerInfo) {
          handlerInfos.push(handlerInfo);
        }
      }
    }
  }

  // Regenerate BridgeHandler.kt
  const bridgeHandlerPath = path.join(bridgeDest, 'BridgeHandler.kt');
  if (fs.existsSync(bridgeHandlerPath)) {
    const backup = createBackup(bridgeHandlerPath);
    if (backup) backupFiles.push(backup);
  }
  const bridgeHandler = generateBridgeHandlerKt(handlerInfos);
  fs.writeFileSync(bridgeHandlerPath, bridgeHandler);
  updatedFiles.push(
    'android/app/src/main/java/com/template/bridge/BridgeHandler.kt'
  );

  // Regenerate BridgeInterface.kt
  const bridgeInterfacePath = path.join(bridgeDest, 'BridgeInterface.kt');
  if (fs.existsSync(bridgeInterfacePath)) {
    const backup = createBackup(bridgeInterfacePath);
    if (backup) backupFiles.push(backup);
  }
  const bridgeInterface = generateBridgeInterfaceKt();
  fs.writeFileSync(bridgeInterfacePath, bridgeInterface);
  updatedFiles.push(
    'android/app/src/main/java/com/template/bridge/BridgeInterface.kt'
  );

  // Regenerate MainActivity.kt if activity handlers exist
  const activityHandlers = handlerInfos.filter((h) => h.requiresActivity);
  if (activityHandlers.length > 0) {
    const mainActivityDest = path.join(
      androidPath,
      'app/src/main/java/com/template'
    );
    const mainActivityPath = path.join(mainActivityDest, 'MainActivity.kt');

    if (fs.existsSync(mainActivityPath)) {
      const backup = createBackup(mainActivityPath);
      if (backup) backupFiles.push(backup);
    }

    const mainActivity = generateMainActivityKt(activityHandlers);
    fs.writeFileSync(mainActivityPath, mainActivity);
    updatedFiles.push('android/app/src/main/java/com/template/MainActivity.kt');
  }

  return updatedFiles;
}

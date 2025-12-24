/**
 * generate_scaffold MCP Tool (v2)
 * Generates project structure with web/ and android/ separation
 *
 * New Architecture:
 * - android/: Native Android shell from android-app-shell module
 * - web/: Vite + React application with bridge and UI modules
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { resolveDependencies } from './resolveDependencies.js';
import { loadModule, type LoadedModule } from '../utils/moduleLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory (relative to src/tools)
const OUTPUT_DIR = path.resolve(__dirname, '../../output');

/** Scaffold result */
export interface ScaffoldResult {
  outputPath: string;
  structure: {
    directories: string[];
    files: string[];
  };
  setupInstructions: string[];
  webCommand: string;
  androidPath: string;
}

/** Tool input schema */
export const generateScaffoldSchema = {
  type: 'object' as const,
  properties: {
    projectName: {
      type: 'string',
      description: '생성할 프로젝트 이름 (예: "my-hybrid-app")',
    },
    modules: {
      type: 'array',
      items: { type: 'string' },
      description: '포함할 모듈 이름 배열 (의존성은 자동 해결됨)',
    },
  },
  required: ['projectName', 'modules'],
};

/** Module classification */
interface ClassifiedModules {
  bridgeModules: LoadedModule[];
  uiModules: LoadedModule[];
  pageModules: LoadedModule[];
  androidShell: LoadedModule | null;
  baseTemplate: LoadedModule | null;
  otherModules: LoadedModule[];
}

/**
 * Generate project scaffold with new architecture
 */
export async function generateScaffold(
  projectName: string,
  moduleNames: string[]
): Promise<ScaffoldResult> {
  // Validate project name
  if (!/^[a-z0-9-_]+$/i.test(projectName)) {
    throw new Error('프로젝트 이름은 영문, 숫자, 하이픈, 언더스코어만 사용할 수 있습니다.');
  }

  // Resolve dependencies
  const resolved = await resolveDependencies(moduleNames);

  // Create output directory
  const projectPath = path.join(OUTPUT_DIR, projectName);

  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true });
  }

  const directories: string[] = [];
  const files: string[] = [];

  // Create base structure
  await createBaseStructure(projectPath, directories);

  // Load and classify modules
  const loadedModules = await loadModules(resolved.resolvedModules);
  const classified = classifyModules(loadedModules);

  // Generate Android project with modular handlers
  if (classified.androidShell) {
    await generateAndroidProject(
      projectPath,
      classified.androidShell,
      classified.bridgeModules,
      directories,
      files
    );
  }

  // Generate Web project
  await generateWebProject(
    projectPath,
    projectName,
    classified,
    resolved.envVariables,
    directories,
    files
  );

  // Generate root files
  await generateRootFiles(
    projectPath,
    projectName,
    resolved.resolvedModules,
    resolved.setupSteps,
    resolved.envVariables,
    classified.androidShell !== null,
    files
  );

  // Generate docs
  await generateDocs(projectPath, resolved.setupSteps, files);

  return {
    outputPath: projectPath,
    structure: { directories, files },
    setupInstructions: resolved.setupSteps,
    webCommand: 'cd web && npm install && npm run dev',
    androidPath: classified.androidShell ? 'android/' : '',
  };
}

/**
 * Create base directory structure
 */
async function createBaseStructure(projectPath: string, directories: string[]): Promise<void> {
  const structure = [
    'web',
    'web/src',
    'web/src/bridge',
    'web/src/components',
    'web/src/hooks',
    'web/src/pages',
    'web/src/styles',
    'web/src/styles/modules',
    'docs',
  ];

  for (const dir of structure) {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
    directories.push(dir);
  }
}

/**
 * Load modules from names
 */
async function loadModules(moduleNames: string[]): Promise<LoadedModule[]> {
  const modules: LoadedModule[] = [];
  for (const name of moduleNames) {
    const loaded = await loadModule(name);
    if (loaded) {
      modules.push(loaded);
    }
  }
  return modules;
}

/**
 * Classify modules by type
 */
function classifyModules(modules: LoadedModule[]): ClassifiedModules {
  const result: ClassifiedModules = {
    bridgeModules: [],
    uiModules: [],
    pageModules: [],
    androidShell: null,
    baseTemplate: null,
    otherModules: [],
  };

  for (const mod of modules) {
    const name = mod.meta.name;
    const category = mod.meta.category;

    if (category === 'base') {
      // Base template module (e.g., base-mantis-admin)
      result.baseTemplate = mod;
    } else if (category === 'page') {
      // Page modules (e.g., page-dashboard, page-crud-list)
      result.pageModules.push(mod);
    } else if (name === 'android-app-shell') {
      result.androidShell = mod;
    } else if (name.startsWith('bridge-') || name === 'native-bridge-core' || category === 'core') {
      result.bridgeModules.push(mod);
    } else if (name.startsWith('ui-') || category === 'ui') {
      result.uiModules.push(mod);
    } else {
      result.otherModules.push(mod);
    }
  }

  return result;
}

/**
 * Generate Android project structure with modular handlers
 */
async function generateAndroidProject(
  projectPath: string,
  androidShell: LoadedModule,
  bridgeModules: LoadedModule[],
  directories: string[],
  files: string[]
): Promise<void> {
  const androidSrc = path.join(androidShell.path, 'android');
  const androidDest = path.join(projectPath, 'android');

  if (!fs.existsSync(androidSrc)) return;

  // Copy base Android structure (excluding hardcoded handlers)
  copyAndroidBase(androidSrc, androidDest);
  directories.push('android/app', 'android/app/src', 'android/gradle');
  files.push('android/build.gradle.kts', 'android/settings.gradle.kts');

  // Bridge directory
  const bridgeDest = path.join(androidDest, 'app/src/main/java/com/template/bridge');
  fs.mkdirSync(bridgeDest, { recursive: true });
  directories.push('android/app/src/main/java/com/template/bridge');

  // Collect handlers info for dynamic generation
  const handlerInfos: HandlerInfo[] = [];

  // Copy Android handlers from each bridge module
  for (const mod of bridgeModules) {
    const androidDir = path.join(mod.path, 'android');
    if (fs.existsSync(androidDir)) {
      const handlers = fs.readdirSync(androidDir).filter(f => f.endsWith('.kt'));
      for (const handler of handlers) {
        const srcFile = path.join(androidDir, handler);
        const destFile = path.join(bridgeDest, handler);
        fs.copyFileSync(srcFile, destFile);
        files.push(`android/app/src/main/java/com/template/bridge/${handler}`);

        // Extract handler info for BridgeHandler generation
        const content = fs.readFileSync(srcFile, 'utf-8');
        const handlerInfo = extractHandlerInfo(handler, content, mod.meta.name);
        if (handlerInfo) {
          handlerInfos.push(handlerInfo);
        }
      }
    }
  }

  // Generate dynamic BridgeHandler.kt
  const bridgeHandler = generateBridgeHandlerKt(handlerInfos);
  fs.writeFileSync(path.join(bridgeDest, 'BridgeHandler.kt'), bridgeHandler);
  files.push('android/app/src/main/java/com/template/bridge/BridgeHandler.kt');

  // Generate BridgeInterface.kt
  const bridgeInterface = generateBridgeInterfaceKt();
  fs.writeFileSync(path.join(bridgeDest, 'BridgeInterface.kt'), bridgeInterface);
  files.push('android/app/src/main/java/com/template/bridge/BridgeInterface.kt');

  // Generate MainActivity.kt with activity handlers setup
  const activityHandlers = handlerInfos.filter(h => h.requiresActivity);
  if (activityHandlers.length > 0) {
    const mainActivityDest = path.join(androidDest, 'app/src/main/java/com/template');
    const mainActivity = generateMainActivityKt(activityHandlers);
    fs.writeFileSync(path.join(mainActivityDest, 'MainActivity.kt'), mainActivity);
    files.push('android/app/src/main/java/com/template/MainActivity.kt');
  }
}

/** Handler info for dynamic generation */
interface HandlerInfo {
  className: string;
  actionPrefix: string;
  moduleName: string;
  requiresActivity: boolean;
}

/**
 * Extract handler information from Kotlin file
 */
function extractHandlerInfo(fileName: string, content: string, moduleName: string): HandlerInfo | null {
  const className = fileName.replace('.kt', '');

  // Look for ACTION_PREFIX constant
  const prefixMatch = content.match(/const val ACTION_PREFIX\s*=\s*["'](.+?)["']/);
  const actionPrefix = prefixMatch ? prefixMatch[1] : '';

  if (!actionPrefix) return null;

  // Check if handler requires Activity (has ComponentActivity in constructor)
  const requiresActivity = content.includes('ComponentActivity');

  return {
    className,
    actionPrefix,
    moduleName,
    requiresActivity,
  };
}

/**
 * Copy Android base structure without hardcoded handlers
 */
function copyAndroidBase(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip bridge directory - we'll generate it dynamically
      if (entry.name === 'bridge' && srcPath.includes('java/com/template')) {
        continue;
      }
      copyAndroidBase(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Generate BridgeHandler.kt dynamically based on selected modules
 */
function generateBridgeHandlerKt(handlers: HandlerInfo[]): string {
  // Separate handlers by type
  const contextHandlers = handlers.filter(h => !h.requiresActivity);
  const activityHandlers = handlers.filter(h => h.requiresActivity);

  // Generate handler declarations
  const contextDecls = contextHandlers.map(h =>
    `    private val ${h.className.charAt(0).toLowerCase() + h.className.slice(1)}: ${h.className}`
  ).join('\n');

  const activityDecls = activityHandlers.map(h =>
    `    private var ${h.className.charAt(0).toLowerCase() + h.className.slice(1)}: ${h.className}? = null`
  ).join('\n');

  // Generate handler initializations
  const contextInits = contextHandlers.map(h => {
    const varName = h.className.charAt(0).toLowerCase() + h.className.slice(1);
    return `        ${varName} = ${h.className}(context, ::sendSuccess, ::sendError)`;
  }).join('\n');

  // Generate setter methods for activity handlers
  const setterMethods = activityHandlers.map(h => {
    const varName = h.className.charAt(0).toLowerCase() + h.className.slice(1);
    return `
    /**
     * Set ${h.className} (must be called from Activity)
     */
    fun set${h.className}(handler: ${h.className}) {
        ${varName} = handler
    }`;
  }).join('\n');

  // Generate action routing
  const actionRoutes = handlers.map(h => {
    const varName = h.className.charAt(0).toLowerCase() + h.className.slice(1);
    if (h.requiresActivity) {
      return `                action.startsWith("${h.actionPrefix}") -> {
                    val handler = ${varName}
                    if (handler != null) {
                        handler.handleAction(action, params, callbackId)
                    } else {
                        sendError(callbackId, "HANDLER_NOT_AVAILABLE", "${h.className} not initialized")
                    }
                }`;
    } else {
      return `                action.startsWith("${h.actionPrefix}") -> ${varName}.handleAction(action, params, callbackId)`;
    }
  }).join('\n');

  return `package com.template.bridge

import android.content.Context
import android.webkit.WebView
import org.json.JSONObject

/**
 * Bridge Handler - Routes actions to appropriate handlers
 * Auto-generated based on selected HWMS modules
 */
class BridgeHandler(
    private val context: Context,
    private val webView: WebView
) {
    // Context-based handlers
${contextDecls || '    // No context handlers'}

    // Activity-based handlers (require ActivityResultLauncher)
${activityDecls || '    // No activity handlers'}

    init {
${contextInits || '        // No context handlers to initialize'}
    }
${setterMethods}

    /**
     * Handle incoming action from JavaScript
     */
    fun handleAction(action: String, params: JSONObject, callbackId: String) {
        try {
            when {
${actionRoutes || '                // No handlers registered'}
                else -> sendError(callbackId, "ACTION_NOT_FOUND", "Unknown action: $action")
            }
        } catch (e: Exception) {
            sendError(callbackId, "NATIVE_ERROR", e.message ?: "Unknown error")
        }
    }

    /**
     * Send success response to JavaScript
     */
    fun sendSuccess(callbackId: String, data: JSONObject) {
        val response = JSONObject().apply {
            put("success", true)
            put("data", data)
        }
        executeCallback(callbackId, response)
    }

    /**
     * Send error response to JavaScript
     */
    fun sendError(callbackId: String, code: String, message: String) {
        val response = JSONObject().apply {
            put("success", false)
            put("error", JSONObject().apply {
                put("code", code)
                put("message", message)
            })
        }
        executeCallback(callbackId, response)
    }

    /**
     * Execute JavaScript callback
     */
    private fun executeCallback(callbackId: String, response: JSONObject) {
        val script = "window.__handleBridgeResponse('$callbackId', \${response})"
        webView.post {
            webView.evaluateJavascript(script, null)
        }
    }

    /**
     * Send event to JavaScript
     */
    fun sendEvent(eventName: String, data: Any?) {
        val eventData = JSONObject().put("data", data)
        val script = "window.__handleBridgeEvent && window.__handleBridgeEvent('$eventName', \${eventData})"
        webView.post {
            webView.evaluateJavascript(script, null)
        }
    }
}
`;
}

/**
 * Generate BridgeInterface.kt
 */
function generateBridgeInterfaceKt(): string {
  return `package com.template.bridge

import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

/**
 * Bridge Interface for JavaScript-Native communication
 * Exposes methods to JavaScript via @JavascriptInterface
 * Auto-generated by HWMS
 */
class BridgeInterface(
    private val webView: WebView,
    private val handler: BridgeHandler
) {
    /**
     * Receives messages from JavaScript
     * @param jsonString JSON string containing action, params, and callbackId
     */
    @JavascriptInterface
    fun postMessage(jsonString: String) {
        try {
            val message = JSONObject(jsonString)
            val action = message.getString("action")
            val params = message.optJSONObject("params") ?: JSONObject()
            val callbackId = message.getString("callbackId")

            // Handle action on main thread
            webView.post {
                handler.handleAction(action, params, callbackId)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
`;
}

/**
 * Generate MainActivity.kt with activity handlers setup
 */
function generateMainActivityKt(activityHandlers: HandlerInfo[]): string {
  // Generate imports
  const imports = activityHandlers.map(h =>
    `import com.template.bridge.${h.className}`
  ).join('\n');

  // Generate handler initialization
  const handlerInits = activityHandlers.map(h => {
    const varName = h.className.charAt(0).toLowerCase() + h.className.slice(1);
    return `        // Initialize ${h.className}
        val ${varName} = ${h.className}(
            activity = this,
            onResult = { callbackId, data ->
                bridgeHandler.sendSuccess(callbackId, data)
            },
            onError = { callbackId, code, message ->
                bridgeHandler.sendError(callbackId, code, message)
            }
        )
        bridgeHandler.set${h.className}(${varName})`;
  }).join('\n\n');

  return `package com.template

${imports}

/**
 * Main Activity - Entry point with activity-based handlers
 * Auto-generated by HWMS based on selected modules
 */
class MainActivity : WebViewActivity() {

    /**
     * Initialize activity-based handlers that require ActivityResultLauncher
     */
    override fun setupNativeHandlers() {
${handlerInits}
    }
}
`;
}

/**
 * Generate Web project with Vite + React
 */
async function generateWebProject(
  projectPath: string,
  projectName: string,
  classified: ClassifiedModules,
  envVariables: Array<{ name: string; description: string; required: boolean; default?: string }>,
  directories: string[],
  files: string[]
): Promise<void> {
  const webPath = path.join(projectPath, 'web');

  // Check if base template is provided
  if (classified.baseTemplate && classified.baseTemplate.meta.templatePath) {
    // Use base template - copy entire template directory
    await copyBaseTemplate(
      classified.baseTemplate,
      webPath,
      projectName,
      directories,
      files
    );

    // Overlay additional bridge modules if any
    for (const mod of classified.bridgeModules) {
      await copyBridgeModule(mod, webPath, directories, files);
    }

    // Overlay additional UI modules if any
    for (const mod of classified.uiModules) {
      await copyUiModule(mod, webPath, directories, files);
    }

    // Copy page modules and update routes/menus
    if (classified.pageModules.length > 0) {
      await copyPageModules(classified.pageModules, webPath, directories, files);
    }

    // Inject npm dependencies from page modules into package.json
    await injectNpmDependencies(webPath, classified.pageModules);

    return;
  }

  // No base template - generate from scratch (existing logic)
  // 1. Generate package.json (with MUI deps if mantis modules are used)
  const packageJson = generateWebPackageJson(projectName, classified);
  fs.writeFileSync(path.join(webPath, 'package.json'), JSON.stringify(packageJson, null, 2));
  files.push('web/package.json');

  // 2. Generate vite.config.js
  const viteConfig = generateViteConfig();
  fs.writeFileSync(path.join(webPath, 'vite.config.js'), viteConfig);
  files.push('web/vite.config.js');

  // 3. Generate tsconfig.json
  const tsConfig = generateWebTsConfig();
  fs.writeFileSync(path.join(webPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
  files.push('web/tsconfig.json');

  // 3.1. Generate tsconfig.node.json
  const tsConfigNode = generateWebTsConfigNode();
  fs.writeFileSync(path.join(webPath, 'tsconfig.node.json'), JSON.stringify(tsConfigNode, null, 2));
  files.push('web/tsconfig.node.json');

  // 4. Generate index.html
  const indexHtml = generateIndexHtml(projectName);
  fs.writeFileSync(path.join(webPath, 'index.html'), indexHtml);
  files.push('web/index.html');

  // 5. Copy bridge modules
  for (const mod of classified.bridgeModules) {
    await copyBridgeModule(mod, webPath, directories, files);
  }

  // 6. Copy UI modules
  for (const mod of classified.uiModules) {
    await copyUiModule(mod, webPath, directories, files);
  }

  // 7. Generate barrel exports
  await generateBarrelExports(webPath, classified, files);

  // 8. Generate main.tsx
  const mainTsx = generateMainTsx();
  fs.writeFileSync(path.join(webPath, 'src/main.tsx'), mainTsx);
  files.push('web/src/main.tsx');

  // 9. Generate App.tsx
  const appTsx = generateAppTsx(classified);
  fs.writeFileSync(path.join(webPath, 'src/App.tsx'), appTsx);
  files.push('web/src/App.tsx');

  // 10. Generate global CSS
  const globalCss = generateGlobalCss();
  fs.writeFileSync(path.join(webPath, 'src/styles/global.css'), globalCss);
  files.push('web/src/styles/global.css');

  // 11. Generate Home page
  const homePage = generateHomePage(projectName, classified);
  fs.mkdirSync(path.join(webPath, 'src/pages'), { recursive: true });
  fs.writeFileSync(path.join(webPath, 'src/pages/Home.tsx'), homePage);
  files.push('web/src/pages/Home.tsx');
}

/**
 * Copy base template to web directory
 */
async function copyBaseTemplate(
  baseModule: LoadedModule,
  webPath: string,
  projectName: string,
  directories: string[],
  files: string[]
): Promise<void> {
  const templatePath = path.join(baseModule.path, baseModule.meta.templatePath || 'template');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Base template not found: ${templatePath}`);
  }

  // Create web directory
  fs.mkdirSync(webPath, { recursive: true });
  directories.push('web');

  // Recursively copy template directory
  copyDirectoryRecursive(templatePath, webPath, directories, files, 'web');

  // Update package.json with project name
  const packageJsonPath = path.join(webPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.name = projectName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

/**
 * Recursively copy directory contents
 */
function copyDirectoryRecursive(
  src: string,
  dest: string,
  directories: string[],
  files: string[],
  relativePath: string
): void {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relPath = `${relativePath}/${entry.name}`;

    if (entry.isDirectory()) {
      // Skip node_modules and dist directories
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }
      fs.mkdirSync(destPath, { recursive: true });
      directories.push(relPath);
      copyDirectoryRecursive(srcPath, destPath, directories, files, relPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      files.push(relPath);
    }
  }
}

/** Route slot type */
interface RouteSlot {
  path: string;
  component: string;
  layout?: string;
  file?: string;  // Optional: specific file name (without extension)
  baseDir?: string;  // For multi-file modules, base directory path
}

/**
 * Copy page modules to web/src/pages/ and update routes/menus
 */
async function copyPageModules(
  pageModules: LoadedModule[],
  webPath: string,
  directories: string[],
  files: string[]
): Promise<void> {
  const routeSlots: RouteSlot[] = [];
  const menuSlots: Array<{
    id: string;
    title: string;
    type: string;
    url?: string;
    icon?: string;
    children?: Array<{ id: string; title: string; type: string; url: string; icon?: string }>;
  }> = [];

  for (const mod of pageModules) {
    const srcPath = path.join(mod.path, 'src');
    if (!fs.existsSync(srcPath)) continue;

    // Extract slots from module meta
    const slots = mod.meta.slots as {
      'web.routes'?: RouteSlot | RouteSlot[];
      'web.menu'?: {
        id: string;
        title: string;
        type: string;
        url?: string;
        icon?: string;
        children?: Array<{ id: string; title: string; type: string; url: string; icon?: string }>;
      };
    } | undefined;

    // Determine destination folder based on module name
    let destName = mod.meta.name;
    if (destName.startsWith('page-')) {
      destName = destName.replace('page-', '');
    }

    // Handle routes - can be single object or array
    const webRoutes = slots?.['web.routes'];
    if (webRoutes) {
      if (Array.isArray(webRoutes)) {
        // Multi-route module (e.g., page-sample-crud)
        // Use module name as base directory
        const baseDir = destName;
        webRoutes.forEach(route => {
          routeSlots.push({ ...route, baseDir });
        });

        // Copy files to base directory
        const destDir = path.join(webPath, 'src/pages', baseDir);
        fs.mkdirSync(destDir, { recursive: true });

        const entries = fs.readdirSync(srcPath);
        for (const entry of entries) {
          const srcFile = path.join(srcPath, entry);
          if (fs.statSync(srcFile).isFile()) {
            const destFile = path.join(destDir, entry);
            fs.copyFileSync(srcFile, destFile);
            const relPath = destFile.replace(webPath, 'web').replace(/\\/g, '/');
            if (!files.includes(relPath)) {
              files.push(relPath);
            }
          }
        }

        const relDir = destDir.replace(webPath, 'web').replace(/\\/g, '/');
        if (!directories.includes(relDir)) {
          directories.push(relDir);
        }
      } else {
        // Single route module
        routeSlots.push(webRoutes);

        // Use route path for directory naming
        const routePath = webRoutes.path;
        const destDir = path.join(webPath, 'src/pages', routePath.replace(/\//g, path.sep));
        fs.mkdirSync(destDir, { recursive: true });

        const entries = fs.readdirSync(srcPath);
        for (const entry of entries) {
          const srcFile = path.join(srcPath, entry);
          if (fs.statSync(srcFile).isFile()) {
            const destFile = path.join(destDir, entry);
            fs.copyFileSync(srcFile, destFile);
            const relPath = destFile.replace(webPath, 'web').replace(/\\/g, '/');
            if (!files.includes(relPath)) {
              files.push(relPath);
            }
          }
        }

        const relDir = destDir.replace(webPath, 'web').replace(/\\/g, '/');
        if (!directories.includes(relDir)) {
          directories.push(relDir);
        }
      }
    }

    if (slots?.['web.menu']) {
      menuSlots.push(slots['web.menu']);
    }
  }

  // Auto-inject routes and menus into base template files
  if (routeSlots.length > 0) {
    await injectRoutes(webPath, routeSlots, files);
  }
  if (menuSlots.length > 0) {
    await injectMenuItems(webPath, menuSlots, files);
  }
}

/**
 * Inject routes into routes/index.jsx
 */
async function injectRoutes(
  webPath: string,
  routeSlots: RouteSlot[],
  _files: string[]
): Promise<void> {
  const routesFile = path.join(webPath, 'src/routes/index.jsx');
  if (!fs.existsSync(routesFile)) return;

  let content = fs.readFileSync(routesFile, 'utf-8');

  // Collect new imports and routes
  const newImports: string[] = [];
  const mainRoutes: string[] = [];
  const minimalRoutes: string[] = [];

  for (const slot of routeSlots) {
    const componentName = slot.component;
    const pagePath = slot.path;
    const layout = slot.layout || 'main'; // default to main layout

    // Generate import path
    // If baseDir and file are specified, use them (multi-file modules)
    // Otherwise, use route path (single-file modules)
    let importPath: string;
    if (slot.baseDir && slot.file) {
      // Multi-file module: pages/sample-crud/List
      importPath = `pages/${slot.baseDir}/${slot.file}`;
    } else if (slot.baseDir) {
      // Multi-file module without specific file: use index
      importPath = `pages/${slot.baseDir}`;
    } else {
      // Single-file module: pages/dashboard
      importPath = `pages/${pagePath}`;
    }

    // Determine lazy and wrapped component names
    // If component ends with "Page", use base name for lazy and full name for wrapped
    // e.g., "UserManagementPage" -> lazy: "UserManagement", wrapped: "UserManagementPage"
    // Otherwise: "Dashboard" -> lazy: "Dashboard", wrapped: "DashboardPage"
    let lazyName: string;
    let wrappedName: string;

    if (componentName.endsWith('Page')) {
      lazyName = componentName.slice(0, -4); // Remove "Page" suffix
      wrappedName = componentName;
    } else {
      lazyName = componentName;
      wrappedName = `${componentName}Page`;
    }

    // Check if import already exists
    if (!content.includes(`import('${importPath}')`)) {
      newImports.push(`const ${lazyName} = lazy(() => import('${importPath}'));`);
    }

    // Check if wrapped component already exists
    if (!content.includes(`const ${wrappedName} = Loadable`)) {
      newImports.push(`const ${wrappedName} = Loadable(${lazyName});`);
    }

    // Generate route entry
    const routeEntry = `      {\n        path: '${pagePath}',\n        element: <${wrappedName} />\n      }`;

    if (layout === 'minimal') {
      minimalRoutes.push(routeEntry);
    } else {
      mainRoutes.push(routeEntry);
    }
  }

  // Insert new imports before the router definition
  if (newImports.length > 0) {
    const routerMarker = '// ==============================|| ROUTING ||==============================';
    if (content.includes(routerMarker)) {
      content = content.replace(
        routerMarker,
        `// Page module imports (auto-generated by HWMS)\n${newImports.join('\n')}\n\n${routerMarker}`
      );
    }
  }

  // Insert main layout routes
  if (mainRoutes.length > 0) {
    // Find the main layout children array and insert before the catch-all route
    // Match the comma before catch-all route to avoid double commas
    const mainCatchAllPattern = /(,?)(\s*{\s*path:\s*'\*',\s*element:\s*<Error404Page\s*\/>\s*})/;
    if (mainCatchAllPattern.test(content)) {
      content = content.replace(
        mainCatchAllPattern,
        `,\n      // Auto-generated page routes\n${mainRoutes.join(',\n')},$2`
      );
    }
  }

  // Insert minimal layout routes
  if (minimalRoutes.length > 0) {
    // Find the MinimalLayout empty children array and insert routes
    const minimalLayoutEmptyPattern = /(element:\s*<MinimalLayout\s*\/>,\s*\n\s*children:\s*)\[\]/;
    if (minimalLayoutEmptyPattern.test(content)) {
      content = content.replace(
        minimalLayoutEmptyPattern,
        `$1[\n      // Auto-generated auth routes\n${minimalRoutes.join(',\n')}\n    ]`
      );
    } else {
      // Fallback: find existing children array and append
      const minimalLayoutPattern = /(element:\s*<MinimalLayout\s*\/>,\s*\n\s*children:\s*\[[\s\S]*?)(\n\s*\]\s*\}[\s\S]*?^\]);/m;
      if (minimalLayoutPattern.test(content)) {
        content = content.replace(
          minimalLayoutPattern,
          `$1,\n      // Auto-generated auth routes\n${minimalRoutes.join(',\n')}$2`
        );
      }
    }
  }

  fs.writeFileSync(routesFile, content);
}

/** Menu slot type */
interface MenuSlot {
  id: string;
  title: string;
  type: string;
  url?: string;
  icon?: string;
  children?: Array<{ id: string; title: string; type: string; url: string; icon?: string }>;
}

/**
 * Inject menu items into menu-items/index.js
 */
async function injectMenuItems(
  webPath: string,
  menuSlots: MenuSlot[],
  _files: string[]
): Promise<void> {
  const menuFile = path.join(webPath, 'src/menu-items/index.js');
  if (!fs.existsSync(menuFile)) return;

  let content = fs.readFileSync(menuFile, 'utf-8');

  // Collect new icon imports
  const newIconImports: string[] = [];
  const newMenuItems: string[] = [];

  for (const slot of menuSlots) {
    // Check if icon needs to be imported
    if (slot.icon && !content.includes(`import ${slot.icon}`)) {
      newIconImports.push(`import ${slot.icon} from '@mui/icons-material/${slot.icon.replace('Icon', '')}';`);
    }

    // Check children icons
    if (slot.children) {
      for (const child of slot.children) {
        if (child.icon && !content.includes(`import ${child.icon}`)) {
          newIconImports.push(`import ${child.icon} from '@mui/icons-material/${child.icon.replace('Icon', '')}';`);
        }
      }
    }

    // Generate menu item
    let menuItem: string;
    if (slot.type === 'collapse' && slot.children) {
      // Collapse menu with children
      const childrenItems = slot.children.map(child => `            {
              id: '${child.id}',
              title: '${child.title}',
              type: '${child.type}',
              url: '${child.url}',
              icon: ${child.icon || 'null'}
            }`).join(',\n');

      menuItem = `        {
          id: '${slot.id}',
          title: '${slot.title}',
          type: '${slot.type}',
          icon: ${slot.icon || 'null'},
          children: [
${childrenItems}
          ]
        }`;
    } else {
      // Simple item
      menuItem = `        {
          id: '${slot.id}',
          title: '${slot.title}',
          type: '${slot.type}',
          url: '${slot.url || ''}',
          icon: ${slot.icon || 'null'},
          breadcrumbs: true
        }`;
    }
    newMenuItems.push(menuItem);
  }

  // Insert icon imports after existing imports
  if (newIconImports.length > 0) {
    const menuItemsMarker = '// ==============================|| MENU ITEMS ||==============================';
    if (content.includes(menuItemsMarker)) {
      content = content.replace(
        menuItemsMarker,
        `// Auto-generated icon imports\n${newIconImports.join('\n')}\n\n${menuItemsMarker}`
      );
    }
  }

  // Insert menu items into navigation group
  if (newMenuItems.length > 0) {
    // First try: empty children array
    const navEmptyChildrenPattern = /(id:\s*'navigation',[\s\S]*?children:\s*)\[\]/;
    if (navEmptyChildrenPattern.test(content)) {
      content = content.replace(
        navEmptyChildrenPattern,
        `$1[\n        // Auto-generated page menu items\n${newMenuItems.join(',\n')}\n      ]`
      );
    } else {
      // Fallback: find existing children with items and append
      const navChildrenPattern = /(id:\s*'navigation',[\s\S]*?children:\s*\[\s*{[\s\S]*?breadcrumbs:\s*true\s*})/;
      if (navChildrenPattern.test(content)) {
        content = content.replace(
          navChildrenPattern,
          `$1,\n        // Auto-generated page menu items\n${newMenuItems.join(',\n')}`
        );
      }
    }
  }

  fs.writeFileSync(menuFile, content);
}

/**
 * Inject npm dependencies from page modules into package.json
 */
async function injectNpmDependencies(
  webPath: string,
  pageModules: LoadedModule[]
): Promise<void> {
  const packageJsonPath = path.join(webPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return;

  // Collect all npm dependencies from page modules
  const npmDeps: Record<string, string> = {};
  for (const mod of pageModules) {
    const modNpmDeps = mod.meta.dependencies?.npm as Record<string, string> | undefined;
    if (modNpmDeps) {
      Object.assign(npmDeps, modNpmDeps);
    }
  }

  // If no npm dependencies, skip
  if (Object.keys(npmDeps).length === 0) return;

  // Read and update package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  // Add new dependencies
  Object.assign(packageJson.dependencies, npmDeps);

  // Sort dependencies alphabetically
  packageJson.dependencies = Object.keys(packageJson.dependencies)
    .sort()
    .reduce((obj: Record<string, string>, key: string) => {
      obj[key] = packageJson.dependencies[key];
      return obj;
    }, {});

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/**
 * Copy bridge module to web/src/bridge/
 */
async function copyBridgeModule(
  mod: LoadedModule,
  webPath: string,
  directories: string[],
  files: string[]
): Promise<void> {
  const srcPath = path.join(mod.path, 'src');
  if (!fs.existsSync(srcPath)) return;

  // Determine destination folder name
  let destName = mod.meta.name;
  if (destName === 'native-bridge-core') {
    destName = 'core';
  } else if (destName.startsWith('bridge-')) {
    destName = destName.replace('bridge-', '');
  }

  const destPath = path.join(webPath, 'src/bridge', destName);
  fs.mkdirSync(destPath, { recursive: true });
  directories.push(`web/src/bridge/${destName}`);

  // Copy TypeScript files
  const entries = fs.readdirSync(srcPath);
  for (const entry of entries) {
    const srcFile = path.join(srcPath, entry);
    const destFile = path.join(destPath, entry);

    if (fs.statSync(srcFile).isFile()) {
      // Convert .js imports to local imports
      let content = fs.readFileSync(srcFile, 'utf-8');
      content = transformImports(content, mod.meta.name);
      fs.writeFileSync(destFile, content);
      files.push(`web/src/bridge/${destName}/${entry}`);
    }
  }
}

/**
 * Copy UI module to web/src/components/ and hooks/
 */
async function copyUiModule(
  mod: LoadedModule,
  webPath: string,
  directories: string[],
  files: string[]
): Promise<void> {
  const srcPath = path.join(mod.path, 'src');
  if (!fs.existsSync(srcPath)) return;

  // Determine destination folder name
  let destName = mod.meta.name;
  if (destName.startsWith('ui-')) {
    destName = destName.replace('ui-', '');
  }

  const componentPath = path.join(webPath, 'src/components', destName);
  const hooksPath = path.join(webPath, 'src/hooks');
  const stylesPath = path.join(webPath, 'src/styles/modules');

  fs.mkdirSync(componentPath, { recursive: true });
  directories.push(`web/src/components/${destName}`);

  // Copy files based on type
  const entries = fs.readdirSync(srcPath);
  for (const entry of entries) {
    const srcFile = path.join(srcPath, entry);

    if (!fs.statSync(srcFile).isFile()) continue;

    let content = fs.readFileSync(srcFile, 'utf-8');
    content = transformImports(content, mod.meta.name);

    if (entry.startsWith('use') && entry.endsWith('.tsx')) {
      // Hook files go to hooks/ - keep .tsx extension for JSX content
      // Transform relative imports to use @components alias
      content = transformHookImports(content, destName);
      fs.writeFileSync(path.join(hooksPath, entry), content);
      files.push(`web/src/hooks/${entry}`);
    } else if (entry.endsWith('.module.css')) {
      // CSS modules go to styles/modules/
      fs.writeFileSync(path.join(stylesPath, entry), content);
      files.push(`web/src/styles/modules/${entry}`);

      // Also keep a copy in component folder for local imports
      fs.writeFileSync(path.join(componentPath, entry), content);
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      // Components go to components/{module}/
      fs.writeFileSync(path.join(componentPath, entry), content);
      files.push(`web/src/components/${destName}/${entry}`);
    } else if (entry.endsWith('.css')) {
      // Regular CSS
      fs.writeFileSync(path.join(stylesPath, entry), content);
      files.push(`web/src/styles/modules/${entry}`);
    }
  }
}

/**
 * Transform imports for relocated modules
 */
function transformImports(content: string, _moduleName: string): string {
  // Remove .js extensions from imports (Vite handles this)
  content = content.replace(/from ['"](.+)\.js['"]/g, "from '$1'");

  // Transform relative bridge imports
  content = content.replace(
    /from ['"]\.\.\/\.\.\/native-bridge-core\/src\/index['"]/g,
    "from '@bridge/core'"
  );
  content = content.replace(
    /from ['"]\.\.\/\.\.\/native-bridge-core\/src\/(.+)['"]/g,
    "from '@bridge/core/$1'"
  );

  return content;
}

/**
 * Transform relative imports in hook files to use @components alias
 * When hooks are moved from ui-{name}/src/ to hooks/, their relative imports break
 * Example: './LoadingOverlay' becomes '@components/loading/LoadingOverlay'
 */
function transformHookImports(content: string, componentDir: string): string {
  // Transform relative imports like './ComponentName' to '@components/{dir}/ComponentName'
  // Match: from './Something' or from "./Something"
  content = content.replace(
    /from ['"]\.\/([\w-]+)['"]/g,
    `from '@components/${componentDir}/$1'`
  );

  // Also handle CSS module imports - point to styles/modules
  content = content.replace(
    /from ['"]\.\/([\w-]+)\.module\.css['"]/g,
    `from '@styles/modules/$1.module.css'`
  );

  // Handle import statements (not just from)
  content = content.replace(
    /import ['"]\.\/([\w-]+)\.module\.css['"]/g,
    `import '@styles/modules/$1.module.css'`
  );

  return content;
}

/**
 * Generate barrel exports for each directory
 */
async function generateBarrelExports(
  webPath: string,
  classified: ClassifiedModules,
  files: string[]
): Promise<void> {
  // Bridge index.ts
  const bridgeExports = classified.bridgeModules.map(mod => {
    let name = mod.meta.name;
    if (name === 'native-bridge-core') name = 'core';
    else if (name.startsWith('bridge-')) name = name.replace('bridge-', '');
    return `export * from './${name}';`;
  }).join('\n');

  fs.writeFileSync(
    path.join(webPath, 'src/bridge/index.ts'),
    `/**\n * Bridge modules barrel export\n */\n\n${bridgeExports}\n`
  );
  files.push('web/src/bridge/index.ts');

  // Components index.ts
  const componentExports = classified.uiModules.map(mod => {
    let name = mod.meta.name;
    if (name.startsWith('ui-')) name = name.replace('ui-', '');
    return `export * from './${name}';`;
  }).join('\n');

  fs.writeFileSync(
    path.join(webPath, 'src/components/index.ts'),
    `/**\n * UI components barrel export\n */\n\n${componentExports}\n`
  );
  files.push('web/src/components/index.ts');

  // Hooks index.ts
  const hookExports: string[] = [];
  classified.uiModules.forEach(mod => {
    let name = mod.meta.name;
    if (name.startsWith('ui-')) name = name.replace('ui-', '');

    // Check for hook files
    const srcPath = path.join(mod.path, 'src');
    if (fs.existsSync(srcPath)) {
      const entries = fs.readdirSync(srcPath);
      entries.forEach(entry => {
        if (entry.startsWith('use') && entry.endsWith('.tsx')) {
          const hookName = entry.replace('.tsx', '');
          hookExports.push(`export { ${hookName}, ${hookName.charAt(0).toUpperCase() + hookName.slice(1)}Provider } from './${hookName}';`);
        }
      });
    }
  });

  fs.writeFileSync(
    path.join(webPath, 'src/hooks/index.ts'),
    `/**\n * Custom hooks barrel export\n */\n\n${hookExports.join('\n')}\n`
  );
  files.push('web/src/hooks/index.ts');
}

/**
 * Generate web package.json
 */
function generateWebPackageJson(projectName: string, classified: ClassifiedModules): object {
  const dependencies: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    'react-router-dom': '^6.21.0',
  };

  // Check for mantis-* modules and add MUI dependencies
  const hasMantisModules = classified.uiModules.some(m => m.meta.name.startsWith('mantis-'));
  if (hasMantisModules) {
    dependencies['@mui/material'] = '^5.15.0';
    dependencies['@mui/icons-material'] = '^5.15.0';
    dependencies['@emotion/react'] = '^11.11.0';
    dependencies['@emotion/styled'] = '^11.11.0';
  }

  return {
    name: projectName,
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      lint: 'eslint . --ext ts,tsx',
    },
    dependencies,
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.2.0',
      typescript: '^5.0.0',
      vite: '^5.0.0',
    },
  };
}

/**
 * Generate vite.config.js
 */
function generateViteConfig(): string {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@bridge': path.resolve(__dirname, './src/bridge'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
`;
}

/**
 * Generate web tsconfig.json
 */
function generateWebTsConfig(): object {
  return {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      baseUrl: '.',
      paths: {
        '@/*': ['src/*'],
        '@bridge/*': ['src/bridge/*'],
        '@components/*': ['src/components/*'],
        '@hooks/*': ['src/hooks/*'],
        '@pages/*': ['src/pages/*'],
        '@styles/*': ['src/styles/*'],
      },
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }],
  };
}

/**
 * Generate web tsconfig.node.json (for Vite config)
 */
function generateWebTsConfigNode(): object {
  return {
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true,
      strict: true,
    },
    include: ['vite.config.js'],
  };
}

/**
 * Generate index.html
 */
function generateIndexHtml(projectName: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#ffffff" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

/**
 * Generate main.tsx
 */
function generateMainTsx(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

/**
 * Generate App.tsx with providers based on modules
 */
function generateAppTsx(classified: ClassifiedModules): string {
  const imports: string[] = [
    "import { BrowserRouter, Routes, Route } from 'react-router-dom';",
    "import Home from '@pages/Home';",
  ];

  const providers: { open: string; close: string }[] = [];
  const globalComponents: string[] = [];

  // Add UI module providers
  for (const mod of classified.uiModules) {
    const name = mod.meta.name;

    // Legacy ui-* modules
    if (name === 'ui-toast') {
      imports.push("import { ToastProvider } from '@hooks/useToast';");
      providers.push({ open: '<ToastProvider>', close: '</ToastProvider>' });
    } else if (name === 'ui-loading') {
      imports.push("import { LoadingProvider } from '@hooks/useLoading';");
      providers.push({ open: '<LoadingProvider>', close: '</LoadingProvider>' });
    } else if (name === 'ui-bottom-sheet') {
      imports.push("import { BottomSheetProvider } from '@hooks/useBottomSheet';");
      providers.push({ open: '<BottomSheetProvider>', close: '</BottomSheetProvider>' });
    }
    // Mantis modules
    else if (name === 'mantis-snackbar') {
      imports.push("import { SnackbarProvider, Snackbar } from '@components/mantis-snackbar';");
      providers.push({ open: '<SnackbarProvider>', close: '</SnackbarProvider>' });
      globalComponents.push('<Snackbar />');
    } else if (name === 'mantis-loader') {
      imports.push("import { LoaderProvider, Loader } from '@components/mantis-loader';");
      providers.push({ open: '<LoaderProvider>', close: '</LoaderProvider>' });
      globalComponents.push('<Loader />');
    }
  }

  // Build provider structure
  const hasProviders = providers.length > 0;
  const hasGlobalComponents = globalComponents.length > 0;

  let appContent: string;

  if (hasProviders) {
    // Nest providers from outside to inside
    let content = `
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>${hasGlobalComponents ? '\n        ' + globalComponents.join('\n        ') : ''}`;

    // Wrap with providers (innermost first, so reverse when building)
    for (let i = providers.length - 1; i >= 0; i--) {
      const p = providers[i];
      content = `
      ${p.open}${content.split('\n').map(line => '  ' + line).join('\n')}
      ${p.close}`;
    }

    appContent = content;
  } else {
    appContent = `
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>`;
  }

  return `${imports.join('\n')}

function App() {
  return (
    <>${appContent}
    </>
  );
}

export default App;
`;
}

/**
 * Generate global.css
 */
function generateGlobalCss(): string {
  return `/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  height: 100%;
}

/* Safe area for mobile */
@supports (padding: env(safe-area-inset-bottom)) {
  body {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
`;
}

/**
 * Generate Home page with comprehensive demo
 */
function generateHomePage(projectName: string, classified: ClassifiedModules): string {
  const imports: string[] = [
    "import React, { useState, useEffect } from 'react';",
  ];
  const hooks: string[] = [];
  const stateDecls: string[] = [];
  const effectCode: string[] = [];
  const demoSections: string[] = [];

  // Check for device info module
  const hasDeviceInfo = classified.bridgeModules.some(
    m => m.meta.name === 'bridge-device-info'
  );
  const hasCamera = classified.bridgeModules.some(
    m => m.meta.name === 'bridge-camera'
  );
  const hasToast = classified.uiModules.some(m => m.meta.name === 'ui-toast');
  const hasLoading = classified.uiModules.some(m => m.meta.name === 'ui-loading');
  const hasMantisSnackbar = classified.uiModules.some(m => m.meta.name === 'mantis-snackbar');
  const hasMantisLoader = classified.uiModules.some(m => m.meta.name === 'mantis-loader');

  // Device Info
  if (hasDeviceInfo) {
    imports.push("import { useDeviceInfo, type DeviceInfo } from '@bridge/device-info';");
    hooks.push(`  const { getDeviceInfo, getPlatform } = useDeviceInfo();`);
    stateDecls.push(`  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);`);
    effectCode.push(`    loadDeviceInfo();`);

    demoSections.push(`
      {/* Device Info Section */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>📱 기기 정보</h2>
        {deviceInfo ? (
          <div style={infoGridStyle}>
            <InfoItem label="플랫폼" value={deviceInfo.platform} />
            <InfoItem label="OS" value={\`\${deviceInfo.os.name} \${deviceInfo.os.version}\`} />
            <InfoItem label="화면 크기" value={\`\${deviceInfo.screen.width} x \${deviceInfo.screen.height}\`} />
            <InfoItem label="화면 배율" value={\`\${deviceInfo.screen.scale}x\`} />
            <InfoItem label="언어" value={deviceInfo.locale} />
            <InfoItem label="시간대" value={deviceInfo.timezone} />
            <InfoItem label="브라우저/모델" value={deviceInfo.model} />
          </div>
        ) : (
          <p style={loadingTextStyle}>기기 정보를 불러오는 중...</p>
        )}
      </section>`);
  }

  // Camera
  if (hasCamera) {
    imports.push("import { useCamera, type ImageResult } from '@bridge/camera';");
    hooks.push(`  const { takePhoto, selectFromGallery, isUsingBrowserFallback } = useCamera();`);
    stateDecls.push(`  const [capturedImage, setCapturedImage] = useState<ImageResult | null>(null);`);
    stateDecls.push(`  const [imageError, setImageError] = useState<string | null>(null);`);

    demoSections.push(`
      {/* Camera Section */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>📷 카메라 / 사진</h2>
        {isUsingBrowserFallback() && (
          <p style={infoTextStyle}>브라우저 모드: 파일 선택을 통해 사진을 가져옵니다.</p>
        )}
        <div style={buttonGroupStyle}>
          <button style={buttonStyle} onClick={handleTakePhoto}>
            사진 촬영
          </button>
          <button style={buttonStyle} onClick={handleSelectFromGallery}>
            갤러리에서 선택
          </button>
        </div>
        {imageError && <p style={errorTextStyle}>{imageError}</p>}
        {capturedImage && (
          <div style={imagePreviewStyle}>
            <img
              src={capturedImage.format === 'uri' ? capturedImage.data : \`data:\${capturedImage.mimeType};base64,\${capturedImage.data}\`}
              alt="Captured"
              style={imageStyle}
            />
            <p style={imageSizeStyle}>
              {capturedImage.width} x {capturedImage.height} ({Math.round((capturedImage.fileSize || 0) / 1024)}KB)
            </p>
          </div>
        )}
      </section>`);
  }

  // Toast
  if (hasToast) {
    imports.push("import { useToast } from '@hooks/useToast';");
    hooks.push(`  const { showToast } = useToast();`);

    demoSections.push(`
      {/* Toast Section */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>💬 토스트 메시지</h2>
        <div style={buttonGroupStyle}>
          <button style={buttonStyle} onClick={() => showToast('일반 메시지입니다', 'info')}>
            일반 메시지
          </button>
          <button style={{...buttonStyle, backgroundColor: '#22c55e'}} onClick={() => showToast('성공했습니다!', 'success')}>
            성공 메시지
          </button>
          <button style={{...buttonStyle, backgroundColor: '#f59e0b'}} onClick={() => showToast('주의가 필요합니다', 'warning')}>
            경고 메시지
          </button>
          <button style={{...buttonStyle, backgroundColor: '#ef4444'}} onClick={() => showToast('오류가 발생했습니다', 'error')}>
            오류 메시지
          </button>
        </div>
      </section>`);
  }

  // Loading
  if (hasLoading) {
    imports.push("import { useLoading } from '@hooks/useLoading';");
    hooks.push(`  const { showLoading, hideLoading } = useLoading();`);

    demoSections.push(`
      {/* Loading Section */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>⏳ 로딩 표시</h2>
        <div style={buttonGroupStyle}>
          <button style={buttonStyle} onClick={handleShowLoading}>
            로딩 표시 (2초)
          </button>
        </div>
      </section>`);
  }

  // Mantis Snackbar
  if (hasMantisSnackbar) {
    imports.push("import { useSnackbar } from '@components/mantis-snackbar';");
    hooks.push(`  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();`);

    demoSections.push(`
      {/* Mantis Snackbar Section */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>🔔 스낵바 알림</h2>
        <div style={buttonGroupStyle}>
          <button style={buttonStyle} onClick={() => showInfo('일반 알림 메시지입니다')}>
            일반 알림
          </button>
          <button style={{...buttonStyle, backgroundColor: '#22c55e'}} onClick={() => showSuccess('작업이 성공적으로 완료되었습니다!')}>
            성공 알림
          </button>
          <button style={{...buttonStyle, backgroundColor: '#f59e0b'}} onClick={() => showWarning('주의가 필요합니다')}>
            경고 알림
          </button>
          <button style={{...buttonStyle, backgroundColor: '#ef4444'}} onClick={() => showError('오류가 발생했습니다')}>
            오류 알림
          </button>
        </div>
      </section>`);
  }

  // Mantis Loader
  if (hasMantisLoader) {
    imports.push("import { useLoader } from '@components/mantis-loader';");
    hooks.push(`  const { showLinearLoader, showCircularLoader, hideLoader } = useLoader();`);

    demoSections.push(`
      {/* Mantis Loader Section */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>⏳ 로딩 인디케이터</h2>
        <div style={buttonGroupStyle}>
          <button style={buttonStyle} onClick={handleShowLinearLoader}>
            Linear 로더 (2초)
          </button>
          <button style={{...buttonStyle, backgroundColor: '#8b5cf6'}} onClick={handleShowCircularLoader}>
            Circular 로더 (2초)
          </button>
        </div>
      </section>`);
  }

  // Build the component
  const hooksSection = hooks.length > 0 ? `\n${hooks.join('\n')}\n` : '';
  const stateSection = stateDecls.length > 0 ? `\n${stateDecls.join('\n')}\n` : '';

  // Build functions section
  const functions: string[] = [];

  if (hasDeviceInfo) {
    functions.push(`
  const loadDeviceInfo = async () => {
    const result = await getDeviceInfo();
    if (result.success && result.data) {
      setDeviceInfo(result.data);
    }
  };`);
  }

  if (hasCamera) {
    functions.push(`
  const handleTakePhoto = async () => {
    setImageError(null);
    const result = await takePhoto({ quality: 0.8, maxWidth: 800, maxHeight: 600 });
    if (result.success && result.data) {
      setCapturedImage(result.data);
    } else {
      setImageError(result.error?.message || '사진 촬영에 실패했습니다.');
    }
  };

  const handleSelectFromGallery = async () => {
    setImageError(null);
    const result = await selectFromGallery({ quality: 0.8, maxWidth: 800, maxHeight: 600 });
    if (result.success && result.data) {
      setCapturedImage(result.data);
    } else {
      setImageError(result.error?.message || '사진 선택에 실패했습니다.');
    }
  };`);
  }

  if (hasLoading) {
    functions.push(`
  const handleShowLoading = () => {
    showLoading('잠시만 기다려주세요...');
    setTimeout(() => {
      hideLoading();${hasToast ? `\n      showToast('작업이 완료되었습니다!', 'success');` : ''}
    }, 2000);
  };`);
  }

  if (hasMantisLoader) {
    functions.push(`
  const handleShowLinearLoader = () => {
    showLinearLoader();
    setTimeout(() => {
      hideLoader();${hasMantisSnackbar ? `\n      showSuccess('작업이 완료되었습니다!');` : ''}
    }, 2000);
  };

  const handleShowCircularLoader = () => {
    showCircularLoader('데이터를 불러오는 중...');
    setTimeout(() => {
      hideLoader();${hasMantisSnackbar ? `\n      showInfo('데이터 로딩 완료');` : ''}
    }, 2000);
  };`);
  }

  const functionsSection = functions.length > 0 ? `\n${functions.join('\n')}\n` : '';

  // Effect
  const useEffectSection = effectCode.length > 0 ? `
  useEffect(() => {
${effectCode.join('\n')}
  }, []);
` : '';

  return `${imports.join('\n')}

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '30px',
  paddingBottom: '20px',
  borderBottom: '1px solid #e5e7eb',
};

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 8px 0',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#6b7280',
  margin: 0,
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  marginBottom: '16px',
};

const infoGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
};

const infoItemStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  marginBottom: '4px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#1f2937',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 20px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
};

const infoTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  backgroundColor: '#fef3c7',
  padding: '8px 12px',
  borderRadius: '6px',
  marginBottom: '12px',
};

const loadingTextStyle: React.CSSProperties = {
  color: '#6b7280',
  fontStyle: 'italic',
};

const errorTextStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: '14px',
  marginTop: '10px',
};

const imagePreviewStyle: React.CSSProperties = {
  marginTop: '16px',
  textAlign: 'center',
};

const imageStyle: React.CSSProperties = {
  maxWidth: '100%',
  maxHeight: '300px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const imageSizeStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  marginTop: '8px',
};

// Info Item Component
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoItemStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

function Home() {${hooksSection}${stateSection}${functionsSection}${useEffectSection}
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>${projectName}</h1>
        <p style={subtitleStyle}>HWMS로 생성된 하이브리드 웹앱</p>
      </header>
${demoSections.join('\n') || `
      <section style={sectionStyle}>
        <h2 style={headingStyle}>환영합니다!</h2>
        <p>이 앱은 HWMS (Hybrid WebApp Module System)로 생성되었습니다.</p>
      </section>`}
    </div>
  );
}

export default Home;
`;
}

/**
 * Generate root files (README, .gitignore, .env.example)
 */
async function generateRootFiles(
  projectPath: string,
  projectName: string,
  modules: string[],
  setupSteps: string[],
  envVariables: Array<{ name: string; description: string; required: boolean; default?: string }>,
  hasAndroid: boolean,
  files: string[]
): Promise<void> {
  // README.md
  const readme = generateReadme(projectName, modules, setupSteps, envVariables, hasAndroid);
  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
  files.push('README.md');

  // .gitignore
  const gitignore = `# Dependencies
node_modules/

# Build outputs
dist/
build/
.gradle/

# Environment
.env
.env.local

# IDE
.idea/
.vscode/
*.iml

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Android
android/app/build/
android/.gradle/
android/local.properties
`;
  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);
  files.push('.gitignore');

  // .env.example
  if (envVariables.length > 0) {
    const envContent = generateEnvExample(envVariables);
    fs.writeFileSync(path.join(projectPath, '.env.example'), envContent);
    files.push('.env.example');
  }
}

/**
 * Generate README.md
 */
function generateReadme(
  projectName: string,
  modules: string[],
  setupSteps: string[],
  envVariables: Array<{ name: string; description: string; required: boolean }>,
  hasAndroid: boolean
): string {
  const moduleList = modules.map(m => `- ${m}`).join('\n');
  const setupList = setupSteps.length > 0
    ? setupSteps.map(s => `- ${s}`).join('\n')
    : '- 추가 설정이 필요하지 않습니다.';
  const envList = envVariables.length > 0
    ? envVariables.map(e => `- \`${e.name}\`: ${e.description} (${e.required ? '필수' : '선택'})`).join('\n')
    : '- 환경 변수가 필요하지 않습니다.';

  const androidSection = hasAndroid ? `
## Android 앱

\`\`\`bash
# Android Studio에서 열기
# File > Open > ${projectName}/android 폴더 선택

# 또는 커맨드 라인에서
cd android
./gradlew assembleDebug
\`\`\`
` : '';

  return `# ${projectName}

> HWMS (Hybrid WebApp Module System)로 생성된 하이브리드 웹앱 프로젝트

## 포함된 모듈

${moduleList}

## 시작하기

### Web 개발 서버

\`\`\`bash
cd web
npm install
npm run dev
\`\`\`

브라우저에서 http://localhost:5173 접속
${androidSection}
## 프로젝트 구조

\`\`\`
${projectName}/
├── web/                      # React 웹 애플리케이션
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx          # 진입점
│       ├── App.tsx           # 루트 컴포넌트
│       ├── bridge/           # 네이티브 브릿지 모듈
│       ├── components/       # UI 컴포넌트
│       ├── hooks/            # 커스텀 훅
│       └── pages/            # 페이지 컴포넌트
├── android/                  # Android 네이티브 앱
│   ├── app/
│   └── gradle/
├── docs/                     # 문서
└── README.md
\`\`\`

## 환경 변수

${envList}

## 플랫폼별 설정

${setupList}

---

*Generated by HWMS - Hybrid WebApp Module System*
`;
}

/**
 * Generate .env.example
 */
function generateEnvExample(
  envVariables: Array<{ name: string; description: string; required: boolean; default?: string }>
): string {
  const lines = envVariables.map(env => {
    const requiredMark = env.required ? ' (필수)' : ' (선택)';
    const defaultValue = env.default || '';
    return `# ${env.description}${requiredMark}\n${env.name}=${defaultValue}`;
  });

  return `# HWMS Generated Environment Variables
# 이 파일을 .env로 복사하고 값을 설정하세요

${lines.join('\n\n')}
`;
}

/**
 * Generate docs
 */
async function generateDocs(
  projectPath: string,
  setupSteps: string[],
  files: string[]
): Promise<void> {
  const docsPath = path.join(projectPath, 'docs');

  const setupDoc = `# 설정 가이드

## 플랫폼별 설정 단계

${setupSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## 개발 환경 설정

### Web
1. Node.js 18+ 설치
2. \`cd web && npm install\`
3. \`npm run dev\`

### Android
1. Android Studio 설치
2. android/ 폴더 열기
3. Sync Gradle
4. Run 'app'

---

*Generated by HWMS*
`;

  fs.writeFileSync(path.join(docsPath, 'SETUP.md'), setupDoc);
  files.push('docs/SETUP.md');
}

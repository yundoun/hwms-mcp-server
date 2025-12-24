import { listModules } from './dist/tools/listModules.js';
import { resolveDependencies } from './dist/tools/resolveDependencies.js';

async function runTests() {
  console.log('========================================');
  console.log('HWMS MCP Server Test (v2)');
  console.log('========================================\n');

  // Test 1: list_modules
  console.log('Test 1: list_modules');
  console.log('----------------------------------------');
  const modules = await listModules();
  console.log('Found ' + modules.length + ' modules:\n');
  modules.forEach(m => {
    console.log('  - ' + m.name + ' [' + m.category + ']');
  });

  // Test 2: resolve_dependencies
  console.log('\nTest 2: resolve_dependencies');
  console.log('----------------------------------------');
  console.log('Input: ["bridge-camera", "bridge-push"]');
  const result = await resolveDependencies(['bridge-camera', 'bridge-push']);

  console.log('\nResolved modules (in dependency order):');
  result.resolvedModules.forEach((name, i) => {
    console.log('  ' + (i+1) + '. ' + name);
  });

  console.log('\nSetup steps: ' + result.setupSteps.length);
  console.log('Environment variables: ' + result.envVariables.length);
  console.log('NPM dependencies: ' + Object.keys(result.npmDependencies).length);
  console.log('Warnings: ' + result.warnings.length);

  console.log('\n========================================');
  console.log('All tests passed!');
  console.log('========================================');
}

runTests().catch(console.error);

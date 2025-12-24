import { listModules } from './dist/tools/listModules.js';
import { resolveDependencies } from './dist/tools/resolveDependencies.js';
import { generateScaffold } from './dist/tools/generateScaffold.js';

async function runFullTest() {
  console.log('========================================');
  console.log('HWMS Full Scaffold Test');
  console.log('========================================\n');

  // Test 1: List all modules including android-app-shell
  console.log('Step 1: List all modules');
  console.log('----------------------------------------');
  const modules = await listModules();
  modules.forEach(m => console.log('  - ' + m.name + ' [' + m.category + ']'));

  // Test 2: Resolve dependencies with android-app-shell
  console.log('\nStep 2: Resolve dependencies');
  console.log('----------------------------------------');
  console.log('Input: ["android-app-shell", "bridge-camera", "bridge-push"]');

  const resolved = await resolveDependencies([
    'android-app-shell',
    'bridge-camera',
    'bridge-push'
  ]);

  console.log('\nResolved modules:');
  resolved.resolvedModules.forEach((name, i) => {
    console.log('  ' + (i+1) + '. ' + name);
  });

  console.log('\nSetup steps: ' + resolved.setupSteps.length);
  console.log('Environment variables: ' + resolved.envVariables.length);

  // Test 3: Generate full scaffold
  console.log('\nStep 3: Generate scaffold');
  console.log('----------------------------------------');

  const scaffold = await generateScaffold('my-full-hybrid-app', resolved.resolvedModules);

  console.log('Output path: ' + scaffold.outputPath);
  console.log('Directories: ' + scaffold.structure.directories.length);
  console.log('Files: ' + scaffold.structure.files.length);

  console.log('\n========================================');
  console.log('Full scaffold test complete!');
  console.log('========================================');
}

runFullTest().catch(console.error);

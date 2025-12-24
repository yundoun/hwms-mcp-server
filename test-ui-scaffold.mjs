import { resolveDependencies } from './dist/tools/resolveDependencies.js';
import { generateScaffold } from './dist/tools/generateScaffold.js';

async function testUIScaffold() {
  console.log('========================================');
  console.log('HWMS UI Modules Scaffold Test');
  console.log('========================================\n');

  // Scenario: Android app with camera, push, and UI components
  const selectedModules = [
    'android-app-shell',
    'bridge-camera',
    'bridge-push',
    'ui-toast',
    'ui-loading',
    'ui-bottom-sheet'
  ];

  console.log('Selected modules:');
  selectedModules.forEach(m => console.log('  - ' + m));

  // Resolve dependencies
  console.log('\n--- Resolving dependencies ---');
  const resolved = await resolveDependencies(selectedModules);

  console.log('\nResolved modules (' + resolved.resolvedModules.length + '):');
  resolved.resolvedModules.forEach((name, i) => {
    console.log('  ' + (i+1) + '. ' + name);
  });

  console.log('\nSetup steps: ' + resolved.setupSteps.length);
  console.log('Environment variables: ' + resolved.envVariables.length);

  // Generate scaffold
  console.log('\n--- Generating scaffold ---');
  const scaffold = await generateScaffold('complete-hybrid-app', resolved.resolvedModules);

  console.log('\nOutput: ' + scaffold.outputPath);
  console.log('Directories: ' + scaffold.structure.directories.length);
  console.log('Files: ' + scaffold.structure.files.length);

  console.log('\n========================================');
  console.log('Complete hybrid app with UI modules generated!');
  console.log('========================================');
}

testUIScaffold().catch(console.error);

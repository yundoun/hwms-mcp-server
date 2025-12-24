/**
 * MCP Server Test Script
 * Tests the MCP tools directly without MCP protocol
 */

import { listModules } from './dist/tools/listModules.js';
import { resolveDependencies } from './dist/tools/resolveDependencies.js';
import { generateScaffold } from './dist/tools/generateScaffold.js';

async function runTests() {
  console.log('========================================');
  console.log('HWMS MCP Server Test');
  console.log('========================================\n');

  // Test 1: list_modules
  console.log('📋 Test 1: list_modules');
  console.log('----------------------------------------');
  try {
    const modules = await listModules();
    console.log(`✅ Found ${modules.length} modules:\n`);
    modules.forEach(m => {
      console.log(`  • ${m.name} (${m.category})`);
      console.log(`    ${m.displayName}`);
    });
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: resolve_dependencies
  console.log('🔗 Test 2: resolve_dependencies');
  console.log('----------------------------------------');
  try {
    const result = await resolveDependencies(['bridge-camera', 'bridge-push']);
    console.log('Input: ["bridge-camera", "bridge-push"]');
    console.log('\n✅ Resolved modules:');
    result.resolvedModules.forEach(m => {
      console.log(`  • ${m.name} (${m.reason})`);
    });
    console.log(`\n📝 Setup steps: ${result.setupSteps.length}`);
    console.log(`🔧 Env variables: ${result.envVariables.length}`);
    if (result.conflicts.length > 0) {
      console.log(`⚠️ Conflicts: ${result.conflicts.length}`);
    }
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: generate_scaffold
  console.log('🏗️ Test 3: generate_scaffold');
  console.log('----------------------------------------');
  try {
    const result = await generateScaffold('test-hybrid-app', [
      'native-bridge-core',
      'bridge-camera',
      'bridge-push'
    ]);
    console.log('Input: projectName="test-hybrid-app"');
    console.log('       modules=["native-bridge-core", "bridge-camera", "bridge-push"]');
    console.log(`\n✅ Output path: ${result.outputPath}`);
    console.log(`📁 Directories: ${result.structure.directories.length}`);
    console.log(`📄 Files: ${result.structure.files.length}`);
    console.log('\nGenerated files:');
    result.structure.files.forEach(f => console.log(`  • ${f}`));
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('========================================');
  console.log('Test Complete!');
  console.log('========================================');
}

runTests().catch(console.error);

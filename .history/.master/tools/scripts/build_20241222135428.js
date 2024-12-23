#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build configuration
const config = {
  dev: {
    outDir: 'dist/nightly',
    tsConfig: 'config/development/tsconfig.json',
    env: { ...process.env, NODE_ENV: 'development' }
  },
  prod: {
    outDir: 'dist/stable',
    tsConfig: 'config/production/tsconfig.json',
    env: { ...process.env, NODE_ENV: 'production' }
  }
};

/**
 * Cleans the output directory
 */
function clean(outDir) {
  console.log(`\n🧹 Cleaning ${outDir}...`);
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });
}

/**
 * Compiles TypeScript files
 */
function compile(tsConfig, outDir) {
  console.log('\n📦 Compiling TypeScript...');
  execSync(`tsc --project ${tsConfig} --outDir ${outDir}`, {
    stdio: 'inherit'
  });
}

/**
 * Copies non-TypeScript files
 */
function copyAssets(outDir) {
  console.log('\n📋 Copying assets...');
  const assets = [
    'package.json',
    'README.md',
    'LICENSE',
    '.markdownlint.json',
    'config/**/*',
    'tools/**/*.js',
    '!tools/**/*.ts'
  ];

  assets.forEach(pattern => {
    execSync(`cp -r ${pattern} ${outDir}/`, { stdio: 'inherit' });
  });
}

/**
 * Runs tests for the build
 */
function runTests(mode) {
  console.log('\n🧪 Running tests...');
  execSync(`npm run test:${mode}`, { stdio: 'inherit' });
}

/**
 * Main build process
 */
function build(mode = 'dev') {
  console.log(`\n🚀 Starting ${mode} build...`);
  const { outDir, tsConfig, env } = config[mode];

  try {
    // Clean output directory
    clean(outDir);

    // Compile TypeScript
    compile(tsConfig, outDir);

    // Copy assets
    copyAssets(outDir);

    // Run tests
    runTests(mode);

    console.log(`\n✨ ${mode} build complete!`);
  } catch (error) {
    console.error(`\n❌ Build failed:`, error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--prod') ? 'prod' : 'dev';

  build(mode);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  build,
  clean,
  compile,
  copyAssets,
  runTests,
  config
}; 
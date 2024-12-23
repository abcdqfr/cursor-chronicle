#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Configuration
const config = {
  dev: {
    source: path.join(__dirname, '../dist/nightly'),
    target: path.join(os.homedir(), '.cursor')
  },
  prod: {
    source: path.join(__dirname, '../dist/stable'),
    target: process.env.CURSOR_INSTALL_DIR || '/usr/local/cursor'
  },
  directories: ['tools', 'config', 'extensions']
};

/**
 * Safely removes a directory or symlink
 */
function safeRemove(target) {
  try {
    if (!fs.existsSync(target)) return true;

    const stats = fs.lstatSync(target);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(target);
    } else if (stats.isDirectory()) {
      // Backup existing directory if it has content
      const backupDir = `${target}.backup-${Date.now()}`;
      fs.renameSync(target, backupDir);
      console.log(`📦 Backed up existing directory to: ${backupDir}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to remove ${target}:`, error.message);
    return false;
  }
}

/**
 * Creates a symlink with proper error handling
 */
function createSymlink(source, target) {
  try {
    // Ensure source exists
    if (!fs.existsSync(source)) {
      console.error(`Source does not exist: ${source}`);
      return false;
    }

    // Remove existing symlink or directory
    if (!safeRemove(target)) {
      return false;
    }

    // Create parent directory if needed
    const parentDir = path.dirname(target);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Create symlink
    fs.symlinkSync(source, target, 'dir');
    console.log(`✅ Symlinked: ${source} → ${target}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to symlink ${source} → ${target}:`, error.message);
    return false;
  }
}

/**
 * Sets up symlinks for development or production
 */
function setupSymlinks(mode = 'dev') {
  console.log(`\nSetting up ${mode} symlinks...`);
  
  const { source, target } = config[mode];
  let success = true;

  // Create base directories
  config.directories.forEach(dir => {
    const sourceDir = path.join(source, dir);
    const targetDir = path.join(target, dir);

    // Ensure source directory exists
    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir, { recursive: true });
    }

    success = createSymlink(sourceDir, targetDir) && success;
  });

  if (success) {
    console.log(`\n✨ ${mode} symlinks setup complete!`);
  } else {
    console.error('\n❌ Some symlinks failed to setup.');
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--prod') ? 'prod' : 'dev';

  // Check if running as root when needed
  if (mode === 'prod' && process.getuid && process.getuid() !== 0) {
    console.error('❌ Production symlinks require root privileges.');
    console.log('Please run with sudo.');
    process.exit(1);
  }

  // Setup symlinks
  setupSymlinks(mode);

  // Additional setup for development mode
  if (mode === 'dev') {
    try {
      // Install development dependencies
      console.log('\nInstalling development dependencies...');
      execSync('npm install', { stdio: 'inherit' });

      // Build nightly if it doesn't exist
      if (!fs.existsSync(config.dev.source)) {
        console.log('\nBuilding nightly...');
        execSync('npm run build:nightly', { stdio: 'inherit' });
      }
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  setupSymlinks,
  createSymlink,
  config,
  safeRemove
}; 
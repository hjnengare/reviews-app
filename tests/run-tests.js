#!/usr/bin/env node

/**
 * Test Runner Script for Reviews App
 * Provides convenient commands to run different types of tests
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logHeader = (message) => {
  const border = '='.repeat(message.length + 4);
  log(border, 'cyan');
  log(`  ${message}  `, 'cyan');
  log(border, 'cyan');
};

// Check if package.json exists and has required dependencies
const checkDependencies = () => {
  try {
    const packagePath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = [
      '@jest/globals',
      '@playwright/test',
      '@testing-library/dom',
      'jest',
      'jsdom'
    ];
    
    const devDeps = packageJson.devDependencies || {};
    const missing = requiredDeps.filter(dep => !devDeps[dep]);
    
    if (missing.length > 0) {
      log('❌ Missing required dependencies:', 'red');
      missing.forEach(dep => log(`   - ${dep}`, 'red'));
      log('\nInstall missing dependencies with:', 'yellow');
      log(`npm install --save-dev ${missing.join(' ')}`, 'bright');
      return false;
    }
    
    return true;
  } catch (error) {
    log('❌ Could not read package.json', 'red');
    return false;
  }
};

// Run a command with colored output
const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    log(`\n🚀 Running: ${command} ${args.join(' ')}`, 'blue');
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: rootDir,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`\n✅ Command completed successfully`, 'green');
        resolve(code);
      } else {
        log(`\n❌ Command failed with code ${code}`, 'red');
        reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
      }
    });
    
    child.on('error', (error) => {
      log(`\n💥 Command error: ${error.message}`, 'red');
      reject(error);
    });
  });
};

// Test runner functions
const testRunners = {
  // Run all tests
  async all() {
    logHeader('Running All Tests');
    
    try {
      await this.unit();
      await this.integration();
      await this.e2e();
      
      log('\n🎉 All tests completed successfully!', 'green');
    } catch (error) {
      log('\n💥 Some tests failed', 'red');
      process.exit(1);
    }
  },

  // Run unit tests only
  async unit() {
    logHeader('Running Unit Tests');
    
    await runCommand('npx', [
      'jest',
      '--testPathPattern=unit',
      '--coverage',
      '--verbose'
    ]);
  },

  // Run integration tests only
  async integration() {
    logHeader('Running Integration Tests');
    
    await runCommand('npx', [
      'jest',
      '--testPathPattern=integration',
      '--verbose'
    ]);
  },

  // Run E2E tests only
  async e2e() {
    logHeader('Running E2E Tests');
    
    log('📡 Checking if server is running...', 'yellow');
    
    try {
      // Check if server is running
      const response = await fetch('http://localhost:3002');
      if (!response.ok) {
        throw new Error('Server not accessible');
      }
      log('✅ Server is running', 'green');
    } catch (error) {
      log('❌ Server is not running on http://localhost:3002', 'red');
      log('Please start the server with: npm start', 'yellow');
      throw error;
    }
    
    await runCommand('npx', ['playwright', 'test']);
  },

  // Run tests in watch mode
  async watch() {
    logHeader('Running Tests in Watch Mode');
    
    await runCommand('npx', [
      'jest',
      '--watch',
      '--verbose'
    ]);
  },

  // Run tests with coverage
  async coverage() {
    logHeader('Running Tests with Coverage Report');
    
    await runCommand('npx', [
      'jest',
      '--coverage',
      '--coverageReporters=text',
      '--coverageReporters=html',
      '--coverageReporters=lcov'
    ]);
    
    log('\n📊 Coverage report generated in tests/coverage/', 'cyan');
  },

  // Run specific test file
  async file(filename) {
    if (!filename) {
      log('❌ Please specify a test file', 'red');
      log('Usage: npm run test:file <filename>', 'yellow');
      return;
    }
    
    logHeader(`Running Test File: ${filename}`);
    
    await runCommand('npx', [
      'jest',
      filename,
      '--verbose'
    ]);
  },

  // Run tests for mobile viewport only
  async mobile() {
    logHeader('Running Mobile-Specific E2E Tests');
    
    await runCommand('npx', [
      'playwright',
      'test',
      '--project="Mobile Chrome"',
      '--project="Mobile Safari"'
    ]);
  },

  // Run tests for desktop viewport only
  async desktop() {
    logHeader('Running Desktop-Specific E2E Tests');
    
    await runCommand('npx', [
      'playwright',
      'test',
      '--project=chromium',
      '--project=firefox',
      '--project=webkit'
    ]);
  },

  // Debug tests
  async debug() {
    logHeader('Running Tests in Debug Mode');
    
    log('🔍 Starting Jest in debug mode...', 'yellow');
    log('Use Chrome DevTools to debug', 'cyan');
    
    await runCommand('node', [
      '--inspect-brk',
      'node_modules/.bin/jest',
      '--runInBand',
      '--verbose'
    ]);
  },

  // Show help
  help() {
    logHeader('Reviews App Test Runner');
    
    log('\nAvailable commands:', 'bright');
    log('  all          Run all tests (unit, integration, e2e)', 'cyan');
    log('  unit         Run unit tests only', 'cyan');
    log('  integration  Run integration tests only', 'cyan');
    log('  e2e          Run end-to-end tests only', 'cyan');
    log('  watch        Run tests in watch mode', 'cyan');
    log('  coverage     Run tests with coverage report', 'cyan');
    log('  file <name>  Run specific test file', 'cyan');
    log('  mobile       Run mobile E2E tests only', 'cyan');
    log('  desktop      Run desktop E2E tests only', 'cyan');
    log('  debug        Run tests in debug mode', 'cyan');
    log('  help         Show this help message', 'cyan');
    
    log('\nExamples:', 'bright');
    log('  node tests/run-tests.js unit', 'yellow');
    log('  node tests/run-tests.js coverage', 'yellow');
    log('  node tests/run-tests.js file search-functionality.test.js', 'yellow');
    log('  node tests/run-tests.js mobile', 'yellow');
  }
};

// Main execution
const main = async () => {
  const command = process.argv[2] || 'help';
  const arg = process.argv[3];
  
  log('🧪 Reviews App Test Runner', 'bright');
  log(`Node.js version: ${process.version}`, 'blue');
  log(`Working directory: ${rootDir}`, 'blue');
  
  // Check dependencies
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  // Execute command
  try {
    if (command === 'file') {
      await testRunners.file(arg);
    } else if (testRunners[command]) {
      await testRunners[command]();
    } else {
      log(`❌ Unknown command: ${command}`, 'red');
      testRunners.help();
      process.exit(1);
    }
  } catch (error) {
    log(`\n💥 Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Handle process signals
process.on('SIGINT', () => {
  log('\n\n👋 Test runner interrupted', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n👋 Test runner terminated', 'yellow');
  process.exit(0);
});

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`\n💥 Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export default testRunners;
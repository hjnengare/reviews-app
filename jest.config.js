/**
 * Jest Configuration for Reviews App Tests
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setup.js'],
  
  // Module paths
  roots: ['<rootDir>/tests', '<rootDir>/public'],
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/dist/',
    '/build/'
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/public/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Transform files
  transform: {
    '^.+\\.m?js$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs'
        }]
      ]
    }]
  },
  
  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    'public/js/**/*.js',
    '!public/js/vendor/**',
    '!public/js/node_modules/**',
    '!**/*.min.js'
  ],
  
  coverageDirectory: 'tests/coverage',
  
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'clover'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Per-file thresholds
    './public/js/script.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './tests/reports',
      filename: 'test-report.html',
      pageTitle: 'Reviews App Test Report',
      expand: true
    }],
    ['jest-junit', {
      outputDirectory: './tests/reports',
      outputName: 'jest-junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // Global settings
  verbose: true,
  detectOpenHandles: true,
  forceExit: false,
  
  // Timeout settings
  testTimeout: 10000,
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Global variables
  globals: {
    'NODE_ENV': 'test'
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reset module registry before running each test
  resetModules: false,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch mode settings
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/tests/coverage/',
    '/tests/reports/',
    '/dist/',
    '/build/'
  ],
  
  // Snapshot serializers
  snapshotSerializers: [],
  
  // Max worker processes
  maxWorkers: '50%',
  
  // Cache settings
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Notify settings
  notify: false,
  notifyMode: 'failure-change',
  
  // Bail settings (stop after n failures)
  bail: 0,
  
  // Silent mode
  silent: false,
  
  // Display individual test results
  displayNames: true,
  
  // Run tests in band (useful for debugging)
  runInBand: false
};
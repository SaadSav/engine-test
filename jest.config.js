module.exports = {
  // Enable coverage collection
  collectCoverage: true,

  // Output directory for coverage reports
  coverageDirectory: 'coverage',

  // Coverage thresholds - Jest will fail if coverage falls below these values
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage report formats
  coverageReporters: ['text', 'lcov', 'html'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ]
};

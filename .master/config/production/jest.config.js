module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tools"],
  testMatch: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.test.js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  verbose: true,
  testTimeout: 5000,
  setupFilesAfterEnv: [".master/config/production/jest.setup.js"],
  // Additional production-specific settings
  maxWorkers: "50%",
  bail: true,
  ci: true,
};

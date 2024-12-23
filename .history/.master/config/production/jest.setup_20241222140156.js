// Strict timeout for production tests
jest.setTimeout(5000);

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test setup
beforeAll(() => {
  // Setup test environment variables
  process.env.NODE_ENV = "production";
  process.env.LOG_LEVEL = "error";

  // Disable console.log in production tests
  global.console.log = jest.fn();
});

// Global test teardown
afterAll(() => {
  // Cleanup test environment
  jest.clearAllMocks();
  jest.resetModules();

  // Restore console.log
  global.console.log.mockRestore();
});

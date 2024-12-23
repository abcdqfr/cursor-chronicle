import { setupTestEnvironment } from './src/test/helpers/testSetup';

// Global test setup
beforeAll(() => {
  setupTestEnvironment();
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global mock for VS Code module
jest.mock('vscode', () => ({
  // Default mock implementations
}), { virtual: true }); 
import * as vscode from 'vscode';
import { VSCodeMockFactory } from './helpers/mockFactory';
import type { WebviewPanel, WorkspaceConfiguration, OutputChannel } from './types/vscode.mock';

// Mock VS Code module
jest.mock('vscode', () => {
  const mockVSCode = {
    window: {
      createWebviewPanel: jest.fn().mockImplementation(() => 
        VSCodeMockFactory.createWebviewPanel() as WebviewPanel
      ),
      createOutputChannel: jest.fn().mockImplementation(() => 
        VSCodeMockFactory.createOutputChannel() as OutputChannel
      ),
      showInformationMessage: jest.fn(),
      showErrorMessage: jest.fn()
    },
    workspace: {
      getConfiguration: jest.fn().mockImplementation(() => 
        VSCodeMockFactory.createWorkspaceConfiguration() as WorkspaceConfiguration
      )
    },
    Uri: {
      file: jest.fn((f: string) => f),
      parse: jest.fn((u: string) => u)
    }
  };

  return mockVSCode;
}, { virtual: true });

// Setup global test environment
beforeAll(() => {
  jest.useFakeTimers({
    doNotFake: ['nextTick', 'setImmediate']
  });
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Cleanup after all tests
afterAll(() => {
  jest.useRealTimers();
});

// Export mock types for test usage
export type { WebviewPanel, WorkspaceConfiguration, OutputChannel };

// Export mock factory for convenience
export { VSCodeMockFactory };
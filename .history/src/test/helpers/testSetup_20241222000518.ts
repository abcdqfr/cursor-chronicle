import * as vscode from 'vscode';
import { VSCodeMockFactory } from './mockFactory';

export function setupTestEnvironment() {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock VS Code API
  const mockVSCode = {
    window: {
      createWebviewPanel: jest.fn().mockImplementation(() => 
        VSCodeMockFactory.createWebviewPanel()),
      createOutputChannel: jest.fn().mockImplementation(() => 
        VSCodeMockFactory.createOutputChannel()),
      showInformationMessage: jest.fn(),
      showErrorMessage: jest.fn()
    },
    workspace: {
      getConfiguration: jest.fn().mockImplementation(() => 
        VSCodeMockFactory.createWorkspaceConfiguration())
    },
    Uri: {
      file: jest.fn(f => f),
      parse: jest.fn(u => u)
    }
  };

  // Type-safe mock assignment
  Object.assign(vscode, mockVSCode);

  return mockVSCode;
} 
import * as vscode from 'vscode';
import { VSCodeMockFactory } from './mockFactory';

export function setupTestEnvironment() {
  // Add error boundary
  try {
    // Enable fake timers globally
    jest.useFakeTimers('modern');
    jest.clearAllMocks();
    
    const mockVSCode = {
      window: {
        createWebviewPanel: jest.fn().mockImplementation(() => {
          const panel = VSCodeMockFactory.createWebviewPanel();
          // Ensure async operations complete
          jest.runAllTimers();
          return panel;
        }),
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

    // Validate mock assignment
    const result = Object.assign(vscode, mockVSCode);
    if (!result.window?.createWebviewPanel) {
      throw new Error('Failed to assign VS Code mocks');
    }

    // Run any pending timers
    jest.runAllTimers();
    
    return mockVSCode;
  } catch (error) {
    console.error('Test environment setup failed:', error);
    jest.useRealTimers(); // Cleanup on error
    throw error;
  }
} 
import { setupTestEnvironment } from '../helpers/testSetup';
import { VSCodeMockFactory } from '../helpers/mockFactory';
import type { WebviewPanel } from '../types/vscode.mock';

describe('Extension Test Suite', () => {
  let vscode;
  
  beforeEach(() => {
    jest.useFakeTimers();
    vscode = setupTestEnvironment();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create webview panel correctly', async () => {
    // Add timeout for async operations
    jest.setTimeout(10000);
    
    const mockPanel = VSCodeMockFactory.createWebviewPanel({
      customHandlers: {
        reveal: jest.fn().mockImplementation(() => {
          return Promise.resolve();
        })
      }
    }) as WebviewPanel;

    // Wait for all promises to resolve
    await Promise.resolve();
    jest.runAllTimers();

    expect(mockPanel.webview.postMessage).toBeDefined();
    expect(mockPanel.reveal).toBeDefined();
    
    // Verify mock behavior
    await mockPanel.webview.postMessage('test');
    expect(mockPanel.webview.postMessage).toHaveBeenCalledWith('test');
  });

  // Add error case test
  it('should handle webview panel errors', async () => {
    const mockPanel = VSCodeMockFactory.createWebviewPanel({
      customHandlers: {
        postMessage: jest.fn().mockRejectedValue(new Error('Test error'))
      }
    });

    await expect(mockPanel.webview.postMessage('test'))
      .rejects.toThrow('Test error');
  });
}); 
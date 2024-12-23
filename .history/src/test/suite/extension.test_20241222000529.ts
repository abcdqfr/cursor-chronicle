import { setupTestEnvironment } from '../helpers/testSetup';
import { VSCodeMockFactory } from '../helpers/mockFactory';
import type { WebviewPanel } from '../types/vscode.mock';

describe('Extension Test Suite', () => {
  const vscode = setupTestEnvironment();
  
  it('should create webview panel correctly', async () => {
    const mockPanel = VSCodeMockFactory.createWebviewPanel({
      customHandlers: {
        reveal: jest.fn().mockImplementation(() => {
          // Custom implementation
        })
      }
    }) as WebviewPanel;

    // Type-safe usage
    expect(mockPanel.webview.postMessage).toHaveBeenCalled();
    expect(mockPanel.reveal).toHaveBeenCalled();
  });
}); 
import { setupTestEnvironment } from '../helpers/testSetup';
import { VSCodeMockFactory } from '../helpers/mockFactory';
import type { WebviewPanel } from '../types/vscode.mock';

describe('Extension Test Suite', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should create webview panel correctly', async () => {
    const mockPanel = VSCodeMockFactory.createWebviewPanel();
    
    // Flush promises and timers
    await Promise.resolve();
    jest.runAllTimers();
    
    // Verify panel
    expect(mockPanel).toBeDefined();
    expect(mockPanel.webview).toBeDefined();
  });
}); 
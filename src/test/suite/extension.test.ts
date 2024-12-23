import { VSCodeMockFactory } from '../helpers/mockFactory';

describe('Extension Test Suite', () => {
  beforeAll(() => {
    jest.useFakeTimers({
      doNotFake: ['nextTick', 'setImmediate']
    });
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
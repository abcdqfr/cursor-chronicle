interface MockFactoryOptions {
  partial?: boolean;
  customHandlers?: Record<string, jest.Mock>;
}

export class VSCodeMockFactory {
  static createWebviewPanel(options: MockFactoryOptions = {}) {
    try {
      const panel = {
        webview: {
          html: '',
          postMessage: jest.fn().mockImplementation(msg => Promise.resolve()),
          onDidReceiveMessage: jest.fn().mockImplementation(handler => ({
            dispose: jest.fn()
          })),
          asWebviewUri: jest.fn(uri => uri)
        },
        reveal: jest.fn(),
        onDidDispose: jest.fn().mockImplementation(handler => ({
          dispose: jest.fn()
        })),
        dispose: jest.fn(),
        ...options.customHandlers
      };
      
      // Validate mock structure
      this.validateMock(panel, 'WebviewPanel');
      return panel;
    } catch (error) {
      console.error('Failed to create WebviewPanel mock:', error);
      throw error;
    }
  }

  private static validateMock(mock: any, type: string) {
    // Add runtime type checking
    const required = {
      WebviewPanel: ['webview', 'reveal', 'onDidDispose', 'dispose'],
      // Add other mock types...
    };
    
    const missing = required[type]?.filter(prop => !(prop in mock));
    if (missing?.length) {
      throw new Error(`Invalid ${type} mock: Missing properties: ${missing.join(', ')}`);
    }
  }

  static createWorkspaceConfiguration(options: MockFactoryOptions = {}) {
    return {
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn(),
      inspect: jest.fn(),
      ...options.customHandlers
    };
  }

  static createOutputChannel(options: MockFactoryOptions = {}) {
    return {
      append: jest.fn(),
      appendLine: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      ...options.customHandlers
    };
  }
} 
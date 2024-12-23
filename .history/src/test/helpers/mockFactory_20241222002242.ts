interface MockFactoryOptions {
  partial?: boolean;
  customHandlers?: Record<string, jest.Mock>;
}

type MockValidationRules = Record<string, string[]>;

export class VSCodeMockFactory {
  static createWebviewPanel(options: MockFactoryOptions = {}) {
    try {
      const panel = {
        webview: {
          html: '',
          postMessage: jest.fn().mockImplementation((_: unknown) => Promise.resolve()),
          onDidReceiveMessage: jest.fn().mockImplementation((_: unknown) => ({
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
      
      // Ensure all methods are mocks
      Object.values(panel.webview).forEach(value => {
        if (typeof value === 'function' && !jest.isMockFunction(value)) {
          throw new Error('Non-mock function detected in webview panel');
        }
      });
      
      return panel;
    } catch (error) {
      console.error('Mock creation failed:', error);
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
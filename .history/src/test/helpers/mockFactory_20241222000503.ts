interface MockFactoryOptions {
  partial?: boolean;
  customHandlers?: Record<string, jest.Mock>;
}

export class VSCodeMockFactory {
  static createWebviewPanel(options: MockFactoryOptions = {}) {
    return {
      webview: {
        html: '',
        postMessage: jest.fn(),
        onDidReceiveMessage: jest.fn(),
        asWebviewUri: jest.fn(uri => uri)
      },
      reveal: jest.fn(),
      onDidDispose: jest.fn(),
      dispose: jest.fn(),
      ...options.customHandlers
    };
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
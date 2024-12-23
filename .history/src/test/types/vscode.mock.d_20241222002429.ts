declare namespace VSCodeMocks {
  interface WebviewPanel {
    webview: {
      html: string;
      postMessage: jest.Mock<Promise<void>, []>;
      onDidReceiveMessage: jest.Mock<{ dispose: jest.Mock }, []>;
      asWebviewUri: jest.Mock<string, [string]>;
    };
    reveal: jest.Mock<void, []>;
    onDidDispose: jest.Mock<{ dispose: jest.Mock }, []>;
    dispose: jest.Mock<void, []>;
  }

  interface WorkspaceConfiguration {
    get: jest.Mock<unknown, [string]>;
    update: jest.Mock<Promise<void>, [string, unknown]>;
    has: jest.Mock<boolean, [string]>;
    inspect: jest.Mock<unknown, [string]>;
  }

  interface OutputChannel {
    append: jest.Mock<void, [string]>;
    appendLine: jest.Mock<void, [string]>;
    clear: jest.Mock<void, []>;
    dispose: jest.Mock<void, []>;
    show: jest.Mock<void, []>;
    hide: jest.Mock<void, []>;
  }
}

export = VSCodeMocks; 
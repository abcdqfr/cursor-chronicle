declare namespace VSCodeMocks {
  interface WebviewPanel {
    webview: {
      html: string;
      postMessage: jest.Mock;
      onDidReceiveMessage: jest.Mock;
      asWebviewUri: jest.Mock;
    };
    reveal: jest.Mock;
    onDidDispose: jest.Mock;
    dispose: jest.Mock;
  }

  interface WorkspaceConfiguration {
    get: jest.Mock;
    update: jest.Mock;
    has: jest.Mock;
    inspect: jest.Mock;
  }

  interface OutputChannel {
    append: jest.Mock;
    appendLine: jest.Mock;
    clear: jest.Mock;
    dispose: jest.Mock;
    show: jest.Mock;
    hide: jest.Mock;
  }
}

export = VSCodeMocks; 
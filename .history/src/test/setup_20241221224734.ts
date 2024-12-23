// Mock VS Code's extension context
const mockContext = {
    subscriptions: [],
    workspaceState: {
        get: jest.fn(),
        update: jest.fn()
    },
    globalState: {
        get: jest.fn(),
        update: jest.fn()
    },
    extensionPath: '/mock/extension/path',
    asAbsolutePath: (relativePath: string) => `/mock/extension/path/${relativePath}`
};

// Mock VS Code's window
const mockWindow = {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    createWebviewPanel: jest.fn(),
    createOutputChannel: jest.fn(() => ({
        appendLine: jest.fn(),
        show: jest.fn(),
        dispose: jest.fn()
    }))
};

// Mock VS Code's workspace
const mockWorkspace = {
    getConfiguration: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn()
    })),
    workspaceFolders: [{ uri: { fsPath: '/mock/workspace' } }]
};

// Mock VS Code's commands
const mockCommands = {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
};

// Export mocked VS Code API
export const vscode = {
    ExtensionContext: mockContext,
    window: mockWindow,
    workspace: mockWorkspace,
    commands: mockCommands,
    ViewColumn: {
        One: 1,
        Two: 2,
        Three: 3
    },
    Uri: {
        file: (path: string) => ({ fsPath: path }),
        parse: (uri: string) => ({ fsPath: uri })
    }
};

// Make vscode available globally
(global as any).vscode = vscode; 
export const window = {
    createWebviewPanel: jest.fn()
};

export const ViewColumn = {
    One: 1,
    Two: 2,
    Three: 3
};

export const Uri = {
    file: jest.fn(),
    parse: jest.fn()
};

export const workspace = {
    getConfiguration: jest.fn(),
    workspaceFolders: [],
    onDidChangeConfiguration: jest.fn()
};

export const commands = {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
};

export const ExtensionContext = {
    subscriptions: []
};

export const extensions = {
    getExtension: jest.fn()
};

export const env = {
    openExternal: jest.fn()
};

export const ThemeColor = jest.fn();

export const Range = jest.fn();

export const Position = jest.fn();

export const Selection = jest.fn();

export const StatusBarAlignment = {
    Left: 1,
    Right: 2
};

export const WebviewPanel = jest.fn();

export const Disposable = jest.fn(); 
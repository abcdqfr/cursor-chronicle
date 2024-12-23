import { UIRenderer } from '../../ui/UIRenderer';
import * as vscode from 'vscode';
import { PatternDetector } from '../../analysis/PatternDetector';

// Mock VS Code API
interface MockWebviewPanel {
    webview: {
        html: string;
        onDidReceiveMessage: jest.Mock;
    };
    reveal: jest.Mock;
    onDidDispose: jest.Mock;
    dispose: jest.Mock;
}

const createMockWebviewPanel = (): MockWebviewPanel => ({
    webview: {
        html: '',
        onDidReceiveMessage: jest.fn()
    },
    reveal: jest.fn(),
    onDidDispose: jest.fn(),
    dispose: jest.fn()
});

jest.mock('vscode', () => ({
    window: {
        createWebviewPanel: jest.fn().mockImplementation(() => createMockWebviewPanel())
    },
    ViewColumn: {
        Two: 2
    }
}));

describe('UIRenderer', () => {
    let renderer: UIRenderer;
    let mockPanel: MockWebviewPanel;
    let patternDetector: PatternDetector;

    beforeEach(() => {
        jest.clearAllMocks();
        renderer = new UIRenderer();
        mockPanel = vscode.window.createWebviewPanel('chronicleUI', 'Chronicle', 2, {}) as unknown as MockWebviewPanel;
        patternDetector = new PatternDetector();
    });

    describe('showStatus', () => {
        it('should create and update panel with status', async () => {
            await renderer.showStatus();

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
                'chronicleUI',
                'Chronicle',
                2,
                {}
            );
        });
    });

    describe('Pattern Detection', () => {
        it('should detect test patterns in this file', () => {
            const fileContent = `
                describe('UIRenderer', () => {
                    let renderer: UIRenderer;
                    let mockPanel: MockWebviewPanel;

                    beforeEach(() => {
                        jest.clearAllMocks();
                        renderer = new UIRenderer();
                        mockPanel = vscode.window.createWebviewPanel('chronicleUI', 'Chronicle', 2, {}) as unknown as MockWebviewPanel;
                    });

                    it('should create and update panel', async () => {
                        await renderer.showStatus();
                        expect(mockPanel.webview.html).toBeDefined();
                    });
                });
            `;

            const patterns = patternDetector.analyzeTestStructure(fileContent);
            
            expect(patterns).toContainEqual(expect.objectContaining({
                type: 'SETUP',
                name: 'Test Setup'
            }));

            expect(patterns).toContainEqual(expect.objectContaining({
                type: 'MOCK',
                name: 'Mock Definition'
            }));

            expect(patterns).toContainEqual(expect.objectContaining({
                type: 'ASSERTION',
                name: 'Test Assertion'
            }));
        });

        it('should detect factory pattern', () => {
            const patterns = patternDetector.detectRefactoringPatterns(
                createMockWebviewPanel.toString()
            );

            expect(patterns).toContainEqual(expect.objectContaining({
                type: 'REFACTORING',
                name: 'Factory Pattern'
            }));
        });

        it('should detect type improvements', () => {
            const typeChanges = patternDetector.detectTypeChanges(`
                interface MockWebviewPanel {
                    webview: {
                        html: string;
                        onDidReceiveMessage: jest.Mock;
                    };
                }
            `);

            expect(typeChanges).toContain('MockWebviewPanel');
        });
    });
}); 
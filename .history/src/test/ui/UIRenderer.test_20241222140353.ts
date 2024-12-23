import * as vscode from 'vscode';
import { PatternDetector } from '../../analysis/PatternDetector';
import { UIRenderer } from '../../ui/UIRenderer';

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
    let patternDetector: PatternDetector;

    beforeEach(() => {
        jest.clearAllMocks();
        renderer = new UIRenderer();
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
                describe('Test Suite', () => {
                    beforeAll(() => {
                        // Setup code
                    });

                    it('should test something', () => {
                        expect(true).toBe(true);
                    });
                });
            `;

            const patterns = patternDetector.analyzeTestStructure(fileContent);
            
            expect(patterns).toContainEqual(expect.objectContaining({
                type: 'SETUP',
                name: 'Test Setup'
            }));

            expect(patterns).toContainEqual(expect.objectContaining({
                type: 'ORGANIZATION',
                name: 'BDD Structure'
            }));
        });

        it('should detect factory pattern', () => {
            const fileContent = `
                class WidgetFactory {
                    public static create(type: string) {
                        if (type === 'button') {
                            return new Button();
                        }
                        return new Widget();
                    }
                }
            `;

            const patterns = patternDetector.analyzeDesignPatterns(fileContent);

            expect(patterns).toContainEqual(expect.objectContaining({
                type: 'REFACTORING',
                name: 'Factory Pattern'
            }));
        });

        it('should detect code quality issues', () => {
            const fileContent = `
                function complexFunction() {
                    if (condition1) {
                        if (condition2) {
                            while (condition3) {
                                for (let i = 0; i < 10; i++) {
                                    if (condition4) {
                                        // Nested logic
                                    }
                                }
                            }
                        }
                    }
                }
            `;

            const patterns = patternDetector.analyzeCodeQuality(fileContent);

            expect(patterns).toContainEqual(expect.objectContaining({
                type: 'REFACTORING',
                name: 'High Complexity'
            }));
        });
    });
}); 
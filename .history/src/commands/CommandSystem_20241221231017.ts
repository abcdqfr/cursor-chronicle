import * as vscode from 'vscode';
import { StateManager } from '../state/StateManager';
import { AIAnalyzer } from '../ai/AIAnalyzer';
import { UIManager } from '../ui/UIManager';

export class CommandSystem {
    constructor(
        private readonly stateManager: StateManager,
        private readonly aiAnalyzer: AIAnalyzer,
        private readonly uiManager: UIManager
    ) {}

    async initialize() {
        // Register all commands
        this.registerCommands();
    }

    private registerCommands() {
        // Show UI
        vscode.commands.registerCommand('cursor-chronicle.showUI', async () => {
            try {
                await this.uiManager.showPanel();
            } catch (error) {
                vscode.window.showErrorMessage('Failed to show Chronicle UI');
                console.error(error);
            }
        });

        // Analyze current file
        vscode.commands.registerCommand('cursor-chronicle.analyzeFile', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No active editor');
                    return;
                }

                const content = editor.document.getText();
                const context = await this.aiAnalyzer.analyzeContext(content, 'code');
                const patterns = await this.aiAnalyzer.detectPatterns(context);
                const suggestions = await this.aiAnalyzer.suggestOptimizations(patterns);

                await this.stateManager.track({
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    type: 'analysis',
                    data: {
                        patterns,
                        suggestions
                    },
                    context
                });

                await this.uiManager.refreshPanel();
            } catch (error) {
                vscode.window.showErrorMessage('Failed to analyze file');
                console.error(error);
            }
        });

        // Show recent changes
        vscode.commands.registerCommand('cursor-chronicle.showChanges', async () => {
            try {
                await this.stateManager.getRecentChanges();
                await this.uiManager.refreshPanel();
            } catch (error) {
                vscode.window.showErrorMessage('Failed to show changes');
                console.error(error);
            }
        });
    }
} 
import * as vscode from 'vscode';
import { StateManager } from './state/StateManager';
import { AIAnalyzer } from './ai/AIAnalyzer';
import { UIRenderer } from './ui/UIRenderer';
import { HistoryIntegration } from './integration/HistoryIntegration';
import { BaseContext, StateChange } from './types';

export async function activate(context: vscode.ExtensionContext) {
    // Initialize core components
    const stateManager = new StateManager();
    const aiAnalyzer = new AIAnalyzer();
    const uiRenderer = new UIRenderer();

    // Initialize history integration
    const historyIntegration = new HistoryIntegration(
        stateManager,
        aiAnalyzer,
        uiRenderer
    );
    await historyIntegration.initialize();

    // Register commands
    const startCommand = vscode.commands.registerCommand('cursor-chronicle.start', () => {
        vscode.window.showInformationMessage('Cursor Chronicle is now active!');
        startTracking();
    });

    const showStatusCommand = vscode.commands.registerCommand('cursor-chronicle.showStatus', async () => {
        await uiRenderer.showStatus();
    });

    const analyzeContextCommand = vscode.commands.registerCommand('cursor-chronicle.analyzeContext', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        const content = editor.document.getText();
        const context = await aiAnalyzer.analyzeContext(content, 'code');
        await uiRenderer.showContext(context);

        const patterns = await aiAnalyzer.detectPatterns(context);
        if (patterns.length > 0) {
            const suggestions = await aiAnalyzer.suggestOptimizations(patterns);
            trackPatterns(context, patterns, suggestions);
        }
    });

    context.subscriptions.push(startCommand, showStatusCommand, analyzeContextCommand);

    // Setup event handlers
    uiRenderer.onUserInteraction(handleUserInteraction);
    stateManager.onStateChange(handleStateChange);

    // Helper functions
    function startTracking() {
        const disposable = vscode.workspace.onDidChangeTextDocument(async event => {
            if (event.document === vscode.window.activeTextEditor?.document) {
                const content = event.document.getText();
                const context = await aiAnalyzer.analyzeContext(content, 'code');
                
                const change: StateChange = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    type: 'document_change',
                    data: {
                        fileName: event.document.fileName,
                        changes: event.contentChanges
                    },
                    context
                };

                await stateManager.track(change);
            }
        });

        context.subscriptions.push(disposable);
    }

    async function trackPatterns(context: BaseContext, patterns: any[], suggestions: string[]) {
        const change: StateChange = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            type: 'pattern_detection',
            data: {
                patterns,
                suggestions
            },
            context
        };

        await stateManager.track(change);
    }

    async function handleUserInteraction(event: any) {
        if (event.type === 'suggestion_accept') {
            vscode.window.showInformationMessage(`Applying suggestion: ${event.data.suggestion}`);
            // Implement suggestion application logic
        }
    }

    async function handleStateChange(change: StateChange) {
        // Update UI based on state changes
        if (change.type === 'pattern_detection' || change.type === 'history_patterns') {
            await uiRenderer.visualizeData({
                type: 'graph',
                data: change.data.patterns
            });
        }
    }
}

export function deactivate() {
    // Cleanup resources
} 
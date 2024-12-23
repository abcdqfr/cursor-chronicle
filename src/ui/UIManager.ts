import * as vscode from 'vscode';
import { StateManager } from '../state/StateManager';
import { AIAnalyzer } from '../ai/AIAnalyzer';
import { Pattern } from '../types';

export class UIManager {
    private panel: vscode.WebviewPanel | undefined;

    constructor(
        private readonly stateManager: StateManager,
        private readonly aiAnalyzer: AIAnalyzer
    ) {}

    async initialize() {
        // Register UI-related commands
        this.registerCommands();
        
        // Set up state change listener
        this.stateManager.onStateChange(this.handleStateChange.bind(this));
    }

    private registerCommands() {
        vscode.commands.registerCommand('cursor-chronicle.showUI', () => {
            this.showPanel();
        });

        vscode.commands.registerCommand('cursor-chronicle.refreshUI', () => {
            this.refreshPanel();
        });
    }

    async showPanel() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'chronicleUI',
            'Chronicle',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'refresh':
                    await this.refreshPanel();
                    break;
                case 'showPattern':
                    await this.showPatternDetails(message.pattern);
                    break;
            }
        });

        await this.refreshPanel();
    }

    async refreshPanel() {
        if (!this.panel) {
            return;
        }

        const patterns = await this.stateManager.getPatterns();
        this.panel.webview.html = this.generateHtml(patterns);
    }

    private async handleStateChange() {
        if (this.panel) {
            await this.refreshPanel();
        }
    }

    private async showPatternDetails(pattern: Pattern) {
        if (!this.panel) {
            return;
        }

        const suggestions = await this.aiAnalyzer.suggestOptimizations([pattern]);
        this.panel.webview.html = this.generatePatternDetailsHtml(pattern, suggestions);
    }

    private generateHtml(patterns: Pattern[]): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chronicle</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                    }
                    .pattern {
                        margin-bottom: 20px;
                        padding: 10px;
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                    }
                    .pattern-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                    }
                    .pattern-type {
                        font-weight: bold;
                        color: var(--vscode-symbolIcon-classForeground);
                    }
                    .pattern-confidence {
                        color: var(--vscode-charts-blue);
                    }
                    .pattern-description {
                        margin-bottom: 10px;
                    }
                    .pattern-impact {
                        color: var(--vscode-charts-orange);
                    }
                </style>
            </head>
            <body>
                <h1>Chronicle</h1>
                <div id="patterns">
                    ${patterns.map(pattern => this.generatePatternHtml(pattern)).join('')}
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    document.querySelectorAll('.pattern').forEach(element => {
                        element.addEventListener('click', () => {
                            const pattern = JSON.parse(element.dataset.pattern);
                            vscode.postMessage({
                                command: 'showPattern',
                                pattern
                            });
                        });
                    });
                </script>
            </body>
            </html>
        `;
    }

    private generatePatternHtml(pattern: Pattern): string {
        return `
            <div class="pattern" data-pattern='${JSON.stringify(pattern)}'>
                <div class="pattern-header">
                    <span class="pattern-type">${pattern.type}</span>
                    <span class="pattern-confidence">${Math.round(pattern.confidence * 100)}% confidence</span>
                </div>
                <div class="pattern-description">${pattern.description}</div>
                <div class="pattern-impact">Impact: ${pattern.impact}</div>
            </div>
        `;
    }

    private generatePatternDetailsHtml(pattern: Pattern, suggestions: string[]): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pattern Details</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                    }
                    .details {
                        margin-bottom: 20px;
                        padding: 10px;
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                    }
                    .suggestions {
                        margin-top: 20px;
                    }
                    .suggestion {
                        margin: 10px 0;
                        padding: 10px;
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <h1>Pattern Details</h1>
                <div class="details">
                    <h2>${pattern.type}</h2>
                    <p>${pattern.description}</p>
                    <p>Confidence: ${Math.round(pattern.confidence * 100)}%</p>
                    <p>Impact: ${pattern.impact}</p>
                </div>
                <div class="suggestions">
                    <h2>Suggestions</h2>
                    ${suggestions.map(suggestion => `
                        <div class="suggestion">${suggestion}</div>
                    `).join('')}
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                </script>
            </body>
            </html>
        `;
    }
} 
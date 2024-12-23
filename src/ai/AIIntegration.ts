import * as vscode from 'vscode';
import { AIAnalyzer } from './AIAnalyzer';
import { StateManager } from '../state/StateManager';
import { UIRenderer } from '../ui/UIRenderer';
import { Pattern, BaseContext, StateChange } from '../types';

export class AIIntegration {
    constructor(
        private stateManager: StateManager,
        private aiAnalyzer: AIAnalyzer,
        private uiRenderer: UIRenderer
    ) {}

    async initialize() {
        // Set up document watchers
        this.setupDocumentWatchers();
        
        // Register AI-related commands
        this.registerCommands();
        
        // Initialize UI components
        await this.initializeUI();
    }

    private setupDocumentWatchers() {
        vscode.workspace.onDidChangeTextDocument(async (e) => {
            if (this.shouldAnalyzeDocument(e.document)) {
                await this.analyzeDocument(e.document);
            }
        });

        vscode.workspace.onDidOpenTextDocument(async (document) => {
            if (this.shouldAnalyzeDocument(document)) {
                await this.analyzeDocument(document);
            }
        });
    }

    private registerCommands() {
        vscode.commands.registerCommand('cursor-chronicle.analyzeCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await this.analyzeDocument(editor.document);
            }
        });

        vscode.commands.registerCommand('cursor-chronicle.showPatterns', async () => {
            const patterns = await this.stateManager.getPatterns();
            await this.uiRenderer.visualizeData({
                type: 'graph',
                data: { patterns }
            });
        });
    }

    private async initializeUI() {
        const recentPatterns = await this.stateManager.getPatterns();
        if (recentPatterns.length > 0) {
            await this.uiRenderer.visualizeData({
                type: 'graph',
                data: { patterns: recentPatterns }
            });
        }
    }

    private async analyzeDocument(document: vscode.TextDocument) {
        try {
            const content = document.getText();
            const context = await this.aiAnalyzer.analyzeContext(content, 'code');
            
            const patterns = await this.aiAnalyzer.detectPatterns(context);
            if (patterns.length > 0) {
                const suggestions = await this.aiAnalyzer.suggestOptimizations(patterns);
                await this.trackPatterns(context, patterns, suggestions);
            }
        } catch (error) {
            console.error('Error analyzing document:', error);
            vscode.window.showErrorMessage('Failed to analyze document');
        }
    }

    private async trackPatterns(
        context: BaseContext,
        patterns: Pattern[],
        suggestions: string[]
    ) {
        try {
            const change: StateChange = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: 'ai_patterns',
                data: {
                    patterns,
                    suggestions
                },
                context
            };

            await this.stateManager.track(change);
            
            // Update visualization
            await this.uiRenderer.visualizeData({
                type: 'graph',
                data: { patterns }
            });
        } catch (error) {
            console.error('Error tracking patterns:', error);
            vscode.window.showErrorMessage('Failed to track patterns');
        }
    }

    private shouldAnalyzeDocument(document: vscode.TextDocument): boolean {
        // Skip analysis for non-code files
        const supportedLanguages = ['typescript', 'javascript', 'python', 'java'];
        return supportedLanguages.includes(document.languageId);
    }
}
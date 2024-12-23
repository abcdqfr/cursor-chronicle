import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { StateManager } from '../state/StateManager';
import { AIAnalyzer } from '../ai/AIAnalyzer';
import { UIRenderer } from '../ui/UIRenderer';
import { BaseContext, StateChange } from '../types';

interface HistoryEntry {
    timestamp: number;
    content: string;
    path: string;
}

export class HistoryError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'HistoryError';
    }
}

export class HistoryIntegration {
    private readonly historyDir = '.history';

    constructor(
        private stateManager: StateManager,
        private aiAnalyzer: AIAnalyzer,
        private uiRenderer: UIRenderer
    ) {}

    async initialize() {
        // Set up history file watchers
        this.setupHistoryWatchers();
        
        // Register history commands
        this.registerHistoryCommands();
        
        // Initialize UI components
        await this.initializeUI();
    }

    private setupHistoryWatchers() {
        // Watch for history file changes
        vscode.workspace.onDidCreateFiles(async (e) => {
            for (const file of e.files) {
                if (this.isHistoryFile(file)) {
                    await this.processHistoryChange(file);
                }
            }
        });

        vscode.workspace.onDidChangeTextDocument(async (e) => {
            if (this.isHistoryFile(e.document.uri)) {
                await this.processHistoryChange(e.document.uri);
            }
        });
    }

    private async processHistoryChange(fileUri: vscode.Uri) {
        try {
            const content = await vscode.workspace.fs.readFile(fileUri);
            const context = await this.aiAnalyzer.analyzeContext(content.toString(), 'code');
            
            const change: StateChange = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: 'history_change',
                data: {
                    file: fileUri.fsPath,
                    content: content.toString()
                },
                context
            };

            await this.stateManager.track(change);
            
            // Analyze for patterns
            const patterns = await this.aiAnalyzer.detectPatterns(context);
            if (patterns.length > 0) {
                const suggestions = await this.aiAnalyzer.suggestOptimizations(patterns);
                await this.trackPatterns(context, patterns, suggestions);
            }
        } catch (err) {
            const error = err as Error;
            const historyError = new HistoryError(
                `Failed to process history change: ${error.message}`,
                'HISTORY_PROCESS_ERROR'
            );
            this.handleError(historyError);
        }
    }

    private async trackPatterns(context: BaseContext, patterns: any[], suggestions: string[]) {
        try {
            const change: StateChange = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: 'history_patterns',
                data: {
                    patterns,
                    suggestions
                },
                context
            };

            await this.stateManager.track(change);
            
            // Update visualization
            await this.uiRenderer.visualizeData({
                type: 'timeline',
                data: {
                    patterns,
                    suggestions,
                    timestamp: Date.now()
                }
            });
        } catch (err) {
            const error = err as Error;
            const historyError = new HistoryError(
                `Failed to track patterns: ${error.message}`,
                'PATTERN_TRACK_ERROR'
            );
            this.handleError(historyError);
        }
    }

    private registerHistoryCommands() {
        // Register enhanced history commands
        vscode.commands.registerCommand('cursor-chronicle.showHistory', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    throw new HistoryError('No active editor found', 'NO_ACTIVE_EDITOR');
                }
                const history = await this.getFileHistory(editor.document.uri);
                await this.uiRenderer.visualizeData({
                    type: 'timeline',
                    data: history
                });
            } catch (err) {
                this.handleError(err as Error);
            }
        });

        vscode.commands.registerCommand('cursor-chronicle.analyzeHistory', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    throw new HistoryError('No active editor found', 'NO_ACTIVE_EDITOR');
                }
                const history = await this.getFileHistory(editor.document.uri);
                const context = await this.aiAnalyzer.analyzeContext(
                    JSON.stringify(history),
                    'history'
                );
                await this.uiRenderer.showContext(context);
            } catch (err) {
                this.handleError(err as Error);
            }
        });
    }

    private async initializeUI() {
        try {
            const recentChanges = await this.stateManager.getRecentChanges();
            if (recentChanges.length > 0) {
                await this.uiRenderer.visualizeData({
                    type: 'timeline',
                    data: recentChanges
                });
            }
        } catch (err) {
            const error = err as Error;
            const historyError = new HistoryError(
                `Failed to initialize UI: ${error.message}`,
                'UI_INIT_ERROR'
            );
            this.handleError(historyError);
        }
    }

    private async getFileHistory(fileUri: vscode.Uri): Promise<HistoryEntry[]> {
        try {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
            if (!workspaceFolder) {
                throw new HistoryError('File not in workspace', 'NOT_IN_WORKSPACE');
            }

            const historyPath = path.join(
                workspaceFolder.uri.fsPath,
                this.historyDir,
                this.getHistoryRelativePath(fileUri)
            );

            const entries = await fs.readdir(historyPath);
            const historyEntries: HistoryEntry[] = [];

            for (const entry of entries) {
                if (this.isValidHistoryFile(entry)) {
                    const fullPath = path.join(historyPath, entry);
                    const content = await fs.readFile(fullPath, 'utf-8');
                    const timestamp = this.getTimestampFromFileName(entry);

                    historyEntries.push({
                        timestamp,
                        content,
                        path: fullPath
                    });
                }
            }

            return historyEntries.sort((a, b) => b.timestamp - a.timestamp);
        } catch (err) {
            const error = err as Error;
            if (error instanceof HistoryError) {
                throw error;
            }
            throw new HistoryError(
                `Failed to get file history: ${error.message}`,
                'HISTORY_READ_ERROR'
            );
        }
    }

    private getHistoryRelativePath(fileUri: vscode.Uri): string {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
        if (!workspaceFolder) {
            throw new HistoryError('File not in workspace', 'NOT_IN_WORKSPACE');
        }

        return path.relative(workspaceFolder.uri.fsPath, fileUri.fsPath);
    }

    private isValidHistoryFile(fileName: string): boolean {
        return /^\d{14}\.txt$/.test(fileName);
    }

    private getTimestampFromFileName(fileName: string): number {
        const match = fileName.match(/^(\d{14})\.txt$/);
        if (!match) {
            throw new HistoryError('Invalid history file name', 'INVALID_FILENAME');
        }
        return parseInt(match[1], 10);
    }

    private handleError(error: Error) {
        const message = error instanceof HistoryError ? 
            error.message : 
            'An unexpected error occurred';

        vscode.window.showErrorMessage(`Cursor Chronicle: ${message}`);
        console.error('Cursor Chronicle Error:', error);
    }

    private isHistoryFile(uri: vscode.Uri): boolean {
        return uri.fsPath.includes('.history') && 
               !uri.fsPath.endsWith('.git') &&
               !uri.fsPath.endsWith('.DS_Store');
    }
} 
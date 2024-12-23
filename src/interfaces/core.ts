import { BaseContext, Pattern, StateChange, VisualizationData } from '../types';

export interface IStateManager {
    track(change: StateChange): Promise<void>;
    query(filter: StateQuery): Promise<StateView>;
    onStateChange(listener: (change: StateChange) => void): void;
    getRecentChanges(count?: number): Promise<StateChange[]>;
}

export interface StateQuery {
    type?: string;
    from?: number;
    to?: number;
    filter?: (change: StateChange) => boolean;
}

export interface StateView {
    changes: StateChange[];
    metrics: {
        totalChanges: number;
        lastUpdate: number;
    };
}

export interface IAIAnalyzer {
    analyzeContext(content: string, type: string): Promise<BaseContext>;
    detectPatterns(context: BaseContext): Promise<Pattern[]>;
    suggestOptimizations(patterns: Pattern[]): Promise<string[]>;
}

export interface IUIRenderer {
    showStatus(): Promise<void>;
    showContext(context: BaseContext): Promise<void>;
    visualizeData(data: VisualizationData): Promise<void>;
    onUserInteraction(handler: (event: UIEvent) => void): void;
}

export interface UIEvent {
    type: string;
    target: string;
    data: Record<string, unknown>;
}

export interface ICommandHandler {
    registerCommand(command: Command): void;
    executeCommand(id: string, ...args: any[]): Promise<void>;
    getAvailableCommands(): Command[];
}

export interface Command {
    id: string;
    title: string;
    handler: (...args: any[]) => Promise<void>;
}

// Core interfaces for the extension
export interface IDisposable {
    dispose(): void;
}

export interface IConfigurable {
    configure(options: any): void;
}

export interface IInitializable {
    initialize(): Promise<void>;
}

export interface AnalysisResult {
    patterns: Pattern[];
    suggestions: string[];
    metrics: {
        complexity: number;
        maintainability: number;
        testability: number;
    };
}

export interface StateSnapshot {
    timestamp: number;
    context: BaseContext;
    analysis?: AnalysisResult;
}

export interface EventData {
    type: string;
    payload: unknown;
    timestamp: number;
}

export interface CommandResult {
    success: boolean;
    data: unknown;
    error?: Error;
}

export interface VisualizationConfig {
    type: 'graph' | 'timeline' | 'heatmap';
    options: Record<string, unknown>;
}

export interface ExtensionState {
    isActive: boolean;
    currentContext?: BaseContext;
    lastAnalysis?: AnalysisResult;
    settings: Record<string, unknown>;
} 
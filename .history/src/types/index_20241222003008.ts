import { Pattern as PatternDefinition } from './patterns';
import { TextDocumentContentChangeEvent } from 'vscode';

export interface BaseContext {
    type: string;
    timestamp: number;
    source: string;
    uri?: string;
    scheme?: string;
    authority?: string;
    path?: string;
    query?: string;
}

export interface CodeContext extends BaseContext {
    type: 'code';
    file: string;
    content: string;
    patterns: PatternDefinition[];
}

export interface GraphData {
    patterns: PatternDefinition[];
    relationships: {
        source: string;
        target: string;
        type: string;
        weight?: number;
    }[];
}

export interface TimelineEntry {
    timestamp: number;
    patterns: PatternDefinition[];
    suggestions: string[];
    metrics?: {
        complexity: number;
        maintainability: number;
        testability: number;
    };
}

export interface HeatmapData {
    cells: {
        x: number;
        y: number;
        value: number;
    }[];
    metadata: {
        metric: string;
        range: [number, number];
    };
    dates?: string[];
    values?: number[];
    maxValue?: number;
}

export type VisualizationData = {
    type: 'graph';
    data: GraphData;
} | {
    type: 'timeline';
    data: TimelineEntry[];
} | {
    type: 'heatmap';
    data: HeatmapData;
} | {
    type: 'patterns';
    data: {
        patterns: PatternDefinition[];
        suggestions?: string[];
    };
};

export type ContextType = 'code' | 'comment' | 'documentation';

export interface Pattern extends PatternDefinition {
    metadata?: Record<string, unknown>;
}

export type PatternType = 'complexity' | 'naming' | 'relationship' | 'architecture';
export type ImpactLevel = 'low' | 'medium' | 'high';

export interface StateChange {
    id: string;
    timestamp: number;
    type: string;
    description: string;
    patterns: Pattern[];
    data: {
        patterns?: Pattern[];
        suggestions?: string[];
        fileName?: string;
        changes?: readonly TextDocumentContentChangeEvent[];
        test?: boolean;
        value?: number;
        file?: string;
        content?: string;
    };
    context: BaseContext;
}

export interface Settings {
    theme: string;
    autoRefresh: boolean;
    refreshInterval: number;
    maxHistory: number;
    metrics: {
        complexity: boolean;
        maintainability: boolean;
        testability: boolean;
    };
    timestamp: number;
} 
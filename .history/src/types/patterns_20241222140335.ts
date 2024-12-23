export type PatternType = 
    | 'SETUP'
    | 'ORGANIZATION'
    | 'MOCKING'
    | 'ASSERTION'
    | 'REFACTORING'
    | 'TYPE_IMPROVEMENT'
    | 'QUALITY';

export interface Pattern {
    id: string;
    type: PatternType;
    name: string;
    description: string;
    confidence: number;
    location?: {
        start: number;
        end: number;
    };
    impact?: string;
}

export interface TestEvolution {
    errorProgression: number[];
    typeEvolution: string[];
    patterns: Pattern[];
    metrics: {
        initialErrors: number;
        finalErrors: number;
        typeImprovementCount: number;
        patternCount: number;
    };
}

export interface CodeAnalysis {
    patterns: Pattern[];
    metrics: {
        complexity: number;
        maintainability: number;
        testCoverage: number;
    };
    suggestions: string[];
} 
export enum PatternType {
    COMPLEXITY = 'complexity',
    NAMING = 'naming',
    RELATIONSHIP = 'relationship',
    ARCHITECTURE = 'architecture',
    SETUP = 'setup',
    MOCK = 'mock',
    ASSERTION = 'assertion',
    REFACTORING = 'refactoring'
}

export interface Pattern {
    id: string;
    type: PatternType;
    confidence: number;
    description: string;
    impact: string;
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
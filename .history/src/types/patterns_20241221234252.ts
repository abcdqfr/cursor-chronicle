export interface Pattern {
    id?: string;
    type: PatternType;
    name: string;
    description: string;
    location: {
        start: number;
        end: number;
    };
    confidence: number;
    impact: string;
}

export enum PatternType {
    MOCK = 'MOCK',
    ASSERTION = 'ASSERTION',
    SETUP = 'SETUP',
    REFACTORING = 'REFACTORING',
    TYPE_IMPROVEMENT = 'TYPE_IMPROVEMENT',
    ERROR_REDUCTION = 'ERROR_REDUCTION',
    COMPLEXITY = 'complexity',
    NAMING = 'naming',
    RELATIONSHIP = 'relationship',
    ARCHITECTURE = 'architecture'
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

export interface RefactoringCycle {
    type: string;
    before: string;
    after: string;
    impact: string;
    confidence: number;
} 
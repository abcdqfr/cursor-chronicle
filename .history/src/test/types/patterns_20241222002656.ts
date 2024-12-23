export enum PatternType {
    COMPLEXITY = 'complexity',
    NAMING = 'naming',
    RELATIONSHIP = 'relationship'
}

export interface Pattern {
    id: string;
    type: PatternType;
    confidence: number;
    description: string;
    impact: string;
} 
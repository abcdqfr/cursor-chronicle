import { Pattern, TestEvolution } from '../types/patterns';
import { CodeAnalyzer } from './CodeAnalyzer';

export class PatternDetector {
    private analyzer: CodeAnalyzer;

    constructor() {
        this.analyzer = new CodeAnalyzer();
    }

    public detectTestEvolutionPatterns(history: string[]): TestEvolution {
        const patterns: Pattern[] = [];
        const errorCounts: number[] = [];
        const typeImprovements: string[] = [];

        // Analyze each historical version
        history.forEach(version => {
            // Detect error count changes
            const errors = this.analyzer.countErrors(version);
            errorCounts.push(errors);

            // Detect type improvements
            const types = this.analyzer.detectTypeChanges(version);
            if (types.length > 0) {
                typeImprovements.push(...types);
            }

            // Detect test pattern changes
            const testPatterns = this.analyzer.detectTestPatterns(version);
            patterns.push(...testPatterns);
        });

        return {
            errorProgression: errorCounts,
            typeEvolution: typeImprovements,
            patterns: patterns,
            metrics: {
                initialErrors: errorCounts[0] || 0,
                finalErrors: errorCounts[errorCounts.length - 1] || 0,
                typeImprovementCount: typeImprovements.length,
                patternCount: patterns.length
            }
        };
    }

    public detectRefactoringPatterns(code: string): Pattern[] {
        return this.analyzer.detectRefactoringPatterns(code);
    }

    public detectTypeChanges(code: string): string[] {
        return this.analyzer.detectTypeChanges(code);
    }

    public analyzeTestStructure(test: string): Pattern[] {
        const patterns: Pattern[] = [];
        
        // Detect mock patterns
        const mockPatterns = this.analyzer.detectMockPatterns(test);
        patterns.push(...mockPatterns);

        // Detect assertion patterns
        const assertionPatterns = this.analyzer.detectAssertionPatterns(test);
        patterns.push(...assertionPatterns);

        // Detect setup patterns
        const setupPatterns = this.analyzer.detectSetupPatterns(test);
        patterns.push(...setupPatterns);

        return patterns;
    }
} 
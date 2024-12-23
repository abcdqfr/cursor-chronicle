import { Pattern } from '../types/patterns';
import { CodeAnalyzer } from './CodeAnalyzer';

export class PatternDetector {
    private codeAnalyzer: CodeAnalyzer;

    constructor() {
        this.codeAnalyzer = new CodeAnalyzer();
    }

    public analyzeTestStructure(code: string): Pattern[] {
        const patterns: Pattern[] = [];
        
        // Detect test setup patterns
        if (code.includes('beforeAll') || code.includes('beforeEach')) {
            patterns.push({
                id: this.codeAnalyzer.generateId(),
                type: 'SETUP',
                name: 'Test Setup',
                description: 'Test setup using before hooks',
                confidence: 0.9
            });
        }

        // Detect test organization patterns
        if (code.includes('describe(') && code.includes('it(')) {
            patterns.push({
                id: this.codeAnalyzer.generateId(),
                type: 'ORGANIZATION',
                name: 'BDD Structure',
                description: 'Tests organized using describe/it blocks',
                confidence: 0.85
            });
        }

        // Detect mocking patterns
        if (code.includes('jest.mock(') || code.includes('jest.spyOn(')) {
            patterns.push({
                id: this.codeAnalyzer.generateId(),
                type: 'MOCKING',
                name: 'Test Mocking',
                description: 'Using Jest mocks and spies',
                confidence: 0.95
            });
        }

        return patterns;
    }

    public analyzeDesignPatterns(code: string): Pattern[] {
        const patterns: Pattern[] = [];

        // Detect Factory pattern
        if (
            code.includes('class') &&
            code.includes('create') &&
            (code.includes('return new') || code.includes('return {'))
        ) {
            patterns.push({
                id: this.codeAnalyzer.generateId(),
                type: 'REFACTORING',
                name: 'Factory Pattern',
                description: 'Factory pattern implementation detected',
                confidence: 0.8
            });
        }

        // Detect Singleton pattern
        if (
            code.includes('private constructor') ||
            (code.includes('static instance') && code.includes('private static'))
        ) {
            patterns.push({
                id: this.codeAnalyzer.generateId(),
                type: 'REFACTORING',
                name: 'Singleton Pattern',
                description: 'Singleton pattern implementation detected',
                confidence: 0.9
            });
        }

        // Detect Observer pattern
        if (
            code.includes('subscribe') ||
            (code.includes('addEventListener') && code.includes('removeEventListener'))
        ) {
            patterns.push({
                id: this.codeAnalyzer.generateId(),
                type: 'REFACTORING',
                name: 'Observer Pattern',
                description: 'Observer pattern implementation detected',
                confidence: 0.75
            });
        }

        return patterns;
    }

    public analyzeCodeQuality(code: string): Pattern[] {
        const patterns: Pattern[] = [];
        const errorCount = this.codeAnalyzer.countErrors(code);
        const complexityScore = this.codeAnalyzer.calculateComplexity(code);

        // Always add code quality pattern
        if (errorCount === 0) {
            patterns.push({
                id: this.codeAnalyzer.generateId(),
                type: 'QUALITY',
                name: 'Clean Code',
                description: 'No syntax errors detected',
                confidence: 1.0
            });
        }

        // Add complexity pattern if score is high
        if (complexityScore > 5) {  // Lowered threshold to catch more complex code
            patterns.push({
                id: this.codeAnalyzer.generateId(),
                type: 'REFACTORING',
                name: 'High Complexity',
                description: 'Code may need refactoring to reduce complexity',
                confidence: Math.min(complexityScore / 10, 1.0)  // Scale confidence with complexity
            });
        }

        return patterns;
    }
} 
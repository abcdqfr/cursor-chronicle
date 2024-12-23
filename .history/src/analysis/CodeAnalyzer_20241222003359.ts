import { Pattern, PatternType } from '../types/patterns';
import * as ts from 'typescript';
import { v4 as uuidv4 } from 'uuid';

export class CodeAnalyzer {
    public countErrors(code: string): number {
        const program = this.createProgram(code);
        const diagnostics = ts.getPreEmitDiagnostics(program);
        return diagnostics.length;
    }

    public detectTypeChanges(code: string): string[] {
        const improvements: string[] = [];
        const sourceFile = this.parseTypeScript(code);
        
        ts.forEachChild(sourceFile, node => {
            if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
                improvements.push(node.name.text);
            }
        });

        return improvements;
    }

    public detectTestPatterns(code: string): Pattern[] {
        const patterns: Pattern[] = [];
        const sourceFile = this.parseTypeScript(code);

        ts.forEachChild(sourceFile, node => {
            if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
                if (node.expression.text === 'describe' || node.expression.text === 'it') {
                    patterns.push(this.createTestPattern(node));
                }
            }
        });

        return patterns;
    }

    public detectMockPatterns(code: string): Pattern[] {
        const patterns: Pattern[] = [];
        const sourceFile = this.parseTypeScript(code);

        ts.forEachChild(sourceFile, node => {
            if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
                if (node.expression.text === 'jest.mock' || node.expression.text === 'jest.fn') {
                    patterns.push(this.createMockPattern(node));
                }
            }
        });

        return patterns;
    }

    public detectAssertionPatterns(code: string): Pattern[] {
        const patterns: Pattern[] = [];
        const sourceFile = this.parseTypeScript(code);

        ts.forEachChild(sourceFile, node => {
            if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
                if (node.expression.name.text.startsWith('expect')) {
                    patterns.push(this.createAssertionPattern(node));
                }
            }
        });

        return patterns;
    }

    public detectSetupPatterns(code: string): Pattern[] {
        const patterns: Pattern[] = [];
        const sourceFile = this.parseTypeScript(code);

        ts.forEachChild(sourceFile, node => {
            if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
                if (['beforeEach', 'beforeAll', 'afterEach', 'afterAll'].includes(node.expression.text)) {
                    patterns.push(this.createSetupPattern(node));
                }
            }
        });

        return patterns;
    }

    public detectRefactoringPatterns(code: string): Pattern[] {
        const patterns: Pattern[] = [];
        const sourceFile = this.parseTypeScript(code);

        // Detect factory pattern
        patterns.push(...this.detectFactoryPatterns(sourceFile));
        
        // Detect type assertions
        patterns.push(...this.detectTypeAssertionPatterns(sourceFile));

        return patterns;
    }

    private createProgram(code: string): ts.Program {
        const compilerOptions: ts.CompilerOptions = {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
            strict: true
        };

        const sourceFile = ts.createSourceFile(
            'temp.ts',
            code,
            ts.ScriptTarget.ES2020,
            true
        );

        return ts.createProgram([sourceFile.fileName], compilerOptions);
    }

    private parseTypeScript(code: string): ts.SourceFile {
        return ts.createSourceFile(
            'temp.ts',
            code,
            ts.ScriptTarget.ES2020,
            true
        );
    }

    private createTestPattern(node: ts.CallExpression): Pattern {
        return {
            id: uuidv4(),
            type: PatternType.SETUP,
            name: 'Test Definition',
            description: 'Identifies test setup pattern',
            location: { start: 0, end: 10 },
            confidence: 0.8,
            impact: 'Improves test structure'
        };
    }

    private createMockPattern(node: ts.CallExpression): Pattern {
        return {
            id: uuidv4(),
            type: PatternType.MOCK,
            name: 'Mock Definition',
            description: 'Jest mock creation',
            location: {
                start: node.pos,
                end: node.end
            },
            confidence: 1,
            impact: 'Creates test double'
        };
    }

    private createAssertionPattern(node: ts.CallExpression): Pattern {
        return {
            id: uuidv4(),
            type: PatternType.ASSERTION,
            name: 'Test Assertion',
            description: 'Jest expectation',
            location: {
                start: node.pos,
                end: node.end
            },
            confidence: 1,
            impact: 'Verifies test condition'
        };
    }

    private createSetupPattern(node: ts.CallExpression): Pattern {
        return {
            id: uuidv4(),
            type: PatternType.SETUP,
            name: 'Test Setup',
            description: 'Test lifecycle hook',
            location: {
                start: node.pos,
                end: node.end
            },
            confidence: 1,
            impact: 'Manages test lifecycle'
        };
    }

    private detectFactoryPatterns(sourceFile: ts.SourceFile): Pattern[] {
        const patterns: Pattern[] = [];
        
        ts.forEachChild(sourceFile, node => {
            if (ts.isFunctionDeclaration(node) && node.name?.text.startsWith('create')) {
                patterns.push({
                    id: uuidv4(),
                    type: PatternType.REFACTORING,
                    name: 'Factory Pattern',
                    description: `Factory function: ${node.name.text}`,
                    location: {
                        start: node.pos,
                        end: node.end
                    },
                    confidence: 0.9,
                    impact: 'Improves test object creation'
                });
            }
        });

        return patterns;
    }

    private detectTypeAssertionPatterns(sourceFile: ts.SourceFile): Pattern[] {
        const patterns: Pattern[] = [];
        
        ts.forEachChild(sourceFile, node => {
            if (ts.isAsExpression(node)) {
                patterns.push({
                    id: uuidv4(),
                    type: PatternType.TYPE_IMPROVEMENT,
                    name: 'Type Assertion',
                    description: 'Explicit type casting',
                    location: {
                        start: node.pos,
                        end: node.end
                    },
                    confidence: 0.8,
                    impact: 'Improves type safety'
                });
            }
        });

        return patterns;
    }
} 
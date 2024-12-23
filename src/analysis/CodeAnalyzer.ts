import * as ts from 'typescript';
import { v4 as uuidv4 } from 'uuid';

export class CodeAnalyzer {
    public countErrors(code: string): number {
        try {
            const program = ts.createProgram(['temp.ts'], {
                noEmit: true,
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.CommonJS
            });
            
            const sourceFile = program.getSourceFile('temp.ts');
            if (!sourceFile) return 0;
            
            const diagnostics = ts.getPreEmitDiagnostics(program);
            return diagnostics.length;
        } catch (error) {
            console.error('Error analyzing code:', error);
            return 0;
        }
    }

    public calculateComplexity(code: string): number {
        let complexity = 0;
        
        // Count decision points (if, while, for, etc.)
        const decisionPoints = (code.match(/if|while|for|switch|catch/g) || []).length;
        complexity += decisionPoints * 2;  // Weight decision points more heavily

        // Count logical operators
        const logicalOperators = (code.match(/&&|\|\|/g) || []).length;
        complexity += logicalOperators;

        // Count function declarations
        const functions = (code.match(/function|=>/g) || []).length;
        complexity += functions;

        // Count nesting levels
        const lines = code.split('\n');
        let maxIndentation = 0;
        lines.forEach(line => {
            const indentation = line.search(/\S/);
            if (indentation > maxIndentation) {
                maxIndentation = indentation;
            }
        });
        complexity += Math.floor(maxIndentation / 2);  // Each level of nesting adds complexity

        // Count class declarations and methods
        const classRelated = (code.match(/class|constructor|extends|implements/g) || []).length;
        complexity += classRelated;

        // Count try-catch blocks
        const errorHandling = (code.match(/try|catch|finally|throw/g) || []).length;
        complexity += errorHandling;

        return complexity;
    }

    public generateId(): string {
        return uuidv4();
    }
} 
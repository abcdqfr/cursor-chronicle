import { Pattern } from '../types/patterns';

interface Impact {
    score: number;
    recommendation: string;
}

interface BaseContext {
    type: ContextType;
    timestamp: number;
    source: string;
}

type ContextType = 'code' | 'documentation' | 'comment';

export class AIAnalyzer {
    public async analyzeContext(content: string, type: string): Promise<BaseContext> {
        // Basic content analysis to determine if the type is appropriate
        const contentLowerCase = content.toLowerCase();
        const hasCode = contentLowerCase.includes('function') || 
                       contentLowerCase.includes('class') || 
                       contentLowerCase.includes('const') ||
                       contentLowerCase.includes('let') ||
                       contentLowerCase.includes('var');
                       
        const hasDocumentation = contentLowerCase.includes('/**') || 
                                contentLowerCase.includes('*/') ||
                                contentLowerCase.includes('//') ||
                                contentLowerCase.startsWith('#');

        // Validate and potentially adjust the type based on content
        let validatedType = this.validateContextType(type);
        if (validatedType === 'code' && !hasCode && hasDocumentation) {
            validatedType = 'documentation';
        } else if (validatedType === 'documentation' && hasCode && !hasDocumentation) {
            validatedType = 'code';
        }

        return {
            type: validatedType,
            timestamp: Date.now(),
            source: 'ai_analyzer'
        };
    }

    public async detectPatterns(context: BaseContext): Promise<Pattern[]> {
        const patterns: Pattern[] = [];

        if (context.type === 'code') {
            patterns.push({
                id: 'naming-1',
                type: 'QUALITY',
                name: 'Naming Convention',
                description: 'Consistent naming patterns detected',
                confidence: 0.8
            });
        }

        if (context.type === 'documentation') {
            patterns.push({
                id: 'doc-1',
                type: 'QUALITY',
                name: 'Documentation Quality',
                description: 'Well-structured documentation',
                confidence: 0.9
            });
        }

        return patterns;
    }

    public suggestOptimizations(patterns: Pattern[]): string[] {
        return patterns.map(pattern => {
            const impact = this.analyzeImpact(pattern);
            return `${pattern.name}: ${impact.recommendation} (Impact Score: ${impact.score})`;
        });
    }

    public analyzeImpact(pattern: Pattern): Impact {
        const baseScore = pattern.confidence * 10;
        let score = baseScore;

        // Adjust score based on pattern type
        switch (pattern.type) {
            case 'QUALITY':
                score *= 1.2; // Quality issues are high priority
                break;
            case 'REFACTORING':
                score *= 1.1; // Refactoring opportunities are important
                break;
            case 'TYPE_IMPROVEMENT':
                score *= 1.0; // Type improvements are standard priority
                break;
            default:
                score *= 0.9; // Other patterns are lower priority
        }

        // Adjust score based on impact
        if (pattern.impact === 'high') {
            score *= 1.5;
        } else if (pattern.impact === 'medium') {
            score *= 1.2;
        }

        return {
            score,
            recommendation: this.generateRecommendation(pattern)
        };
    }

    private generateRecommendation(pattern: Pattern): string {
        switch (pattern.type) {
            case 'QUALITY':
                return `Consider improving code quality: ${pattern.description}`;
            case 'REFACTORING':
                return `Refactoring opportunity: ${pattern.description}`;
            case 'TYPE_IMPROVEMENT':
                return `Type system improvement: ${pattern.description}`;
            case 'SETUP':
                return `Test setup enhancement: ${pattern.description}`;
            case 'ORGANIZATION':
                return `Structure improvement: ${pattern.description}`;
            case 'MOCKING':
                return `Test mock enhancement: ${pattern.description}`;
            case 'ASSERTION':
                return `Test assertion improvement: ${pattern.description}`;
            default:
                return `General improvement: ${pattern.description}`;
        }
    }

    private validateContextType(type: string): ContextType {
        const validTypes: ContextType[] = ['code', 'documentation', 'comment'];
        if (validTypes.includes(type as ContextType)) {
            return type as ContextType;
        }
        throw new Error(`Invalid context type: ${type}`);
    }
}
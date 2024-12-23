import { Pattern } from '../types/patterns';

interface Impact {
    score: number;
    recommendation: string;
}

export class AIAnalyzer {
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
}
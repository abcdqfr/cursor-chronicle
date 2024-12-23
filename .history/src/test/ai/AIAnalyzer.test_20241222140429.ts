import { AIAnalyzer } from '../../ai/AIAnalyzer';
import { BaseContext, Pattern } from '../../types';
import { PatternType } from '../../types/patterns';

describe('AIAnalyzer', () => {
    let analyzer: AIAnalyzer;

    beforeEach(() => {
        analyzer = new AIAnalyzer();
    });

    describe('analyzeContext', () => {
        it('should analyze code context', async () => {
            const content = 'function test() { return true; }';
            const context = await analyzer.analyzeContext(content, 'code');

            expect(context).toBeDefined();
            expect(context.type).toBe('code');
            expect(context.timestamp).toBeDefined();
            expect(context.source).toBe('ai_analyzer');
        });

        it('should analyze documentation context', async () => {
            const content = '# Documentation\nThis is a test.';
            const context = await analyzer.analyzeContext(content, 'documentation');

            expect(context).toBeDefined();
            expect(context.type).toBe('documentation');
            expect(context.timestamp).toBeDefined();
            expect(context.source).toBe('ai_analyzer');
        });

        it('should throw error for invalid context type', async () => {
            const content = 'test content';
            await expect(analyzer.analyzeContext(content, 'invalid')).rejects.toThrow();
        });
    });

    describe('detectPatterns', () => {
        it('should detect patterns in code context', async () => {
            const context: BaseContext = {
                type: 'code',
                timestamp: Date.now(),
                source: 'test'
            };

            const patterns = await analyzer.detectPatterns(context);

            expect(patterns).toBeDefined();
            expect(Array.isArray(patterns)).toBe(true);
            expect(patterns.length).toBeGreaterThan(0);

            patterns.forEach(pattern => {
                expect(pattern).toHaveProperty('id');
                expect(pattern).toHaveProperty('type');
                expect(pattern).toHaveProperty('confidence');
                expect(pattern).toHaveProperty('description');
                expect(pattern).toHaveProperty('impact');
            });
        });

        it('should detect naming patterns in any context', async () => {
            const context: BaseContext = {
                type: 'documentation',
                timestamp: Date.now(),
                source: 'test'
            };

            const patterns = await analyzer.detectPatterns(context);

            expect(patterns).toBeDefined();
            expect(Array.isArray(patterns)).toBe(true);

            const namingPatterns = patterns.filter(p => p.type === 'naming');
            expect(namingPatterns.length).toBeGreaterThan(0);
        });
    });

    describe('suggestOptimizations', () => {
        it('should suggest optimizations for patterns', () => {
            const patterns: Pattern[] = [
                {
                    id: 'test-id',
                    type: 'QUALITY',
                    name: 'High Complexity',
                    confidence: 0.7,
                    description: 'Test complexity pattern',
                    impact: 'high'
                }
            ];

            const suggestions = analyzer.suggestOptimizations(patterns);
            expect(suggestions).toBeDefined();
            expect(suggestions.length).toBeGreaterThan(0);
            expect(suggestions[0]).toContain('complexity');
        });

        it('should provide different suggestions for different pattern types', () => {
            const patterns: Pattern[] = [
                {
                    id: 'test-id',
                    type: 'QUALITY',
                    name: 'High Complexity',
                    confidence: 0.7,
                    description: 'High complexity',
                    impact: 'high'
                },
                {
                    id: 'test-id-2',
                    type: 'REFACTORING',
                    name: 'Factory Pattern',
                    confidence: 0.8,
                    description: 'Factory pattern detected',
                    impact: 'medium'
                }
            ];

            const suggestions = analyzer.suggestOptimizations(patterns);
            expect(suggestions).toBeDefined();
            expect(suggestions.length).toBe(2);
            expect(suggestions[0]).not.toBe(suggestions[1]);
        });
    });

    describe('analyzeImpact', () => {
        it('should analyze pattern impact correctly', () => {
            const pattern: Pattern = {
                id: 'test-id',
                type: 'QUALITY',
                name: 'Test Pattern',
                confidence: 0.9,
                description: 'Test pattern',
                impact: 'high'
            };

            const impact = analyzer.analyzeImpact(pattern);
            expect(impact).toBeDefined();
            expect(impact.score).toBeGreaterThan(0);
            expect(impact.recommendation).toBeDefined();
        });

        it('should prioritize high confidence patterns', () => {
            const lowConfidencePattern: Pattern = {
                id: 'test-id-1',
                type: 'QUALITY',
                name: 'Test Pattern 1',
                confidence: 0.3,
                description: 'Test pattern 1',
                impact: 'high'
            };

            const highConfidencePattern: Pattern = {
                id: 'test-id-2',
                type: 'QUALITY',
                name: 'Test Pattern 2',
                confidence: 0.9,
                description: 'Test pattern 2',
                impact: 'high'
            };

            const lowImpact = analyzer.analyzeImpact(lowConfidencePattern);
            const highImpact = analyzer.analyzeImpact(highConfidencePattern);

            expect(highImpact.score).toBeGreaterThan(lowImpact.score);
        });
    });
}); 
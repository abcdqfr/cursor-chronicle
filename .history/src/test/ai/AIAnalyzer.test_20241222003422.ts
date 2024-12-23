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
        it('should suggest optimizations for patterns', async () => {
            const patterns: Pattern[] = [
                {
                    id: 'test-id',
                    type: PatternType.COMPLEXITY,
                    confidence: 0.7,
                    description: 'Test complexity pattern',
                    impact: 'high'
                }
            ];

            const suggestions = await analyzer.suggestOptimizations(patterns);

            expect(suggestions).toBeDefined();
            expect(Array.isArray(suggestions)).toBe(true);
            expect(suggestions.length).toBeGreaterThan(0);
            suggestions.forEach(suggestion => {
                expect(typeof suggestion).toBe('string');
            });
        });

        it('should provide different suggestions for different pattern types', async () => {
            const patterns: Pattern[] = [
                {
                    id: 'test-id',
                    type: PatternType.COMPLEXITY,
                    confidence: 0.7,
                    description: 'High complexity',
                    impact: 'high'
                },
                {
                    id: '2',
                    type: 'naming',
                    confidence: 0.7,
                    description: 'Inconsistent naming',
                    impact: 'medium'
                },
                {
                    id: '3',
                    type: 'relationship',
                    confidence: 0.6,
                    description: 'Related patterns',
                    impact: 'low'
                }
            ];

            const suggestions = await analyzer.suggestOptimizations(patterns);

            expect(suggestions.length).toBe(3);
            expect(suggestions[0]).toContain('complex');
            expect(suggestions[1]).toContain('naming');
            expect(suggestions[2]).toContain('pattern');
        });
    });
}); 
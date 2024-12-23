import { StateManager } from '../../state/StateManager';
import { StateChange, BaseContext } from '../../types';

describe('StateManager', () => {
    let stateManager: StateManager;

    beforeEach(() => {
        stateManager = new StateManager();
    });

    describe('track', () => {
        it('should track state changes', async () => {
            const context: BaseContext = {
                type: 'code',
                timestamp: Date.now(),
                source: 'test'
            };

            const change: StateChange = {
                id: '1',
                type: 'test',
                timestamp: Date.now(),
                data: { test: true },
                context
            };

            await stateManager.track(change);
            const state = await stateManager.getState();
            expect(state.changes).toContain(change);
        });
    });

    describe('getRecentChanges', () => {
        it('should return recent changes', async () => {
            const context: BaseContext = {
                type: 'code',
                timestamp: Date.now(),
                source: 'test'
            };

            const changes: StateChange[] = [
                {
                    id: '1',
                    type: 'test1',
                    timestamp: Date.now(),
                    data: { value: 1 },
                    context
                },
                {
                    id: '2',
                    type: 'test2',
                    timestamp: Date.now() + 1000,
                    data: { value: 2 },
                    context
                }
            ];

            for (const change of changes) {
                await stateManager.track(change);
            }

            const recentChanges = await stateManager.getRecentChanges(1);
            expect(recentChanges).toHaveLength(1);
            expect(recentChanges[0].id).toBe('2');
        });
    });

    describe('getPatterns', () => {
        it('should return tracked patterns', async () => {
            const context: BaseContext = {
                type: 'code',
                timestamp: Date.now(),
                source: 'test'
            };

            const change: StateChange = {
                id: '1',
                type: 'ai_patterns',
                timestamp: Date.now(),
                data: {
                    patterns: [
                        {
                            id: '1',
                            type: 'complexity',
                            confidence: 0.8,
                            description: 'Test pattern',
                            impact: 'medium'
                        }
                    ]
                },
                context
            };

            await stateManager.track(change);
            const patterns = await stateManager.getPatterns();
            expect(patterns).toHaveLength(1);
            expect(patterns[0].type).toBe('complexity');
        });
    });

    describe('onStateChange', () => {
        it('should notify listeners of state changes', async () => {
            const context: BaseContext = {
                type: 'code',
                timestamp: Date.now(),
                source: 'test'
            };

            const change: StateChange = {
                id: '1',
                type: 'test',
                timestamp: Date.now(),
                data: { test: true },
                context
            };

            const handler = jest.fn();
            stateManager.onStateChange(handler);

            await stateManager.track(change);
            expect(handler).toHaveBeenCalledWith(change);
        });
    });
}); 
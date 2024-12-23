import { Pattern, StateChange } from '../types';

export class StateManager {
    private changes: StateChange[] = [];
    private patterns: Pattern[] = [];
    private stateChangeHandlers: ((change: StateChange) => void)[] = [];

    async initialize() {
        // Initialize state management
        this.changes = [];
        this.patterns = [];
    }

    async track(change: StateChange) {
        this.changes.push(change);
        
        // Extract patterns from change if present
        if (change.type === 'ai_patterns' && change.data.patterns) {
            this.patterns.push(...change.data.patterns);
        }
        
        // Notify handlers
        this.stateChangeHandlers.forEach(handler => handler(change));
    }

    async getState() {
        return {
            changes: this.changes,
            patterns: this.patterns
        };
    }

    async getPatterns(): Promise<Pattern[]> {
        return this.patterns;
    }

    async getRecentChanges(limit = 10): Promise<StateChange[]> {
        return this.changes
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    onStateChange(handler: (change: StateChange) => void) {
        this.stateChangeHandlers.push(handler);
    }
} 
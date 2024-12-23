import * as vscode from 'vscode';
import { EventEmitter } from 'events';

export interface StateChange {
    type: 'feature' | 'progress' | 'context';
    data: any;
    timestamp: number;
}

export interface StateQuery {
    type?: string;
    from?: number;
    to?: number;
    filter?: (change: StateChange) => boolean;
}

export interface StateView {
    changes: StateChange[];
    metrics: {
        totalChanges: number;
        lastUpdate: number;
    };
}

export class ChronicleState {
    private state: vscode.Memento;
    private eventEmitter: EventEmitter;
    private changes: StateChange[] = [];
    private readonly MAX_CHANGES = 1000; // Rolling window of changes

    constructor(state: vscode.Memento) {
        this.state = state;
        this.eventEmitter = new EventEmitter();
        this.loadPersistedState();
    }

    private async loadPersistedState(): Promise<void> {
        const persistedChanges = await this.state.get<StateChange[]>('changes', []);
        this.changes = persistedChanges.slice(-this.MAX_CHANGES);
    }

    private async persistState(): Promise<void> {
        await this.state.update('changes', this.changes);
    }

    async track(change: StateChange): Promise<void> {
        // Add timestamp if not provided
        if (!change.timestamp) {
            change.timestamp = Date.now();
        }

        // Add to changes array with rolling window
        this.changes.push(change);
        if (this.changes.length > this.MAX_CHANGES) {
            this.changes = this.changes.slice(-this.MAX_CHANGES);
        }

        // Persist changes
        await this.persistState();

        // Emit change event
        this.eventEmitter.emit('stateChange', change);
    }

    async query(filter: StateQuery): Promise<StateView> {
        let filteredChanges = this.changes;

        // Apply type filter
        if (filter.type) {
            filteredChanges = filteredChanges.filter(c => c.type === filter.type);
        }

        // Apply time range filter
        if (filter.from) {
            filteredChanges = filteredChanges.filter(c => c.timestamp >= filter.from!);
        }
        if (filter.to) {
            filteredChanges = filteredChanges.filter(c => c.timestamp <= filter.to!);
        }

        // Apply custom filter
        if (filter.filter) {
            filteredChanges = filteredChanges.filter(filter.filter);
        }

        return {
            changes: filteredChanges,
            metrics: {
                totalChanges: this.changes.length,
                lastUpdate: this.changes.length > 0 ? 
                    this.changes[this.changes.length - 1].timestamp : 0
            }
        };
    }

    onStateChange(listener: (change: StateChange) => void): vscode.Disposable {
        this.eventEmitter.on('stateChange', listener);
        return {
            dispose: () => {
                this.eventEmitter.removeListener('stateChange', listener);
            }
        };
    }

    // Helper methods for common operations
    async getLastChange(): Promise<StateChange | undefined> {
        return this.changes[this.changes.length - 1];
    }

    async getChangesByType(type: string): Promise<StateChange[]> {
        return (await this.query({ type })).changes;
    }

    async getRecentChanges(count = 10): Promise<StateChange[]> {
        return this.changes.slice(-count);
    }
} 
import * as vscode from 'vscode';
import { Pattern as PatternDefinition, VisualizationData, TimelineEntry } from '../types';

export class UIRenderer {
    private panel: vscode.WebviewPanel | undefined;
    private eventHandlers: ((event: unknown) => void)[] = [];

    public async showStatus(): Promise<void> {
        await this.createOrShowPanel();
        await this.updatePanel(this.generateStatusHtml());
    }

    public async showContext(context: vscode.Uri): Promise<void> {
        await this.createOrShowPanel();
        await this.updatePanel(this.generateContextHtml(context));
    }

    public async visualizeData(data: VisualizationData): Promise<void> {
        await this.createOrShowPanel();
        await this.updatePanel(this.generateVisualizationHtml(data));
    }

    public onUserInteraction(handler: (event: unknown) => void): void {
        this.eventHandlers.push(handler);
    }

    private async createOrShowPanel(): Promise<void> {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'chronicleUI',
            'Chronicle',
            vscode.ViewColumn.Two,
            {}
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        this.panel.webview.onDidReceiveMessage(message => {
            this.eventHandlers.forEach(handler => handler(message));
        });
    }

    private async updatePanel(content: string): Promise<void> {
        if (!this.panel) {
            return;
        }

        this.panel.webview.html = content;
    }

    private generateStatusHtml(): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Chronicle Status</title>
                    <style>
                        body {
                            font-family: var(--vscode-font-family);
                            color: var(--vscode-editor-foreground);
                            background-color: var(--vscode-editor-background);
                            padding: 20px;
                        }
                        .status-container {
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .status-header {
                            font-size: 24px;
                            margin-bottom: 20px;
                            color: var(--vscode-textLink-foreground);
                        }
                        .status-section {
                            margin-bottom: 30px;
                            padding: 15px;
                            border: 1px solid var(--vscode-panel-border);
                            border-radius: 4px;
                        }
                        .status-section h2 {
                            margin-top: 0;
                            color: var(--vscode-textLink-activeForeground);
                        }
                    </style>
                </head>
                <body>
                    <div class="status-container">
                        <div class="status-header">Chronicle Status</div>
                        <div class="status-section">
                            <h2>AI Analysis</h2>
                            <p>Ready to analyze code patterns and suggest improvements.</p>
                        </div>
                        <div class="status-section">
                            <h2>History Tracking</h2>
                            <p>Monitoring code changes and evolution patterns.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    private generateContextHtml(context: vscode.Uri): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Context Analysis</title>
                    <style>
                        body {
                            font-family: var(--vscode-font-family);
                            color: var(--vscode-editor-foreground);
                            background-color: var(--vscode-editor-background);
                            padding: 20px;
                        }
                        .context-container {
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .context-header {
                            font-size: 24px;
                            margin-bottom: 20px;
                            color: var(--vscode-textLink-foreground);
                        }
                        .context-content {
                            padding: 15px;
                            border: 1px solid var(--vscode-panel-border);
                            border-radius: 4px;
                            background-color: var(--vscode-editor-background);
                        }
                        pre {
                            margin: 0;
                            white-space: pre-wrap;
                            word-wrap: break-word;
                        }
                    </style>
                </head>
                <body>
                    <div class="context-container">
                        <div class="context-header">Context Analysis</div>
                        <div class="context-content">
                            <pre>${JSON.stringify(context, null, 2)}</pre>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    private generateVisualizationHtml(data: VisualizationData): string {
        switch (data.type) {
            case 'graph':
                return this.generateGraphHtml(data);
            case 'timeline':
                return this.generateTimelineHtml(data);
            case 'heatmap':
                return this.generateHeatmapHtml(data);
            default:
                return '<div>Unsupported visualization type</div>';
        }
    }

    private generateGraphHtml(data: VisualizationData & { type: 'graph' }): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Pattern Analysis</title>
                    <style>
                        body {
                            font-family: var(--vscode-font-family);
                            color: var(--vscode-editor-foreground);
                            background-color: var(--vscode-editor-background);
                            padding: 20px;
                        }
                        .graph-container {
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .graph-header {
                            font-size: 24px;
                            margin-bottom: 20px;
                            color: var(--vscode-textLink-foreground);
                        }
                        .pattern {
                            margin-bottom: 15px;
                            padding: 10px;
                            border: 1px solid var(--vscode-panel-border);
                            border-radius: 4px;
                        }
                        .pattern-type {
                            font-weight: bold;
                            color: var(--vscode-textLink-activeForeground);
                        }
                        .pattern-description {
                            margin-top: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="graph-container">
                        <div class="graph-header">Pattern Analysis</div>
                        ${data.data.patterns.map((pattern: PatternDefinition) => `
                            <div class="pattern">
                                <div class="pattern-type">${pattern.type}</div>
                                <div class="pattern-description">${pattern.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `;
    }

    private generateTimelineHtml(data: VisualizationData & { type: 'timeline' }): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Timeline</title>
                    <style>
                        body {
                            font-family: var(--vscode-font-family);
                            color: var(--vscode-editor-foreground);
                            background-color: var(--vscode-editor-background);
                            padding: 20px;
                        }
                        .timeline-container {
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .timeline-header {
                            font-size: 24px;
                            margin-bottom: 20px;
                            color: var(--vscode-textLink-foreground);
                        }
                        .timeline-line {
                            position: relative;
                            margin: 40px 0;
                            padding-left: 20px;
                            border-left: 2px solid var(--vscode-panel-border);
                        }
                        .timeline-entry {
                            position: relative;
                            margin-bottom: 30px;
                            padding-left: 20px;
                        }
                        .timeline-dot {
                            position: absolute;
                            left: -26px;
                            top: 0;
                            width: 10px;
                            height: 10px;
                            background-color: var(--vscode-charts-blue);
                            border-radius: 50%;
                        }
                        .timeline-content {
                            padding: 10px;
                            border: 1px solid var(--vscode-panel-border);
                            border-radius: 4px;
                            background-color: var(--vscode-editor-background);
                        }
                        .timeline-date {
                            font-size: 12px;
                            color: var(--vscode-textPreformat-foreground);
                            margin-bottom: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="timeline-container">
                        <div class="timeline-header">Timeline</div>
                        <div class="timeline-line">
                            ${data.data.map((item: TimelineEntry) => `
                                <div class="timeline-entry">
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-content">
                                        <div class="timeline-date">${new Date(item.timestamp).toLocaleString()}</div>
                                        ${item.patterns.map((pattern: PatternDefinition) => `
                                            <div class="pattern">
                                                <div class="pattern-type">${pattern.type}</div>
                                                <div class="pattern-description">${pattern.description}</div>
                                            </div>
                                        `).join('')}
                                        ${item.suggestions.map(suggestion => `
                                            <div class="suggestion">${suggestion}</div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    private generateHeatmapHtml(data: VisualizationData & { type: 'heatmap' }): string {
        const { cells, metadata } = data.data;
        const cellSize = 20;
        const padding = 5;
        const width = Math.max(...cells.map(cell => cell.x)) * (cellSize + padding);
        const height = Math.max(...cells.map(cell => cell.y)) * (cellSize + padding);

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Heatmap</title>
                    <style>
                        body {
                            font-family: var(--vscode-font-family);
                            color: var(--vscode-editor-foreground);
                            background-color: var(--vscode-editor-background);
                            padding: 20px;
                        }
                        .heatmap-container {
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .heatmap-header {
                            font-size: 24px;
                            margin-bottom: 20px;
                            color: var(--vscode-textLink-foreground);
                        }
                        .heatmap {
                            position: relative;
                            width: ${width}px;
                            height: ${height}px;
                            margin: 20px 0;
                        }
                        .heatmap-cell {
                            position: absolute;
                            width: ${cellSize}px;
                            height: ${cellSize}px;
                            border-radius: 2px;
                        }
                        .heatmap-legend {
                            margin-top: 20px;
                            padding: 10px;
                            border: 1px solid var(--vscode-panel-border);
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="heatmap-container">
                        <div class="heatmap-header">Activity Heatmap</div>
                        <div class="heatmap">
                            ${cells.map(cell => `
                                <div class="heatmap-cell" style="
                                    left: ${cell.x * (cellSize + padding)}px;
                                    top: ${cell.y * (cellSize + padding)}px;
                                    background-color: ${this.getHeatColor(cell.value, metadata.range[0], metadata.range[1])};
                                " title="${metadata.metric}: ${cell.value}"></div>
                            `).join('')}
                        </div>
                        <div class="heatmap-legend">
                            <div>Metric: ${metadata.metric}</div>
                            <div>Range: ${metadata.range[0]} - ${metadata.range[1]}</div>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    private getHeatColor(value: number, min: number, max: number): string {
        const ratio = (value - min) / (max - min);
        const hue = ((1 - ratio) * 240).toString(10);
        return `hsl(${hue}, 70%, 50%)`;
    }
} 
export interface ExtensionSettings {
    enableAIAnalysis: boolean;
    maxChangesToTrack: number;
    contextCacheLifetime: number;
    visualizationDefaults: VisualizationSettings;
    autoSaveInterval: number;
}

export interface VisualizationSettings {
    defaultView: 'graph' | 'timeline' | 'heatmap';
    colorScheme: string;
    animationDuration: number;
    maxDataPoints: number;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
    enableAIAnalysis: true,
    maxChangesToTrack: 1000,
    contextCacheLifetime: 5 * 60 * 1000, // 5 minutes
    visualizationDefaults: {
        defaultView: 'timeline',
        colorScheme: 'viridis',
        animationDuration: 300,
        maxDataPoints: 100
    },
    autoSaveInterval: 30000 // 30 seconds
};

export function loadSettings(): ExtensionSettings {
    // In a real implementation, this would load from VS Code's settings
    return DEFAULT_SETTINGS;
}

export function validateSettings(settings: Partial<ExtensionSettings>): ExtensionSettings {
    return {
        ...DEFAULT_SETTINGS,
        ...settings,
        visualizationDefaults: {
            ...DEFAULT_SETTINGS.visualizationDefaults,
            ...settings.visualizationDefaults
        }
    };
} 
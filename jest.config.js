module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: 'tsconfig.json'
        }]
    },
    testMatch: ['**/test/**/*.test.ts'],
    moduleNameMapper: {
        '^vscode$': '<rootDir>/src/test/mocks/vscode.ts'
    },
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    }
}; 
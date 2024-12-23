# Cursor's Built-in Linting Guide

## Overview

Cursor provides built-in linting for multiple languages through its integration with language servers and linting tools. Here's how it works for different file types.

## TypeScript/JavaScript Linting

### Language Server Protocol (LSP)

Cursor uses the TypeScript Language Server which provides:

- Real-time type checking
- Code completion
- Error detection
- Quick fixes

\`\`\`typescript
// Example with type errors
const x: string = 123; // TypeScript will flag this
\`\`\`

### ESLint Integration

ESLint runs alongside TypeScript for style and best practices:

\`\`\`javascript
// ESLint will flag issues like:
if(foo){console.log(foo)} // Missing spaces, braces
\`\`\`

## JSON Linting

JSON validation happens through:

1. Built-in JSON parser
2. Schema validation
3. Format checking

\`\`\`json
{
  "invalid": 'single quotes',  // Will be flagged
  trailing-comma: true         // Will be flagged
}
\`\`\`

## How Cursor Implements Linting

### 1. Language Server Architecture

\`\`\`typescript
interface LintingProvider {
  provideLinting(document: TextDocument): Promise<Diagnostic[]>;
  fixLintingIssue(diagnostic: Diagnostic): Promise<WorkspaceEdit>;
}
\`\`\`

### 2. Real-time Processing

- Document changes trigger linting
- Results appear in:
  - Problems panel
  - Inline squiggles
  - Status bar

### 3. Configuration Integration

Cursor respects:
- Project-level config files
- User settings
- Workspace settings

Example \`.eslintrc.json\`:
\`\`\`json
{
  "extends": ["eslint:recommended"],
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"]
  }
}
\`\`\`

## Linting Flow

1. File opened/modified
2. Language server activated
3. Linting rules applied
4. Diagnostics generated
5. UI updated
6. Quick fixes offered

## Language-Specific Features

### TypeScript
- Type checking
- Interface validation
- Module resolution
- Import validation

### JavaScript
- Syntax validation
- Best practices
- Style consistency
- Common error detection

### JSON
- Schema validation
- Syntax checking
- Format validation
- Reference resolution

## Integration with AI Features

Cursor's AI capabilities enhance linting by:

1. **Context-Aware Fixes**
   - Understanding code intent
   - Suggesting improvements
   - Learning from patterns

2. **Intelligent Refactoring**
   - Code structure analysis
   - Pattern recognition
   - Best practice application

## Best Practices

### 1. Configuration

- Use project-specific configs
- Maintain consistent rules
- Document exceptions
- Regular updates

### 2. Workflow

- Address issues early
- Use quick fixes when appropriate
- Review auto-fixes
- Maintain clean git history

### 3. Team Collaboration

- Share configurations
- Document standards
- Regular lint reviews
- Automated checks

## Common Issues and Solutions

### 1. Configuration Conflicts

Problem:
\`\`\`typescript
// ESLint and TypeScript rules conflict
const foo = "double quotes" // ESLint wants single
\`\`\`

Solution:
\`\`\`json
{
  "rules": {
    "quotes": ["error", "double"]
  }
}
\`\`\`

### 2. Performance Impact

- Large files
- Complex rules
- Many open files
- Real-time validation

Solutions:
- Selective linting
- Rule optimization
- Background processing
- Cache utilization

## Future Improvements

1. **Enhanced Integration**
   - More language support
   - Custom rule creation
   - Performance optimization

2. **AI Enhancements**
   - Pattern learning
   - Context understanding
   - Automated fixes

3. **Team Features**
   - Shared configurations
   - Statistics tracking
   - Compliance reporting

## Resources

- [TypeScript Language Server](https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [JSON Schema](https://json-schema.org/)
- Cursor Documentation

## Conclusion

Cursor's built-in linting provides:
- Real-time validation
- Multiple language support
- Intelligent fixes
- Team collaboration tools

This creates a robust development environment that catches issues early and maintains code quality. 
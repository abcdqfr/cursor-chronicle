# Contributing to Cursor Chronicle

First off, thank you for considering contributing to Cursor Chronicle! It's people like you that make Cursor Chronicle such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript styleguide
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

1. Fork the repo
2. Create a new branch
3. Make your changes
4. Run the tests
5. Push to your fork
6. Submit a Pull Request

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/<your-username>/cursor-chronicle.git

# Install dependencies
npm install

# Run tests
npm test

# Watch mode
npm run watch
```

### Project Structure

```
cursor-chronicle/
├── src/                    # Source code
│   ├── ai/                # AI analysis components
│   ├── state/             # State management
│   ├── ui/                # UI components
│   ├── integration/       # Integration components
│   └── test/             # Tests
├── docs/                  # Documentation
└── package.json          # Project manifest
```

### Coding Style

* Use TypeScript
* Follow the existing code style
* Use meaningful variable names
* Write descriptive commit messages
* Add comments for complex logic
* Include JSDoc comments for public APIs

### Testing

* Write unit tests for new code
* Ensure all tests pass before submitting PR
* Include integration tests where appropriate
* Test edge cases
* Mock external dependencies

### Documentation

* Update README.md if needed
* Add JSDoc comments for new functions
* Update CHANGELOG.md
* Include code examples where appropriate

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a new release on GitHub
4. Publish to VS Code Marketplace

## Questions?

Feel free to open an issue with your question. 
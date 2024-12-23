# Cursor Chronicle

A powerful markdown linting and formatting extension for VS Code with intelligent auto-fix capabilities and context-aware validation.

## Features

- Context-aware markdown validation
- Intelligent auto-fix capabilities
- Code block language inference
- Heading hierarchy validation
- List formatting standardization
- Customizable line length limits
- Quick fixes on tab press
- Comprehensive test coverage

## Installation

1. Install from VS Code marketplace or download the VSIX file from the latest release
2. Enable the extension for markdown files
3. Configure settings as needed

## Usage

### Commands

- `Alt + Shift + F`: Fix all markdown issues in the current file
- `Alt + .`: Fix markdown issues in the current line
- `Tab`: Trigger quick fix at cursor position

### Configuration

```json
{
  "markdownlint.autofix.enable": true,
  "markdownlint.autofix.onSave": true,
  "markdownlint.autofix.onTab": true
}
```

## Development

### Prerequisites

- Node.js >= 16.0.0
- VS Code >= 1.73.0

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build extension
npm run build

# Run development version
npm run dev
```

### Project Structure

```
.
├── src/                 # Source code
├── tools/              # Development tools
│   └── linting/        # Linting tools
├── config/             # Configuration files
└── docs/              # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [markdownlint](https://github.com/DavidAnson/markdownlint)
- Inspired by various markdown tools and extensions
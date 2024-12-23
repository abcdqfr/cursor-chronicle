# Repository Structure: Development & Production

## Overview

The repository will be structured to support both development and production use, with the unique challenge of being used within its own development environment (Cursor).

## Repository Layout

\`\`\`
cursor-tooling/
├── src/                      # Source code
│   ├── linting/             # Linting tools
│   │   ├── markdown/        # Markdown specific tools
│   │   ├── typescript/      # TypeScript tools
│   │   └── shared/          # Shared utilities
│   ├── state/              # State management
│   └── ide/                # IDE integration
├── dist/                   # Production builds
│   ├── stable/            # Stable releases
│   └── nightly/           # Nightly builds
├── tests/                 # Test suites
│   ├── unit/
│   ├── integration/
│   └── production/        # Tests in live IDE
├── scripts/               # Build & deployment
│   ├── build.js
│   ├── deploy.js
│   └── symlink.js
├── config/               # Configuration
│   ├── development/
│   └── production/
└── .cursor/             # Cursor-specific
    ├── extensions/      # Local extension testing
    └── workspace/       # Development workspace
\`\`\`

## Symlink Strategy

### Development Mode

\`\`\`bash
~/.cursor/
├── tools/              # Symlinked from dist/stable
├── config/            # Symlinked from dist/stable
└── extensions/        # Symlinked from dist/stable
\`\`\`

### Production Mode

\`\`\`bash
$CURSOR_INSTALL_DIR/
├── tools/            # Installed from dist/stable
├── config/          # Installed from dist/stable
└── extensions/      # Installed from dist/stable
\`\`\`

## Build Pipeline

1. **Development**:

   ```bash
   src/ → build → dist/nightly → ~/.cursor/tools
   ```

2. **Testing**:

   ```bash
   dist/nightly → test → dist/stable
   ```

3. **Production**:

   ```bash
   dist/stable → package → $CURSOR_INSTALL_DIR
   ```

## Version Control Strategy

### Branches

- \`main\`: Production-ready code
- \`develop\`: Development branch
- \`feature/*\`: Feature branches
- \`release/*\`: Release preparation
- \`hotfix/*\`: Production fixes

### Tags

- \`stable-X.Y.Z\`: Stable releases
- \`nightly-YYYYMMDD\`: Nightly builds

## Testing Layers

### 1. Development Testing

- Unit tests
- Integration tests
- Local IDE testing

### 2. Production Testing

- Live IDE testing
- Performance monitoring
- Error tracking

### 3. Self-hosted Testing

- Dogfooding in development
- Real-time validation
- Feedback loop

## Deployment Strategy

### 1. Local Development

\`\`\`bash
npm run dev  # Builds and symlinks to ~/.cursor
\`\`\`

### 2. Nightly Builds

\`\`\`bash
npm run build:nightly
npm run test:nightly
npm run deploy:nightly
\`\`\`

### 3. Stable Releases

\`\`\`bash
npm run build:stable
npm run test:stable
npm run deploy:stable
\`\`\`

## Implementation Plan

1. **Phase 1: Repository Setup**
   - Create repository structure
   - Set up build pipeline
   - Configure version control

2. **Phase 2: Development Environment**
   - Implement symlink system
   - Set up testing framework
   - Create development tools

3. **Phase 3: Production Pipeline**
   - Build release system
   - Implement deployment
   - Set up monitoring

4. **Phase 4: Integration**
   - IDE integration
   - Self-hosting setup
   - Production testing

## Next Steps

1. Create new repository with structure
2. Migrate current tools
3. Set up build pipeline
4. Implement symlink system

Would you like me to proceed with any of these steps?

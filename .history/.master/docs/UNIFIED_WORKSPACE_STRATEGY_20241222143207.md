# Unified Workspace Strategy: The ~/cursor Hub

## Core Concept 🎯

The `~/cursor` directory serves as a centralized hub for all workspace-related content, with a flat, intuitive structure
that maximizes discoverability and simplifies maintenance.

## Directory Structure 📁

```
~/cursor/
├── config/                    # All configurations
│   ├── development/          # Development-specific configs
│   ├── production/           # Production-specific configs
│   ├── linting/             # Linting rules and configs
│   └── ide/                 # IDE-specific settings
├── tools/                    # Development tools
│   ├── scripts/             # Automation scripts
│   ├── linting/             # Linting tools with auto-fix
│   └── formatting/          # Code formatters
├── state/                    # Workspace state tracking
│   └── current/             # Active state files
├── docs/                     # Central documentation
├── resources/                # Shared resources
│   ├── templates/           # Project templates
│   ├── assets/             # Shared assets
│   └── scripts/            # Utility scripts
└── projects/                # Individual project directories
    ├── project-a/          # Symlinked to actual project
    ├── project-b/          # Symlinked to actual project
    └── cursor-chronicle/   # Current project
```

## Implementation Strategy 🛠️

### 1. Workspace Configuration

Each project maintains its own `.vscode/settings.json`:

```json
{
  "workspace.rootPath": "~/cursor",
  "files.watcherExclude": {
    "**/projects/**": true,
    "!**/projects/current-project/**": false
  },
  "search.exclude": {
    "**/projects/**": true,
    "!**/projects/current-project/**": false
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.markdownlint": true
  }
}
```

### 2. Symlink Strategy

#### Core Principle

- All shared resources live directly in `~/cursor`
- Projects reference through relative symlinks
- Project-specific overrides stay in project directories

#### Implementation

```bash
# From project directory
ln -s ~/cursor/config/linting/.markdownlint.json .markdownlint.json
ln -s ~/cursor/config/development/jest.config.js jest.config.js
```

### 3. Enhanced Linting Features 🔍

#### Auto-Fix Implementation

```typescript
interface LinterAutoFix {
  fixes: {
    missingNewlines: {
      detect: RegExp;
      fix: (content: string) => string;
      trigger: 'onSave' | 'onType' | 'manual';
    };
    inconsistentIndentation: {
      detect: RegExp;
      fix: (content: string) => string;
      trigger: 'onSave';
    };
    trailingSpaces: {
      detect: RegExp;
      fix: (content: string) => string;
      trigger: 'onSave';
    };
  };
  
  integration: {
    vscode: {
      commands: ['fixAll', 'fixLine', 'fixDocument'];
      keybindings: {
        'cmd+shift+f': 'fixDocument';
        'cmd+.': 'fixLine';
      };
    };
    cli: {
      commands: ['lint:fix', 'lint:check'];
      options: ['--fix-newlines', '--fix-indent', '--fix-all'];
    };
  };
}
```

#### Quick Fix Features

1. **Newline Fixes**
   - Auto-detect missing newlines
   - Add newlines between sections
   - Ensure EOF newline

2. **Indentation Fixes**
   - Standardize indentation
   - Convert spaces/tabs
   - Fix list alignment

3. **Content Cleanup**
   - Remove trailing spaces
   - Fix heading levels
   - Standardize list markers

## Benefits 🌟

1. **Simplified Structure**
   - Flat directory hierarchy
   - Intuitive resource location
   - Direct access to tools and configs

2. **Enhanced Tooling**
   - Auto-fix capabilities
   - Quick-fix suggestions
   - Integrated IDE support

## Implementation Guidelines 📝

### 1. New Project Setup

```bash
# 1. Create project directory
mkdir -p ~/projects/new-project

# 2. Initialize project
cd ~/projects/new-project
git init

# 3. Create symlink in cursor directory
ln -s ~/projects/new-project ~/cursor/projects/new-project

# 4. Link shared configurations
./cursor/tools/scripts/init-project.sh
```

### 2. Configuration Management

1. **Global Configs**
   - Store in `~/cursor/.master/config`
   - Use template variables for project-specific values

2. **Local Overrides**
   - Keep in project's `.vscode` directory
   - Only override necessary settings

### 3. Resource Sharing

1. **Templates**
   - Store in `~/cursor/resources/templates`
   - Use for new file/project bootstrapping

2. **Scripts**
   - Keep in `~/cursor/resources/scripts`
   - Symlink to project's `scripts` directory

## Security Considerations 🔒

1. **Access Control**
   - Restrict `.master` directory permissions
   - Use proper gitignore patterns
   - Separate sensitive configurations

2. **Data Protection**
   - No PII in shared configurations
   - Secure credential management
   - Project-specific secrets stay in projects

## Migration Guide 🚀

### Phase 1: Setup

1. Create `~/cursor` directory structure
2. Move shared configurations to `.master`
3. Setup initial symlinks

### Phase 2: Project Migration

1. Update existing projects one at a time
2. Verify symlinks and configurations
3. Test workspace settings

### Phase 3: Validation

1. Run all test suites
2. Verify IDE functionality
3. Check resource accessibility

## Maintenance Procedures 🔧

1. **Regular Tasks**
   - Update shared configurations
   - Clean unused resources
   - Verify symlink integrity

2. **Project Archival**
   - Move to archived state
   - Preserve project-specific configs
   - Update workspace registry

3. **Updates and Patches**
   - Test in isolated environment
   - Roll out systematically
   - Maintain change log

## Troubleshooting 🔍

### Common Issues

1. **Broken Symlinks**

   ```bash
   # Fix broken symlinks
   find ~/cursor/projects -type l -! -exec test -e {} \; -print
   ```

2. **Permission Issues**

   ```bash
   # Fix permissions
   chmod -R u+rw ~/cursor/.master
   ```

3. **IDE Integration**
   - Reload window after config changes
   - Clear workspace cache if needed
   - Verify extension settings

## Future Considerations 🔮

1. **Scalability**
   - Monitor resource usage
   - Optimize shared configurations
   - Plan for growing number of projects

2. **Automation**
   - Develop more helper scripts
   - Automate routine maintenance
   - Improve project bootstrapping

3. **Integration**
   - Support for new IDE features
   - Enhanced state management
   - Improved resource sharing

## Conclusion 🎯

This unified workspace strategy using `~/cursor` as a central hub provides a robust, maintainable, and efficient development environment. By carefully managing symlinks and configurations, we maintain project independence while leveraging shared resources and tools effectively.

## Linter Integration Guide 🔧

### 1. VSCode Integration

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.markdownlint": true
  },
  "markdownlint.config": {
    "MD041": false,
    "MD013": false
  },
  "markdownlint.run": "onSave"
}
```

### 2. CLI Usage

```bash
# Auto-fix all markdown files
cursor-lint --fix **/*.md

# Check and suggest fixes
cursor-lint --suggest **/*.md

# Fix specific issues
cursor-lint --fix-newlines --fix-indent file.md
```

### 3. Git Hook Integration

```bash
#!/bin/sh
# .git/hooks/pre-commit
cursor-lint --fix $(git diff --cached --name-only | grep '.md$')
```

# Master Workspace Linking Script

## Purpose
This script creates a flexible symlink between a project and the master workspace directory, ensuring consistent project structure and state tracking.

## Usage

### Basic Usage
```bash
./link_master.sh
```

### Custom Workspace Root
You can specify a custom workspace root by setting the `CURSOR_WORKSPACE` environment variable:

```bash
CURSOR_WORKSPACE=/path/to/your/workspace ./link_master.sh
```

## Features
- Dynamically detects project and master directories
- Creates essential subdirectories
- Initializes a project state tracking file
- Ensures proper permissions

## Environment Variables
- `CURSOR_WORKSPACE`: Root directory of the cursor workspace (default: `$HOME/cursor`)

## Project State Tracking
The script creates a `project_state.yaml` file with:
- Project metadata
- Migration metrics
- Technical decision tracking
- Research area documentation

## Best Practices
1. Run this script when setting up a new project
2. Update `project_state.yaml` after significant changes
3. Use environment variables for flexibility across different environments

## Troubleshooting
- Ensure you have read/write permissions in the workspace
- Verify the master directory exists
- Check that the project directory is accessible 
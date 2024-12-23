#!/bin/bash

# Determine the root cursor workspace directory
CURSOR_ROOT="${CURSOR_WORKSPACE:-$HOME/cursor}"

# Master directory path
MASTER_DIR="${CURSOR_ROOT}/.master"

# Detect the current project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Validate directories
if [ ! -d "$CURSOR_ROOT" ]; then
    echo "Cursor workspace root not found: $CURSOR_ROOT"
    exit 1
fi

if [ ! -d "$MASTER_DIR" ]; then
    echo "Master directory not found: $MASTER_DIR"
    exit 1
fi

# Remove existing symlink if it exists
if [ -L "$PROJECT_DIR/.master" ]; then
    unlink "$PROJECT_DIR/.master"
fi

# Create new symlink
ln -s "$MASTER_DIR" "$PROJECT_DIR/.master"

# Ensure proper permissions
chmod 755 "$PROJECT_DIR/.master"

# Create essential subdirectories if they don't exist
mkdir -p "$PROJECT_DIR/.master/state/current"
mkdir -p "$PROJECT_DIR/.master/research"
mkdir -p "$PROJECT_DIR/.master/knowledge"

# Initialize project state file if it doesn't exist
STATE_FILE="$PROJECT_DIR/.master/state/current/project_state.yaml"
if [ ! -f "$STATE_FILE" ]; then
    cat > "$STATE_FILE" << EOL
project_name: cursor-chronicle
version: 0.1.0
status: in_development
last_updated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
migration_metrics:
  completion_percentage: 0
  active_tasks: []
  blocked_tasks: []
technical_decisions: []
research_areas: []
EOL
fi

echo "Symlink and project structure created successfully:"
echo "- Master Directory: $MASTER_DIR"
echo "- Project Directory: $PROJECT_DIR"
echo "- Project State File: $STATE_FILE" 
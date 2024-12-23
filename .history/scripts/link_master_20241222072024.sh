#!/bin/bash

MASTER_DIR="/home/brandon/cursor/.master"
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Check if master directory exists
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

echo "Symlink created successfully from $PROJECT_DIR to $MASTER_DIR" 
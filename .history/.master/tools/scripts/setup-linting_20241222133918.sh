#!/bin/bash

# Define paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MASTER_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
CONFIG_DIR="$MASTER_DIR/config"
TOOLS_DIR="$MASTER_DIR/tools"
HOME_CONFIG="$HOME/.config/cursor"

# Create global config directory
mkdir -p "$HOME_CONFIG/"{linting,formatting,ide}

# Copy configurations
cp "$CONFIG_DIR/linting/markdownlint.json" "$HOME_CONFIG/linting/"
cp "$CONFIG_DIR/ide/vscode-settings.json" "$HOME_CONFIG/ide/"

# Create symlinks for tools
mkdir -p "$HOME_CONFIG/tools/linting"
ln -sf "$TOOLS_DIR/linting/validate-markdown.js" "$HOME_CONFIG/tools/linting/"

# Update VS Code settings to use global config
VSCODE_USER_SETTINGS="$HOME/.config/Code/User/settings.json"
if [ -f "$VSCODE_USER_SETTINGS" ]; then
    # Backup existing settings
    cp "$VSCODE_USER_SETTINGS" "$VSCODE_USER_SETTINGS.backup"
    
    # Merge new settings
    jq -s '.[0] * .[1]' "$VSCODE_USER_SETTINGS" "$CONFIG_DIR/ide/vscode-settings.json" > "$VSCODE_USER_SETTINGS.tmp"
    mv "$VSCODE_USER_SETTINGS.tmp" "$VSCODE_USER_SETTINGS"
else
    # Create new settings file
    cp "$CONFIG_DIR/ide/vscode-settings.json" "$VSCODE_USER_SETTINGS"
fi

# Install required VS Code extensions
code --install-extension DavidAnson.vscode-markdownlint
code --install-extension esbenp.prettier-vscode

echo "Global linting configuration installed successfully!"
echo "Configuration files located at: $HOME_CONFIG"
echo "VS Code settings updated at: $VSCODE_USER_SETTINGS" 
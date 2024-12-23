#!/bin/bash

# Detect project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
STATE_FILE="$PROJECT_DIR/.master/state/current/project_state.yaml"

# Check if state file exists
if [ ! -f "$STATE_FILE" ]; then
    echo "Project state file not found. Run link_master.sh first."
    exit 1
fi

# Function to update YAML file
update_yaml() {
    local key="$1"
    local value="$2"
    local file="$3"
    
    # Use yq if available, otherwise fallback to sed (less robust)
    if command -v yq &> /dev/null; then
        yq e "$key = $value" -i "$file"
    else
        sed -i "s|$key:.*|$key: $value|g" "$file"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --completion)
            update_yaml "migration_metrics.completion_percentage" "$2" "$STATE_FILE"
            shift 2
            ;;
        --status)
            update_yaml "project_metadata.status" "\"$2\"" "$STATE_FILE"
            shift 2
            ;;
        --add-task)
            # Append a task to active tasks
            yq e ".migration_metrics.active_tasks += [\"$2\"]" -i "$STATE_FILE"
            shift 2
            ;;
        --add-decision)
            # Add a technical decision
            yq e ".technical_decisions += [{\"description\": \"$2\", \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}]" -i "$STATE_FILE"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Update last updated timestamp
update_yaml "project_metadata.last_updated" "\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" "$STATE_FILE"

echo "Project state updated successfully."
echo "Updated state file: $STATE_FILE" 
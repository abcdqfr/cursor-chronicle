#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

// Configuration
const config = {
  templatesDir: path.join(
    os.homedir(),
    "cursor/resources/templates/workspaces"
  ),
  projectsDir: path.join(os.homedir(), "cursor/projects"),
  workspaceTypes: ["extension", "application", "library"],
};

/**
 * Determines the project type based on package.json or directory structure
 */
function detectProjectType(projectPath) {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(projectPath, "package.json"), "utf8")
    );

    if (packageJson.engines?.vscode) return "extension";
    if (packageJson.private === true) return "application";
    return "library";
  } catch (error) {
    // Default to application if can't determine
    return "application";
  }
}

/**
 * Creates a workspace file for a project
 */
function createWorkspaceFile(projectPath, type) {
  const templatePath = path.join(config.templatesDir, `${type}.code-workspace`);
  const projectName = path.basename(projectPath);
  const workspacePath = path.join(projectPath, `${projectName}.code-workspace`);

  // Read and customize template
  let content = fs.readFileSync(templatePath, "utf8");
  content = content.replace(
    /Current (Extension|Application|Library)/g,
    projectName
  );

  // Write workspace file
  fs.writeFileSync(workspacePath, content);
  console.log(`✅ Created workspace file: ${workspacePath}`);

  // Create .vscode/settings.json link
  const vscodePath = path.join(projectPath, ".vscode");
  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath, { recursive: true });
  }

  const settingsPath = path.join(vscodePath, "settings.json");
  const workspaceSettings = JSON.parse(content).settings;
  fs.writeFileSync(settingsPath, JSON.stringify(workspaceSettings, null, 2));
  console.log(`✅ Created settings file: ${settingsPath}`);
}

/**
 * Initializes workspace files for all projects
 */
function initializeAllProjects() {
  const projects = fs.readdirSync(config.projectsDir);

  projects.forEach((project) => {
    const projectPath = path.join(config.projectsDir, project);
    if (fs.statSync(projectPath).isDirectory()) {
      const type = detectProjectType(projectPath);
      createWorkspaceFile(projectPath, type);
    }
  });
}

/**
 * Watches for new projects and initializes them
 */
function watchProjects() {
  console.log(`👀 Watching for new projects in ${config.projectsDir}...`);

  fs.watch(config.projectsDir, (eventType, filename) => {
    if (eventType === "rename") {
      const projectPath = path.join(config.projectsDir, filename);
      if (
        fs.existsSync(projectPath) &&
        fs.statSync(projectPath).isDirectory()
      ) {
        const type = detectProjectType(projectPath);
        createWorkspaceFile(projectPath, type);
      }
    }
  });
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const shouldWatch = args.includes("--watch");

  console.log("🚀 Initializing workspace files...\n");

  // Initialize existing projects
  initializeAllProjects();

  // Watch for new projects if requested
  if (shouldWatch) {
    watchProjects();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createWorkspaceFile,
  detectProjectType,
  initializeAllProjects,
};

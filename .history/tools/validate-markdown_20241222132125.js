const markdownlint = require("markdownlint");
const fs = require("fs");
const path = require("path");

/**
 * Validates markdown content against our rules
 * @param {string} content - The markdown content to validate
 * @returns {Promise<{valid: boolean, errors: Array<string>}>}
 */
async function validateMarkdown(content) {
  const configFile = path.join(__dirname, "../.markdownlint.json");
  const config = JSON.parse(fs.readFileSync(configFile, "utf8"));

  return new Promise((resolve) => {
    markdownlint(
      {
        strings: {
          content: content,
        },
        config,
      },
      (err, result) => {
        if (err) {
          resolve({
            valid: false,
            errors: [err.toString()],
          });
          return;
        }

        const errors = result.content || [];
        resolve({
          valid: errors.length === 0,
          errors: errors.map(
            (error) =>
              `${error.ruleDescription} [${error.lineNumber}:${
                error.errorRange?.[0] || 0
              }]`
          ),
        });
      }
    );
  });
}

/**
 * Fixes common markdown issues
 * @param {string} content - The markdown content to fix
 * @returns {string} - The fixed content
 */
function autoFixMarkdown(content) {
  // Split into lines for processing
  let lines = content.split("\n");

  // Fix heading formatting
  lines = lines.map((line, i) => {
    // Fix heading syntax
    if (line.match(/^#+[^s]/)) {
      line = line.replace(/^(#+)/, "$1 ");
    }

    if (line.match(/^#+\s/)) {
      // Remove trailing punctuation
      line = line.replace(/[.,:;!]$/, "");

      // Ensure blank line before (if not first line)
      if (i > 0 && lines[i - 1] !== "") {
        lines.splice(i, 0, "");
      }
      // Ensure blank line after
      if (i < lines.length - 1 && lines[i + 1] !== "") {
        lines.splice(i + 1, 0, "");
      }
    }
    return line;
  });

  // Fix list formatting
  lines = lines.map((line, i) => {
    // Standardize list markers
    if (line.match(/^[*+-]\s/)) {
      line = line.replace(/^[*+]\s/, "- ");

      // Add blank line before first list item
      if (i > 0 && !lines[i - 1].match(/^[*+-]\s/) && lines[i - 1] !== "") {
        lines.splice(i, 0, "");
      }
      // Add blank line after last list item
      if (
        i < lines.length - 1 &&
        !lines[i + 1].match(/^[*+-]\s/) &&
        lines[i + 1] !== ""
      ) {
        lines.splice(i + 1, 0, "");
      }
    }
    return line;
  });

  // Fix code block formatting
  lines = lines.map((line, i) => {
    if (line.match(/^```\s*$/)) {
      // Add language specifier if missing
      line = "```text";
    }
    if (line.match(/^```/)) {
      // Ensure blank line before opening fence
      if (i > 0 && lines[i - 1] !== "") {
        lines.splice(i, 0, "");
      }
      // Ensure blank line after closing fence
      if (line === "```text" && i < lines.length - 1 && lines[i + 1] !== "") {
        lines.splice(i + 1, 0, "");
      }
    }
    return line;
  });

  // Remove multiple consecutive blank lines
  lines = lines.reduce((acc, line) => {
    if (line === "" && acc[acc.length - 1] === "") {
      return acc;
    }
    acc.push(line);
    return acc;
  }, []);

  // Ensure first line is a top-level heading if missing
  if (!lines[0]?.match(/^#\s/)) {
    lines.unshift("# Document");
    lines.unshift("");
  }

  // Ensure single trailing newline
  return lines.join("\n").trim() + "\n";
}

module.exports = {
  validateMarkdown,
  autoFixMarkdown,
};

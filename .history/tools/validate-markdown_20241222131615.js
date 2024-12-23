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
  // Add blank lines around headings
  content = content.replace(/^(#+\s.*$)/gm, "\n$1\n");

  // Add blank lines around code blocks
  content = content.replace(/^(```.*$)/gm, "\n$1");
  content = content.replace(/^(```)$/gm, "$1\n");

  // Add blank lines around lists
  content = content.replace(/^([*-]\s.*$)/gm, "\n$1");

  // Remove trailing punctuation from headings
  content = content.replace(/^(#+\s.*?)[.,:;!]$/gm, "$1");

  // Ensure single trailing newline
  content = content.trim() + "\n";

  return content;
}

module.exports = {
  validateMarkdown,
  autoFixMarkdown,
};

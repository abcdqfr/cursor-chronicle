const markdownlint = require("markdownlint");
const fs = require("fs");
const path = require("path");

/**
 * Tracks document structure for context-aware validation
 */
class DocumentContext {
  constructor() {
    this.headings = [];
    this.lists = [];
    this.codeBlocks = [];
    this.links = [];
    this.currentLevel = 0;
  }

  addHeading(level, text, lineNumber) {
    this.headings.push({ level, text, lineNumber });
    this.currentLevel = level;
  }

  addListItem(marker, text, lineNumber) {
    this.lists.push({ marker, text, lineNumber });
  }

  addCodeBlock(language, content, lineNumber) {
    this.codeBlocks.push({ language, content, lineNumber });
  }

  addLink(text, url, lineNumber) {
    this.links.push({ text, url, lineNumber });
  }

  validateStructure() {
    const errors = [];

    // Validate heading hierarchy
    let lastLevel = 0;
    this.headings.forEach(({ level, text, lineNumber }) => {
      if (level > lastLevel + 1) {
        errors.push(`Skipped heading level ${lastLevel + 1} [${lineNumber}:0]`);
      }
      lastLevel = level;
    });

    // Check for duplicate headings
    const headingTexts = new Map();
    this.headings.forEach(({ text, lineNumber }) => {
      if (headingTexts.has(text)) {
        errors.push(`Duplicate heading "${text}" [${lineNumber}:0]`);
      }
      headingTexts.set(text, lineNumber);
    });

    // Validate list consistency
    let lastMarker = null;
    this.lists.forEach(({ marker, lineNumber }) => {
      if (lastMarker && marker !== lastMarker) {
        errors.push(`Inconsistent list markers [${lineNumber}:0]`);
      }
      lastMarker = marker;
    });

    return errors;
  }
}

/**
 * Validates markdown content against our rules
 * @param {string} content - The markdown content to validate
 * @returns {Promise<{valid: boolean, errors: Array<string>, context: DocumentContext}>}
 */
async function validateMarkdown(content) {
  const configFile = path.join(__dirname, "../.markdownlint.json");
  const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
  const context = new DocumentContext();

  // Build document context
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    const lineNumber = i + 1;

    // Track headings
    const headingMatch = line.match(/^(#+)\s+(.+)$/);
    if (headingMatch) {
      context.addHeading(headingMatch[1].length, headingMatch[2], lineNumber);
    }

    // Track list items
    const listMatch = line.match(/^([*+-])\s+(.+)$/);
    if (listMatch) {
      context.addListItem(listMatch[1], listMatch[2], lineNumber);
    }

    // Track code blocks
    const codeMatch = line.match(/^```(\w*)$/);
    if (codeMatch) {
      context.addCodeBlock(codeMatch[1] || "text", "", lineNumber);
    }

    // Track links
    const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
    for (const match of linkMatches) {
      context.addLink(match[1], match[2], lineNumber);
    }
  });

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
            context,
          });
          return;
        }

        const lintErrors = result.content || [];
        const structureErrors = context.validateStructure();
        const allErrors = [
          ...lintErrors.map(
            (error) =>
              `${error.ruleDescription} [${error.lineNumber}:${
                error.errorRange?.[0] || 0
              }]`
          ),
          ...structureErrors,
        ];

        resolve({
          valid: allErrors.length === 0,
          errors: allErrors,
          context,
        });
      }
    );
  });
}

/**
 * Fixes common markdown issues with context awareness
 * @param {string} content - The markdown content to fix
 * @returns {string} - The fixed content
 */
function autoFixMarkdown(content) {
  // Split into lines for processing
  let lines = content.split("\n");
  const context = new DocumentContext();

  // First pass: build context
  lines.forEach((line, i) => {
    const headingMatch = line.match(/^(#+)\s+(.+)$/);
    if (headingMatch) {
      context.addHeading(headingMatch[1].length, headingMatch[2], i + 1);
    }
  });

  // Second pass: fix issues with context awareness
  lines = lines.map((line, i) => {
    // Fix heading syntax and levels
    if (line.match(/^#+[^s]/)) {
      line = line.replace(/^(#+)/, "$1 ");

      // Check heading level
      const level = line.match(/^(#+)/)[1].length;
      const expectedLevel = context.currentLevel + 1;
      if (level > expectedLevel) {
        line = "#".repeat(expectedLevel) + line.slice(level);
      }
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

    // Fix list formatting with consistent markers
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

    // Fix code block formatting with language inference
    if (line.match(/^```\s*$/)) {
      // Try to infer language from context
      const prevLines = lines.slice(Math.max(0, i - 3), i);
      const langHint = prevLines.find((l) =>
        l.match(
          /\b(javascript|python|typescript|html|css|json|yaml|bash|sh)\b/i
        )
      );
      const lang = langHint
        ? langHint
            .match(
              /\b(javascript|python|typescript|html|css|json|yaml|bash|sh)\b/i
            )[1]
            .toLowerCase()
        : "text";
      line = `\`\`\`${lang}`;
    }
    if (line.match(/^```/)) {
      // Ensure blank line before opening fence
      if (i > 0 && lines[i - 1] !== "") {
        lines.splice(i, 0, "");
      }
      // Ensure blank line after closing fence
      if (
        line.match(/^```\w*$/) &&
        i < lines.length - 1 &&
        lines[i + 1] !== ""
      ) {
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
    // Try to infer document title from content
    const firstHeading = lines.find((l) => l.match(/^#+\s/));
    const title = firstHeading
      ? firstHeading.replace(/^#+\s+/, "").trim()
      : "Document";
    lines.unshift("# " + title);
    lines.unshift("");
  }

  // Ensure single trailing newline
  return lines.join("\n").trim() + "\n";
}

module.exports = {
  validateMarkdown,
  autoFixMarkdown,
  DocumentContext,
};

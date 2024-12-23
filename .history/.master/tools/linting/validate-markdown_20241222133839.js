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
    this.seenHeadings = new Map();
  }

  addHeading(level, text, lineNumber) {
    // Track duplicate headings
    const normalizedText = text.toLowerCase().trim();
    if (this.seenHeadings.has(normalizedText)) {
      this.seenHeadings.get(normalizedText).count++;
    } else {
      this.seenHeadings.set(normalizedText, {
        count: 1,
        firstLine: lineNumber,
      });
    }

    this.headings.push({ level, text: normalizedText, lineNumber });
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
    let lastLevel = 1; // Start at level 1 (h1)
    let hasTopLevel = false;

    this.headings.forEach(({ level, text, lineNumber }) => {
      // Check for multiple top-level headings
      if (level === 1) {
        if (hasTopLevel) {
          errors.push(
            `Multiple top-level headings in the same document [${lineNumber}:0]`
          );
        }
        hasTopLevel = true;
      }

      // Check for skipped levels
      if (level > lastLevel + 1) {
        errors.push(`Skipped heading level ${lastLevel + 1} [${lineNumber}:0]`);
      }
      lastLevel = level;
    });

    // Check for duplicate headings
    this.seenHeadings.forEach((data, text) => {
      if (data.count > 1) {
        errors.push(
          `Duplicate heading "${text}" first used at line ${data.firstLine}`
        );
      }
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

  /**
   * Suggests the appropriate heading level based on context
   */
  suggestHeadingLevel(currentLevel) {
    if (currentLevel === 1) return 1; // Keep h1 as is
    if (this.currentLevel === 0) return 1; // Start with h1 if no context
    return Math.min(this.currentLevel + 1, currentLevel); // Increment by 1 level max
  }

  /**
   * Infers code block language based on content and context
   */
  inferCodeBlockLanguage(content, surroundingLines) {
    // Common language patterns
    const patterns = {
      javascript: /\b(const|let|var|function|=>|async|await|import|export)\b/,
      typescript:
        /\b(interface|type|enum|namespace|readonly|private|public|protected)\b/,
      python: /\b(def|class|import|from|if __name__|print|lambda)\b/,
      html: /<\/?[a-z][\s\S]*>/i,
      css: /[.#][\w-]+\s*{|@media|@import/,
      json: /^[\s]*[{[]/,
      yaml: /^[\s]*[-?:][\s]|^[\s]*[A-Za-z0-9_-]+:/,
      bash: /\b(echo|export|source|sudo|apt|npm|yarn|pnpm)\b/,
      markdown: /^#+\s|^\s*[-*+]\s|\[.*\]\(.*\)/,
    };

    // Check content patterns
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(content)) {
        return lang;
      }
    }

    // Check surrounding context
    const context = surroundingLines.join(" ").toLowerCase();
    for (const lang of Object.keys(patterns)) {
      if (context.includes(lang)) {
        return lang;
      }
    }

    return "text";
  }
}

/**
 * Validates markdown content against our rules
 * @param {string} content - The markdown content to validate
 * @param {string} [configPath] - Optional path to markdownlint config
 * @returns {Promise<{valid: boolean, errors: Array<string>, context: DocumentContext}>}
 */
async function validateMarkdown(content, configPath) {
  const defaultConfigPath = path.join(
    __dirname,
    "../../config/linting/markdownlint.json"
  );
  const configFile = configPath || defaultConfigPath;
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
      // Ensure single space after hash
      line = line.replace(/^(#+)/, "$1 ").replace(/^(#+)\s+/, "$1 ");

      // Fix heading level based on context
      const level = line.match(/^(#+)/)[1].length;
      const suggestedLevel = context.suggestHeadingLevel(level);
      if (level !== suggestedLevel) {
        line = "#".repeat(suggestedLevel) + line.slice(level);
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

    // Fix code block formatting with intelligent language inference
    if (line.match(/^```\s*$/)) {
      // Get surrounding context (3 lines before and after)
      const start = Math.max(0, i - 3);
      const end = Math.min(lines.length, i + 4);
      const surroundingLines = lines.slice(start, end);

      // Get content between code fences
      let codeContent = "";
      for (let j = i + 1; j < lines.length && !lines[j].match(/^```/); j++) {
        codeContent += lines[j] + "\n";
      }

      // Infer language
      const lang = context.inferCodeBlockLanguage(
        codeContent,
        surroundingLines
      );
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

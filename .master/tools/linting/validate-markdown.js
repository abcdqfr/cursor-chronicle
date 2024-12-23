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

  addListItem(marker, text, lineNumber, indentLevel = 0) {
    this.lists.push({ marker, text, lineNumber, indentLevel });
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
 * @returns {Promise<{valid: boolean, errors: Array<string>, context: DocumentContext}>}
 */
async function validateMarkdown(content) {
  const configFile = path.join(__dirname, "../.markdownlint.json");
  const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
  const context = new DocumentContext();

  // Handle empty or whitespace-only content
  if (!content.trim()) {
    return {
      valid: false,
      errors: ["Document is empty or contains only whitespace"],
      context,
    };
  }

  // Build document context
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeBlockContent = "";
  let codeBlockStart = 0;

  // Check for long lines first
  const lineErrors = [];
  lines.forEach((line, i) => {
    if (line.length > 120) {
      lineErrors.push(`Line length exceeds 120 characters [${i + 1}:0]`);
    }
  });

  lines.forEach((line, i) => {
    const lineNumber = i + 1;

    // Handle code blocks
    if (line.match(/^```/)) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockStart = lineNumber;
        const lang = line.slice(3).trim();
        context.addCodeBlock(lang || "text", "", lineNumber);
      } else {
        inCodeBlock = false;
        const block = context.codeBlocks.find(
          (b) => b.lineNumber === codeBlockStart
        );
        if (block) {
          block.content = codeBlockContent;
        }
        codeBlockContent = "";
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent += line + "\n";
      return;
    }

    // Track headings
    const headingMatch = line.match(/^(#+)\s+(.+)$/);
    if (headingMatch) {
      context.addHeading(headingMatch[1].length, headingMatch[2], lineNumber);
    }

    // Track list items
    const listMatch = line.match(/^(\s*)([*+-])\s+(.+)$/);
    if (listMatch) {
      const indentLevel = Math.floor(listMatch[1].length / 2);
      context.addListItem(listMatch[2], listMatch[3], lineNumber, indentLevel);
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
          ...lineErrors,
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
  let inCodeBlock = false;
  let codeBlockContent = "";
  let codeBlockStart = 0;

  lines.forEach((line, i) => {
    if (line.match(/^```/)) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockStart = i + 1;
      } else {
        inCodeBlock = false;
        const block = context.codeBlocks.find(
          (b) => b.lineNumber === codeBlockStart
        );
        if (block) {
          block.content = codeBlockContent;
        }
        codeBlockContent = "";
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent += line + "\n";
      return;
    }

    const headingMatch = line.match(/^(#+)\s+(.+)$/);
    if (headingMatch) {
      context.addHeading(headingMatch[1].length, headingMatch[2], i + 1);
    }
  });

  // Second pass: fix issues with context awareness
  let fixedLines = [];
  inCodeBlock = false;
  codeBlockContent = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

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

    // Handle code blocks
    if (line.match(/^```/)) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = "";
        // Infer language if not specified
        if (line === "```") {
          const nextLines = lines.slice(i + 1, i + 4);
          const language = context.inferCodeBlockLanguage(
            nextLines.join("\n"),
            [lines[i - 1] || "", lines[i + 4] || ""]
          );
          line = "```" + language;
        }
      } else {
        inCodeBlock = false;
        // Add newline after code block if not present
        if (i < lines.length - 1 && lines[i + 1].trim() !== "") {
          fixedLines.push(line, "");
          continue;
        }
      }
    } else if (inCodeBlock) {
      codeBlockContent += line + "\n";
    }

    // Standardize list markers to dashes
    const listMatch = line.match(/^(\s*)([*+])\s+(.+)$/);
    if (listMatch) {
      line = `${listMatch[1]}- ${listMatch[3]}`;
    }

    // Add newlines around headings if missing
    if (line.match(/^#+\s/)) {
      if (i > 0 && fixedLines[fixedLines.length - 1] !== "") {
        fixedLines.push("");
      }
      fixedLines.push(line);
      if (i < lines.length - 1 && lines[i + 1] !== "") {
        fixedLines.push("");
      }
      continue;
    }

    fixedLines.push(line);
  }

  return fixedLines.join("\n");
}

module.exports = {
  validateMarkdown,
  autoFixMarkdown,
};

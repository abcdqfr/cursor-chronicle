#!/usr/bin/env node

const { validateMarkdown, autoFixMarkdown } = require("./validate-markdown");

/**
 * Handles linting of Cursor's markdown output
 * This is designed to be called by Cursor when generating markdown
 */
class CursorOutputLinter {
  constructor() {
    this.pendingValidations = new Map();
  }

  /**
   * Validates and fixes markdown content as it's being generated
   * @param {string} content - The markdown content
   * @param {string} outputId - Unique identifier for this output
   * @param {boolean} isComplete - Whether this is the final output
   * @returns {Promise<{valid: boolean, content: string, errors: string[]}>}
   */
  async validateOutput(content, outputId, isComplete = false) {
    // Store incomplete outputs for context
    if (!isComplete) {
      this.pendingValidations.set(outputId, content);
      return { valid: true, content, errors: [] };
    }

    // Get full context for validation
    const fullContent = this.pendingValidations.get(outputId) || "" + content;
    this.pendingValidations.delete(outputId);

    // Validate and fix
    const result = await validateMarkdown(fullContent);
    if (result.valid) {
      return { valid: true, content: fullContent, errors: [] };
    }

    // Auto-fix if there are issues
    const fixed = autoFixMarkdown(fullContent);
    const checkResult = await validateMarkdown(fixed);

    return {
      valid: checkResult.valid,
      content: fixed,
      errors: checkResult.valid ? [] : checkResult.errors,
    };
  }

  /**
   * Validates markdown without fixing
   * @param {string} content - The markdown content
   * @returns {Promise<{valid: boolean, errors: string[]}>}
   */
  async validateOnly(content) {
    const result = await validateMarkdown(content);
    return {
      valid: result.valid,
      errors: result.valid ? [] : result.errors,
    };
  }

  /**
   * Cleans up any pending validations
   * @param {string} outputId - Unique identifier for the output
   */
  cleanup(outputId) {
    this.pendingValidations.delete(outputId);
  }
}

// Export for use in Cursor's output pipeline
module.exports = {
  CursorOutputLinter,
  // Create singleton instance for Cursor to use
  cursorLinter: new CursorOutputLinter(),
};

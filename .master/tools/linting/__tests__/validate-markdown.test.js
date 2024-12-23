const { validateMarkdown, autoFixMarkdown } = require("../validate-markdown");

describe("Markdown Validation", () => {
  describe("Basic Validation", () => {
    it("should validate correct markdown", async () => {
      const validMd = `# Title\n\n## Section\n\nThis is a paragraph.\n\n- List item 1\n- List item 2\n`;
      const result = await validateMarkdown(validMd);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing newlines", async () => {
      const invalidMd = `# Title\n## Section\nThis is a paragraph.\n- List item 1\n- List item 2`;
      const result = await validateMarkdown(invalidMd);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("newline"))).toBe(true);
    });

    it("should detect inconsistent list markers", async () => {
      const invalidMd = `# Title\n\n## Section\n\n* List item 1\n- List item 2\n+ List item 3\n`;
      const result = await validateMarkdown(invalidMd);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("list markers"))).toBe(true);
    });
  });

  describe("Auto Fix", () => {
    it("should fix missing newlines", () => {
      const input = `# Title\n## Section\nThis is a paragraph.\n- List item 1\n- List item 2`;
      const fixed = autoFixMarkdown(input);
      expect(fixed).toMatch(/# Title\n\n## Section\n\nThis is a paragraph\./);
    });

    it("should standardize list markers", () => {
      const input = `# Title\n\n* Item 1\n+ Item 2\n- Item 3\n`;
      const fixed = autoFixMarkdown(input);
      expect(fixed).toMatch(/- Item 1\n- Item 2\n- Item 3/);
    });

    it("should fix code block formatting", () => {
      const input = `# Title\n\`\`\`\nconst x = 1;\n\`\`\`\nText`;
      const fixed = autoFixMarkdown(input);
      expect(fixed).toMatch(/\`\`\`javascript\n/);
      expect(fixed).toMatch(/\`\`\`\n\n?Text/);
    });
  });

  describe("Context Awareness", () => {
    it("should track document structure", async () => {
      const md = `# Title\n\n## Section 1\n\n### Subsection\n\n## Section 2\n`;
      const result = await validateMarkdown(md);
      expect(result.context.headings).toHaveLength(4);
      expect(result.context.currentLevel).toBe(2);
    });

    it("should detect heading level skips", async () => {
      const md = `# Title\n\n## Section\n\n#### Subsection\n`;
      const result = await validateMarkdown(md);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("Skipped heading level"))
      ).toBe(true);
    });

    it("should track list context", async () => {
      const md = `# Title\n\n- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2\n`;
      const result = await validateMarkdown(md);
      expect(result.context.lists).toHaveLength(4);
    });
  });

  describe("Code Block Analysis", () => {
    it("should infer JavaScript language", () => {
      const input = `# Title\n\n\`\`\`\nconst x = 1;\nfunction test() {}\n\`\`\`\n`;
      const fixed = autoFixMarkdown(input);
      expect(fixed).toMatch(/\`\`\`javascript\n/);
    });

    it("should infer TypeScript language", () => {
      const input = `# Title\n\n\`\`\`\ninterface Test {\n  prop: string;\n}\n\`\`\`\n`;
      const fixed = autoFixMarkdown(input);
      expect(fixed).toMatch(/\`\`\`typescript\n/);
    });

    it("should handle unknown languages", () => {
      const input = `# Title\n\n\`\`\`\nsome random content\n\`\`\`\n`;
      const fixed = autoFixMarkdown(input);
      expect(fixed).toMatch(/\`\`\`text\n/);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty documents", async () => {
      const result = await validateMarkdown("");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("empty"))).toBe(true);
    });

    it("should handle documents with only whitespace", async () => {
      const result = await validateMarkdown("   \n\n   \n");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("empty"))).toBe(true);
    });

    it("should handle very long lines", async () => {
      const longLine = "a".repeat(150);
      const result = await validateMarkdown(`# Title\n\n${longLine}\n`);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes("Line length exceeds 120 characters")
        )
      ).toBe(true);
    });
  });
});

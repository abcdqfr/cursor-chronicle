const { validateMarkdown, autoFixMarkdown } = require("./validate-markdown");

async function runTests() {
  console.log("Testing markdown validation...\n");

  // Test 1: Valid markdown
  const validMd = `# Test Document

## Section 1

This is a paragraph.

- List item 1
- List item 2

\`\`\`javascript
const x = 1;
\`\`\`

## Section 2

Final paragraph.
`;

  const validResult = await validateMarkdown(validMd);
  console.log("Test 1 - Valid markdown:", validResult.valid ? "✅" : "❌");
  if (!validResult.valid) {
    console.log("Errors:", validResult.errors);
  }
  console.log("Context:", {
    headings: validResult.context.headings.length,
    lists: validResult.context.lists.length,
    codeBlocks: validResult.context.codeBlocks.length,
  });

  // Test 2: Invalid markdown with common issues
  const invalidMd = `# Test Document:
## Section 1
This is a paragraph.
- List item 1
- List item 2
\`\`\`javascript
const x = 1;
\`\`\`
## Section 2.
Final paragraph.`;

  const invalidResult = await validateMarkdown(invalidMd);
  console.log(
    "\nTest 2 - Invalid markdown:",
    !invalidResult.valid ? "✅" : "❌"
  );
  if (!invalidResult.valid) {
    console.log("Expected errors:", invalidResult.errors);
  }

  // Test 3: Context-aware validation
  const contextMd = `# Main Title

### Skipped Level

## Back to Level 2

# Main Title

## Repeated Section

- Item 1
* Item 2
+ Item 3

\`\`\`
const code = true;
\`\`\`

Some JavaScript: console.log("test");

\`\`\`
More code
\`\`\`
`;

  console.log("\nTest 3 - Context-aware validation:");
  const contextResult = await validateMarkdown(contextMd);
  console.log("Context validation:", !contextResult.valid ? "✅" : "❌");
  if (!contextResult.valid) {
    console.log("Context errors:", contextResult.errors);
  }

  const fixed = autoFixMarkdown(contextMd);
  const fixedResult = await validateMarkdown(fixed);
  console.log("\nAuto-fixed content valid:", fixedResult.valid ? "✅" : "❌");
  if (!fixedResult.valid) {
    console.log("Remaining errors:", fixedResult.errors);
  }
  console.log("\nFixed content:\n", fixed);

  // Test 4: Edge cases with context
  const edgeCases = `### Starting with H3
# Now H1
## Then H2
#### Skip to H4

- List 1
+ List 2
* List 3

\`\`\`
No language
\`\`\`

const someJs = true;

\`\`\`
More code
\`\`\`
`;

  console.log("\nTest 4 - Edge cases with context:");
  const fixedEdge = autoFixMarkdown(edgeCases);
  const edgeResult = await validateMarkdown(fixedEdge);
  console.log("Fixed edge cases valid:", edgeResult.valid ? "✅" : "❌");
  if (!edgeResult.valid) {
    console.log("Edge case errors:", edgeResult.errors);
  }
  console.log("\nFixed edge cases:\n", fixedEdge);
  console.log("\nContext:", {
    headings: edgeResult.context.headings.length,
    lists: edgeResult.context.lists.length,
    codeBlocks: edgeResult.context.codeBlocks.length,
  });
}

runTests().catch(console.error);

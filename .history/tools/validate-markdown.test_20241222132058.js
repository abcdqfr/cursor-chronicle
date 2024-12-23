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

  // Test 3: Auto-fix with complex cases
  const complexMd = `# Header 1:
Some text
## Header 2.
- Item 1
- Item 2
* Item 3
\`\`\`js
code
\`\`\`
### Header 3;
More text

Extra blank line

## Header 4!
Final text`;

  console.log("\nTest 3 - Auto-fix complex case:");
  const fixed = autoFixMarkdown(complexMd);
  const fixedResult = await validateMarkdown(fixed);
  console.log("Fixed content valid:", fixedResult.valid ? "✅" : "❌");
  if (!fixedResult.valid) {
    console.log("Remaining errors:", fixedResult.errors);
  }
  console.log("\nFixed content:\n", fixed);

  // Test 4: Edge cases
  const edgeCases = `#Not a header
- List
* Mixed
+ markers

\`\`\`
Unclosed code
`;

  console.log("\nTest 4 - Edge cases:");
  const fixedEdge = autoFixMarkdown(edgeCases);
  const edgeResult = await validateMarkdown(fixedEdge);
  console.log("Fixed edge cases valid:", edgeResult.valid ? "✅" : "❌");
  if (!edgeResult.valid) {
    console.log("Edge case errors:", edgeResult.errors);
  }
  console.log("\nFixed edge cases:\n", fixedEdge);
}

runTests().catch(console.error);

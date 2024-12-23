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

  // Test 2: Invalid markdown
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
  console.log("Expected errors:", invalidResult.errors);

  // Test 3: Auto-fix
  console.log("\nTest 3 - Auto-fix:");
  const fixed = autoFixMarkdown(invalidMd);
  const fixedResult = await validateMarkdown(fixed);
  console.log("Fixed content valid:", fixedResult.valid ? "✅" : "❌");
  if (!fixedResult.valid) {
    console.log("Remaining errors:", fixedResult.errors);
  }
  console.log("\nFixed content:\n", fixed);
}

runTests().catch(console.error);

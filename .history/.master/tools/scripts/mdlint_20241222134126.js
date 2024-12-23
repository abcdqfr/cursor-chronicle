#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
  validateMarkdown,
  autoFixMarkdown,
} = require("../linting/validate-markdown");

async function main() {
  const [, , ...args] = process.argv;

  if (args.length === 0) {
    console.error("Usage: mdlint <file> [--fix]");
    process.exit(1);
  }

  const filePath = args[0];
  const shouldFix = args.includes("--fix");

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const result = await validateMarkdown(content);

    if (result.valid) {
      console.log("✅ Document is valid!");
      console.log("\nContext:", {
        headings: result.context.headings.length,
        lists: result.context.lists.length,
        codeBlocks: result.context.codeBlocks.length,
        links: result.context.links.length,
      });
      process.exit(0);
    }

    console.log("❌ Found issues:");
    result.errors.forEach((error) => console.log("-", error));

    if (shouldFix) {
      console.log("\nAttempting to fix issues...");
      const fixed = autoFixMarkdown(content);
      fs.writeFileSync(filePath, fixed);

      const checkResult = await validateMarkdown(fixed);
      if (checkResult.valid) {
        console.log("✅ All issues fixed!");
      } else {
        console.log("⚠️ Some issues require manual attention:");
        checkResult.errors.forEach((error) => console.log("-", error));
      }
    }

    process.exit(result.valid ? 0 : 1);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);

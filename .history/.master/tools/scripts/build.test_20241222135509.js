const fs = require("fs");
const path = require("path");
const { build, clean, compile, copyAssets, config } = require("./build");

// Mock execSync to prevent actual command execution
jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

// Mock fs operations
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  rmSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe("Build Pipeline", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Default mock implementations
    fs.existsSync.mockReturnValue(true);
  });

  describe("clean()", () => {
    it("should clean existing output directory", () => {
      const outDir = "dist/test";
      clean(outDir);

      expect(fs.existsSync).toHaveBeenCalledWith(outDir);
      expect(fs.rmSync).toHaveBeenCalledWith(outDir, {
        recursive: true,
        force: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(outDir, { recursive: true });
    });

    it("should create output directory if it does not exist", () => {
      fs.existsSync.mockReturnValue(false);
      const outDir = "dist/test";
      clean(outDir);

      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalledWith(outDir, { recursive: true });
    });
  });

  describe("compile()", () => {
    it("should compile TypeScript with correct config", () => {
      const { execSync } = require("child_process");
      const tsConfig = "tsconfig.test.json";
      const outDir = "dist/test";

      compile(tsConfig, outDir);

      expect(execSync).toHaveBeenCalledWith(
        `tsc --project ${tsConfig} --outDir ${outDir}`,
        expect.any(Object)
      );
    });
  });

  describe("copyAssets()", () => {
    it("should copy all required assets", () => {
      const { execSync } = require("child_process");
      const outDir = "dist/test";

      copyAssets(outDir);

      // Verify each asset is copied
      const expectedAssets = [
        "package.json",
        "README.md",
        "LICENSE",
        ".markdownlint.json",
        "config/**/*",
        "tools/**/*.js",
        "!tools/**/*.ts",
      ];

      expectedAssets.forEach((asset) => {
        expect(execSync).toHaveBeenCalledWith(
          `cp -r ${asset} ${outDir}/`,
          expect.any(Object)
        );
      });
    });
  });

  describe("build()", () => {
    it("should perform development build correctly", () => {
      const { execSync } = require("child_process");
      build("dev");

      // Verify development-specific configuration
      expect(fs.existsSync).toHaveBeenCalledWith(config.dev.outDir);
      expect(execSync).toHaveBeenCalledWith(
        `tsc --project ${config.dev.tsConfig} --outDir ${config.dev.outDir}`,
        expect.any(Object)
      );
      expect(execSync).toHaveBeenCalledWith(
        "npm run test:dev",
        expect.any(Object)
      );
    });

    it("should perform production build correctly", () => {
      const { execSync } = require("child_process");
      build("prod");

      // Verify production-specific configuration
      expect(fs.existsSync).toHaveBeenCalledWith(config.prod.outDir);
      expect(execSync).toHaveBeenCalledWith(
        `tsc --project ${config.prod.tsConfig} --outDir ${config.prod.outDir}`,
        expect.any(Object)
      );
      expect(execSync).toHaveBeenCalledWith(
        "npm run test:prod",
        expect.any(Object)
      );
    });

    it("should handle build failures gracefully", () => {
      const { execSync } = require("child_process");
      const errorMessage = "Build failed";
      execSync.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Mock console.error and process.exit
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      const processExit = jest.spyOn(process, "exit").mockImplementation();

      build("dev");

      expect(consoleError).toHaveBeenCalledWith(
        "\n❌ Build failed:",
        errorMessage
      );
      expect(processExit).toHaveBeenCalledWith(1);

      // Restore mocks
      consoleError.mockRestore();
      processExit.mockRestore();
    });
  });
});

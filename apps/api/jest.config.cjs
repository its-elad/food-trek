/** @type {import('jest').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  roots: ["<rootDir>/src/tests"],
  // Allow up to 15 minutes – MongoMemoryServer may download the binary on the first run (~600MB).
  // Subsequent runs reuse the cached binary (<10s).
  testTimeout: 900000,
  moduleNameMapper: {
    // Strip .js extensions so ts-jest resolves .ts files
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json", useESM: true }],
  },
};

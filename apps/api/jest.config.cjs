/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  roots: ["<rootDir>/src/tests"],
  // Allow up to 2 minutes – MongoMemoryServer may download the binary on the
  // first run (~600 MB).  Subsequent runs reuse the cached binary (< 10 s).
  testTimeout: 120000,
  moduleNameMapper: {
    // Strip .js extensions so ts-jest resolves .ts files
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
};

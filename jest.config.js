const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");

module.exports = {
  testEnvironment: "node",
  transform: {
    "\\.(ts|tsx)$": "ts-jest",
  },
  setupFiles: ["./test/jestSetup.ts"],
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
};

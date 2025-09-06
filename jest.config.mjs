import { pathsToModuleNameMapper, createDefaultEsmPreset } from "ts-jest";
import ts from "typescript";
const tsConfig = ts.readConfigFile("./tsconfig.json", ts.sys.readFile).config;
import util from "util";
util.inspect.defaultOptions.depth = null;

const presetConfig = createDefaultEsmPreset({});
export default {
  // TODO: figure out why this doesn't work
  snapshotFormat: {
    printBasicPrototype: false,
  },
  testEnvironment: "node",
  ...presetConfig,
  setupFilesAfterEnv: ["./test/jestSetup.ts"],
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
    prefix: "<rootDir>/",
    useESM: true,
  }),
  extensionsToTreatAsEsm: [".ts"],
};

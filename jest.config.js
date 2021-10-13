module.exports = {
  testEnvironment: "node",
  transform: {
    "\\.(ts|tsx)$": "ts-jest",
  },
  setupFiles: ["./test/jestSetup.ts"],
};

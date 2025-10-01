export default {
  $schema: "https://unpkg.com/knip@5/schema.json",
  workspaces: {
    ".": {
      entry: ["server/index.ts"],
      project: [
        "server/**/*.{js,ts}",
        "handlers/**/*.{js,ts}",
        "!packages/**/*",
      ],
    },
    "packages/api-external": {
      entry: ["kubb.config.ts"],
      project: "**/*.ts",
      // This is a template for generated files
      ignore: ["boba-client/client.ts"],
    },
  },
  ignore: ["types/open-api/generated/**/*"],
};

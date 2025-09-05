import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import { pluginClient } from "@kubb/plugin-client";

// Documentation for these plugins can be found at: https://kubb.dev/
export default defineConfig({
  root: ".",
  input: {
    path: "../../open-api/open-api-spec.json",
  },
  output: {
    path: "./generated/",
    clean: true,
    extension: {
      // We need to change the extension to .js because typescript
      // compiler doesn't like it when you import .ts files
      ".ts": ".js",
    },
  },
  plugins: [
    pluginOas({
      // No generator will disable output for this plugin
      // The OAS plugin is needed to generate the types for
      // the other generators, but we don't need to output the
      // OAS file itself.
      generators: [],
    }),
    pluginTs({
      enumType: "literal",
      group: {
        type: "tag",
        name: ({ group }) => {
          return group.replaceAll("/", "");
        },
      },
      output: {
        path: "./boba-api/types",
      },
    }),
    pluginZod({
      output: {
        path: "./boba-api/zod-schemas",
      },
      group: {
        type: "tag",
        name: ({ group }) => {
          return group.replaceAll("/", "");
        },
      },
      transformers: {
        name: (schema) => {
          return schema.charAt(0).toUpperCase() + schema.slice(1);
        },
      },
    }),
    pluginClient({
      output: {
        path: "./boba-client",
        barrelType: "named",
      },
      group: {
        type: "tag",
        name: ({ group }) => {
          return group.replaceAll("/", "");
        },
      },
      operations: true,
      paramsType: "object",
      client: "fetch",
      importPath: "virtual:client",
      parser: "zod",
    }),
  ],
});

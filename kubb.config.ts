import { defineConfig } from "@kubb/core";
import createSwagger from "@kubb/swagger";
import createSwaggerZod from "@kubb/swagger-zod";
import createSwaggerTs from "@kubb/swagger-ts";

export default defineConfig({
  root: ".",
  input: {
    path: "./open-api/open-api-spec.json",
  },
  output: {
    path: "./types/open-api/generated/kubb",
    clean: true,
  },
  plugins: [
    createSwagger({ output: false }),
    createSwaggerZod({
      output: {
        path: "./zod",
      },
      dateType: "date",
      typed: true,
      transformers: {
        name: (name) => {
          return `${name.charAt(0).toUpperCase()}${name.substring(1)}`;
        },
      },
    }),
    createSwaggerTs({
      dateType: "date",
    }),
  ],
});

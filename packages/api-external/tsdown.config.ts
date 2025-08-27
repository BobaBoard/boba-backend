import { defineConfig, type UserConfig } from "tsdown";
import fs from "node:fs/promises";
import { glob } from "glob";
import path from "node:path";

export default defineConfig([
  {
    name: "boba-api",
    entry: [...glob.sync(`./generated/boba-api/**/*.ts`)],
    outputOptions: {
      dir: `./boba-api/dist/`,
    },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    unbundle: true,
  },
  {
    name: "boba-client",
    entry: getClientEntryPoints(),
    outputOptions: {
      dir: `./boba-client/dist/`,
    },
    format: ["esm"],
    dts: true,
    clean: true,
    unbundle: true,
    external: [
      "@bobaboard/boba-api",
      "@bobaboard/boba-api/**",
      "virtual:client",
      "zod",
      "zod/**",
    ],
    async onSuccess() {
      const allFiles = await glob("boba-client/dist/**/*.{ts,mts,js}");

      for (const file of allFiles) {
        await fixImports(file);
      }

      // Remove the generated folder from the output as it only contains the
      // api types and we don't need them in the client.
      await fs.rm("./boba-client/dist/generated", {
        recursive: true,
        force: true,
      });
    },
  },
]);

/**
 * Change imports in client files to use the @bobaboard/boba-api library
 * for the api types, so the same files don't get installed twice by
 * consumers.
 *
 * Also swaps the "virtual:client" import with the local client file,
 * because I couldn't get it to work without this hack.
 */
const IMPORT_REGEX =
  /import\s+(.*?)\s+from\s+(['"])(\.\.\/(?:generated\/)?boba-api\/(types|zod-schemas)\/([^'"]+?))(\.c?js)?(['"])/g;
const EXPORT_REGEX =
  /from\s+(['"])(\.\.\/(?:generated\/)?boba-api\/(types|zod-schemas)\/([^'"]+?))(\.c?js)?(['"])/g;
async function fixImports(file: string) {
  let content = await fs.readFile(file, "utf8");
  const originalContent = content;

  // Change the imports in this file to use the right export path in the
  // @bobaboard/boba-api library.
  content = content.replaceAll(
    IMPORT_REGEX,
    (match, imports, quote1, path, type, filename, extension, quote2) => {
      return `import ${imports} from ${quote1}@bobaboard/boba-api/${type === "types" ? "types" : "zod"}/${filename}${quote2}`;
    }
  );

  // Change the exports in this file to use the right export path in the
  // @bobaboard/boba-api library.
  content = content.replaceAll(
    EXPORT_REGEX,
    (match, quote1, path, type, filename, extension, quote2) => {
      return `from ${quote1}@bobaboard/boba-api/${type === "types" ? "types" : "zod"}/${filename}${quote2}`;
    }
  );

  // Change the "virtual:client" import to use the local client file.
  content = content.replaceAll("virtual:client", "../client.js");

  // If the content has changed, write the file back.
  if (content !== originalContent) {
    await fs.writeFile(file, content);
  }
}

/**
 * Generate entry points for the client, so the separate api/client bundles work
 * as expected on their own, even if they were generated together.
 *
 * Also puts the client file in the entry points, so we can have a custom
 * one.
 */
function getClientEntryPoints() {
  const generatedFiles = glob.sync(`./generated/boba-client/**/*.ts`);

  const entryPoints: Record<string, string> = {};

  generatedFiles.forEach((file) => {
    // Remove './generated/boba-client/' prefix and '.ts' extension
    // from the file path.
    const relativePath = file
      .replace("generated/boba-client/", "")
      .replace(/\.ts$/, "");
    entryPoints[relativePath] = file;
  });

  const clientFiles = glob.sync(`./boba-client/client.ts`);
  clientFiles.forEach((file) => {
    const name = path.basename(file, ".ts");
    entryPoints[name] = file;
  });

  return entryPoints;
}

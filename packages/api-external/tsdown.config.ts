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
 * Change imports in files to use the external library path for the api types.
 * Also change the "virtual:client" import to use the local client file.
 */
async function fixImports(file: string) {
  let content = await fs.readFile(file, "utf8");
  const originalContent = content;

  content = content.replaceAll(
    /import\s+(.*?)\s+from\s+(['"])(\.\.\/(?:generated\/)?boba-api\/(types|zod-schemas)\/([^'"]+?))(\.c?js)?(['"])/g,
    (match, imports, quote1, path, type, filename, extension, quote2) => {
      return `import ${imports} from ${quote1}@bobaboard/boba-api/${type === "types" ? "types" : "zod"}/${filename}${quote2}`;
    }
  );

  // Handle export statements
  content = content.replaceAll(
    /from\s+(['"])(\.\.\/(?:generated\/)?boba-api\/(types|zod-schemas)\/([^'"]+?))(\.c?js)?(['"])/g,
    (match, quote1, path, type, filename, extension, quote2) => {
      return `from ${quote1}@bobaboard/boba-api/${type === "types" ? "types" : "zod"}/${filename}${quote2}`;
    }
  );

  content = content.replaceAll("virtual:client", "../client.js");

  if (content !== originalContent) {
    // console.log(`✅ Fixed imports in: ${file}`);
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

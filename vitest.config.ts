import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    env: loadEnv(mode, process.cwd(), ""),
    exclude: ["dist", "node_modules/**/*", "packages/**/*"],
    fileParallelism: false,
    setupFiles: ["./test/vitestSetup.ts"],
  },
}));

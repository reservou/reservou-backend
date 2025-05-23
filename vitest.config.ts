import path from "path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.spec.ts"],
    globals: true,
    alias: [
      {
        find: "@",
        replacement: path.resolve("./src"),
      },
      {
        find: "@test",
        replacement: path.resolve("./test"),
      },
    ],
    root: "./",
  },
  plugins: [swc.vite()],
});
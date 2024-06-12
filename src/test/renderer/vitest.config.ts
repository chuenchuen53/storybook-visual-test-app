// @ts-nocheck
import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineProject({
  plugins: [tsconfigPaths(), vue()],
  test: {
    environment: "happy-dom",
    include: ["**/*.test.ts"],
    setupFiles: "setup.ts",
  },
});

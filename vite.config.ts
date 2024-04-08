import { defineConfig } from "vitest/dist/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["**/node_modules/**", "**/lib/**"],
      include: ["**/src/**"],
    },
  },
});

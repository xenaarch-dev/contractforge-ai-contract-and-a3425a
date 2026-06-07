import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    // Use React's automatic JSX runtime so tests don't need `import React`
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: { reporter: ["text"], thresholds: { lines: 80, functions: 80, branches: 70 } },
  },
});

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte({ hot: false })],
  // Svelte's browser build, so components mount in jsdom.
  resolve: {
    conditions: ["browser"],
    alias: {
      $lib: new URL("./src/lib", import.meta.url).pathname,
      "$app/forms": new URL("./vitest.forms.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/routes/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});

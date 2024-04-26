// biome-ignore lint/nursery/noNodejsModules: Allow Node.js modules in vite.config.ts
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// biome-ignore lint/style/noDefaultExport: Allow default exports in vite.config.ts
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "../bundled-frontend",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/frontend"),
    },
  },
  root: path.resolve(__dirname, "./src/frontend"),
});

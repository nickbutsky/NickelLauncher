// biome-ignore lint/nursery/noNodejsModules: False positive
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// biome-ignore lint/style/noDefaultExport: Allow default exports in vite.config.ts
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "../bundled-frontend",
  },
  plugins: [tsconfigPaths(), react()],
  root: path.resolve(__dirname, "./src/frontend"),
});

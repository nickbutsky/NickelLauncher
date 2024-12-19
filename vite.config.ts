import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// biome-ignore lint/style/noDefaultExport: vite.config.ts requires a default export
export default defineConfig({
	build: { emptyOutDir: true, outDir: "../../bundled-frontend" },
	plugins: [tsconfigPaths(), react()],
	root: "src/frontend",
});

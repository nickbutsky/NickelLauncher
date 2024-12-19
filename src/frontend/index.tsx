import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/dev-mocks";

import { App } from "@/app";
import "@/bridge";
import { ThemeProvider } from "@/components/shadcn/theme-provider";
import "@/globals.css";

function main() {
	const rootElement = document.getElementById("root");
	if (!rootElement) {
		throw new Error("Root element not found.");
	}
	createRoot(rootElement).render(
		<StrictMode>
			<ThemeProvider defaultTheme="dark">
				<App />
			</ThemeProvider>
		</StrictMode>,
	);
}

if (import.meta.env.DEV) {
	main();
} else {
	window.addEventListener("pywebviewready", main, { once: true });
}

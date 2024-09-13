import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { App } from "@/app";
import "@/bridge";
import { ThemeProvider } from "@/components/shadcn/theme-provider";
import "@/dev-mocks";
import "@/globals.css";

function createRoot() {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark">
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );
}

if (import.meta.env.DEV) {
  createRoot();
} else {
  window.addEventListener("pywebviewready", createRoot, { once: true });
}

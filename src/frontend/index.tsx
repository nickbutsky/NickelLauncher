import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { App } from "@/App";
import "@/bridge";
import "@/dev-mocks";
import "@/globals.css";

function createRoot() {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

if (import.meta.env.DEV) {
  createRoot();
} else {
  window.addEventListener("pywebviewready", createRoot);
}

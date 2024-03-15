import React from "react";
// biome-ignore lint/style/useNamingConvention: ReactDOM is a community accepted name
import ReactDOM from "react-dom/client";

import { App } from "@/App.tsx";
import "@/globals.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

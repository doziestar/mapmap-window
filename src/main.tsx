import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Dashboard, DailyNote, CurrentTask, Flex } from "./pages";

const components: Record<string, React.FC<any>> = {
  dashboard: Dashboard,
  "daily-note": DailyNote,
  "current-task": CurrentTask,
  flex: Flex,
};

const currentWindow = getCurrentWebviewWindow();
const label = currentWindow.label;

// Parse URL parameters for window configuration
const urlParams = new URLSearchParams(window.location.search);
const windowConfig = {
  theme: urlParams.get("theme"),
  defaultTab: urlParams.get("defaultTab"),
  windowId: label,
};

// Determine component based on the component field or fallback to label
let componentKey = label;
if (label.startsWith("flex-")) {
  componentKey = "flex";
}

const Component = components[componentKey] ?? Dashboard;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Component config={windowConfig} />
  </React.StrictMode>
);

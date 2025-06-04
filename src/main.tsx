import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Dashboard, DailyNote, CurrentTask, Flex } from "./pages";

const components: Record<string, React.FC> = {
  dashboard: Dashboard,
  "daily-note": DailyNote,
  "current-task": CurrentTask,
  flex: Flex,
};

const currentWindow = getCurrentWebviewWindow();
const label = currentWindow.label;
const Component = components[label] ?? Dashboard;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Component />
  </React.StrictMode>
);

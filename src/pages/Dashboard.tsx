import React from "react";
import { invoke } from "@tauri-apps/api/core";

export default function Dashboard() {
  const testShortcut = async (type: string) => {
    try {
      const result = await invoke("test_shortcut", { shortcutType: type });
      console.log(`Test result: ${result}`);
    } catch (error) {
      console.error(`Error testing ${type}:`, error);
    }
  };

  const checkShortcuts = async () => {
    try {
      const result = await invoke("check_shortcuts_registered");
      console.log(`Shortcuts registered: ${result}`);
      alert(`Shortcuts registered: ${result}`);
    } catch (error) {
      console.error("Error checking shortcuts:", error);
    }
  };

  return (
    <div className="window dashboard" style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <p>Test the global shortcuts or use the buttons below:</p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => testShortcut("daily-note")}
          style={{ padding: "10px", fontSize: "16px" }}
        >
          ��️ Test Daily Note (Cmd+Alt+Shift+D)
        </button>

        <button
          onClick={() => testShortcut("current-task")}
          style={{ padding: "10px", fontSize: "16px" }}
        >
          ✅ Test Current Task (Cmd+Alt+Shift+T)
        </button>

        <button
          onClick={() => testShortcut("flex")}
          style={{ padding: "10px", fontSize: "16px" }}
        >
          �� Test Flex Window (Cmd+Alt+Shift+S)
        </button>

        <button
          onClick={checkShortcuts}
          style={{
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#007acc",
            color: "white",
          }}
        >
          🔍 Check Shortcuts Registration Status
        </button>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f0f0f0",
          borderRadius: "5px",
        }}
      >
        <h3>Debug Instructions:</h3>
        <ol>
          <li>Check the terminal/console for log messages</li>
          <li>Try the buttons above to test window creation</li>
          <li>
            Try the keyboard shortcuts:
            <ul>
              <li>
                <kbd>Cmd+Alt+Shift+D</kbd> - Daily Note
              </li>
              <li>
                <kbd>Cmd+Alt+Shift+T</kbd> - Current Task
              </li>
              <li>
                <kbd>Cmd+Alt+Shift+S</kbd> - Flex Window
              </li>
            </ul>
          </li>
          <li>Watch for "🎯 SHORTCUT HANDLER TRIGGERED!" in terminal</li>
          <li>
            <strong>Important:</strong> On macOS, you may need to grant
            Accessibility permissions to the app in System Settings {"->"}{" "}
            Privacy & Security {"->"} Accessibility
          </li>
        </ol>
      </div>
    </div>
  );
}

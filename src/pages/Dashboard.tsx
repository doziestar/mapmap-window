import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function Dashboard() {
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [shortcutStatus, setShortcutStatus] = useState<string>("");

  useEffect(() => {
    refreshOpenWindows();
    checkShortcutsStatus();
  }, []);

  const testShortcut = async (type: string) => {
    try {
      const result = await invoke("test_shortcut", { shortcutType: type });
      console.log(`Test result: ${result}`);
      setTimeout(refreshOpenWindows, 500); // Refresh window list after creation
    } catch (error) {
      console.error(`Error testing ${type}:`, error);
    }
  };

  const createWindow = async (windowType: string) => {
    try {
      const result = await invoke("create_window", { windowType });
      console.log(`Create window result: ${result}`);
      setTimeout(refreshOpenWindows, 500); // Refresh window list after creation
    } catch (error) {
      console.error(`Error creating ${windowType}:`, error);
    }
  };

  const closeWindow = async (windowLabel: string) => {
    try {
      const result = await invoke("close_window", { windowLabel });
      console.log(`Close window result: ${result}`);
      setTimeout(refreshOpenWindows, 500); // Refresh window list after closing
    } catch (error) {
      console.error(`Error closing ${windowLabel}:`, error);
    }
  };

  const refreshOpenWindows = async () => {
    try {
      const windows = await invoke<string[]>("get_open_windows");
      setOpenWindows(windows);
    } catch (error) {
      console.error("Error getting open windows:", error);
    }
  };

  const checkShortcutsStatus = async () => {
    try {
      const result = await invoke<string>("check_shortcuts_registered");
      setShortcutStatus(result);
    } catch (error) {
      console.error("Error checking shortcuts:", error);
    }
  };

  const buttonStyle = {
    padding: "12px 16px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#007acc",
    color: "white",
    border: "1px solid #005a9e",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
    color: "white",
    border: "1px solid #c82333",
  };

  return (
    <div
      className="window dashboard"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <h1 style={{ marginBottom: "8px" }}>🗺️ MapMap Dashboard</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Manage your dynamic windows and test global shortcuts
      </p>

      {/* Shortcut Status */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #e9ecef",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0" }}>🔧 Shortcut Status</h3>
        <p style={{ margin: "0", fontFamily: "monospace" }}>
          {shortcutStatus || "Loading..."}
        </p>
        <button
          onClick={checkShortcutsStatus}
          style={{ ...buttonStyle, marginTop: "10px", fontSize: "14px" }}
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Window Creation */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "15px" }}>🆕 Create Windows</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          <button
            onClick={() => createWindow("daily-note")}
            style={buttonStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f8f9fa")
            }
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            📝 Daily Note
          </button>

          <button
            onClick={() => createWindow("current-task")}
            style={buttonStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f8f9fa")
            }
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            ✅ Current Task
          </button>

          <button
            onClick={() => createWindow("flex")}
            style={buttonStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f8f9fa")
            }
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            🎯 Flex Window
          </button>
        </div>
      </div>

      {/* Shortcut Testing */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "15px" }}>⌨️ Test Shortcuts</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "10px",
          }}
        >
          <button
            onClick={() => testShortcut("daily-note")}
            style={primaryButtonStyle}
          >
            ⌘⌥⇧D - Daily Note
          </button>

          <button
            onClick={() => testShortcut("current-task")}
            style={primaryButtonStyle}
          >
            ⌘⌥⇧T - Current Task
          </button>

          <button
            onClick={() => testShortcut("flex")}
            style={primaryButtonStyle}
          >
            ⌘⌥⇧S - Flex Window
          </button>
        </div>
      </div>

      {/* Open Windows Management */}
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <h2 style={{ margin: "0" }}>
            🏠 Open Windows ({openWindows.length})
          </h2>
          <button
            onClick={refreshOpenWindows}
            style={{ ...buttonStyle, fontSize: "14px" }}
          >
            🔄 Refresh
          </button>
        </div>

        {openWindows.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {openWindows.map((windowLabel) => (
              <div
                key={windowLabel}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <span style={{ fontWeight: "500" }}>
                  {windowLabel === "dashboard"
                    ? "🗺️ Dashboard (Main)"
                    : `🪟 ${windowLabel}`}
                </span>
                {windowLabel !== "dashboard" && (
                  <button
                    onClick={() => closeWindow(windowLabel)}
                    style={{
                      ...dangerButtonStyle,
                      fontSize: "14px",
                      padding: "6px 12px",
                    }}
                  >
                    ✕ Close
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>No windows open</p>
        )}
      </div>

      {/* Instructions */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#e7f3ff",
          borderRadius: "8px",
          border: "1px solid #b3d9ff",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0" }}>📋 How to Use</h3>
        <ol style={{ margin: "0", paddingLeft: "20px" }}>
          <li style={{ marginBottom: "8px" }}>
            <strong>Create Windows:</strong> Use the buttons above or keyboard
            shortcuts
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Keyboard Shortcuts:</strong>
            <ul style={{ marginTop: "5px" }}>
              <li>
                <kbd>⌘⌥⇧D</kbd> - Open/Focus Daily Note
              </li>
              <li>
                <kbd>⌘⌥⇧T</kbd> - Open/Focus Current Task
              </li>
              <li>
                <kbd>⌘⌥⇧S</kbd> - Open/Focus Flex Window
              </li>
            </ul>
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Window Management:</strong> View open windows and close them
            individually
          </li>
          <li style={{ marginBottom: "0" }}>
            <strong>macOS Note:</strong> Grant Accessibility permissions in
            System Settings → Privacy & Security → Accessibility
          </li>
        </ol>
      </div>
    </div>
  );
}

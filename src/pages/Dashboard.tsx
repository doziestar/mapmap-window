import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface WindowConfig {
  theme?: string;
  defaultTab?: string;
}

interface WindowDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  width: number;
  height: number;
  position: { x: number; y: number };
  shortcut?: string;
  component: string;
  config?: WindowConfig;
}

interface WindowCategory {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface WindowsConfig {
  windows: WindowDefinition[];
  categories: WindowCategory[];
}

export default function Dashboard() {
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [shortcutStatus, setShortcutStatus] = useState<string>("");
  const [availableWindows, setAvailableWindows] =
    useState<WindowsConfig | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    refreshOpenWindows();
    checkShortcutsStatus();
    loadAvailableWindows();
  }, []);

  const loadAvailableWindows = async () => {
    try {
      const config = await invoke<WindowsConfig>("get_available_windows");
      setAvailableWindows(config);
    } catch (error) {
      console.error("Error loading available windows:", error);
    }
  };

  const testShortcut = async (type: string) => {
    try {
      const result = await invoke("test_shortcut", { shortcutType: type });
      console.log(`Test result: ${result}`);
      setTimeout(refreshOpenWindows, 500);
    } catch (error) {
      console.error(`Error testing ${type}:`, error);
    }
  };

  const createWindow = async (windowId: string) => {
    try {
      const result = await invoke("create_window", { windowId });
      console.log(`Create window result: ${result}`);
      setTimeout(refreshOpenWindows, 500);
    } catch (error) {
      console.error(`Error creating ${windowId}:`, error);
    }
  };

  const closeWindow = async (windowLabel: string) => {
    try {
      const result = await invoke("close_window", { windowLabel });
      console.log(`Close window result: ${result}`);
      setTimeout(refreshOpenWindows, 500);
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

  const filteredWindows =
    availableWindows?.windows.filter(
      (window) =>
        selectedCategory === "all" || window.category === selectedCategory
    ) || [];

  const shortcutWindows =
    availableWindows?.windows.filter((w) => w.shortcut) || [];

  const buttonStyle = {
    padding: "12px 16px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textAlign: "left" as const,
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

  if (!availableWindows) {
    return (
      <div
        className="window dashboard"
        style={{ padding: "20px", textAlign: "center" }}
      >
        <h1>🗺️ MapMap Dashboard</h1>
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div
      className="window dashboard"
      style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}
    >
      <h1 style={{ marginBottom: "8px" }}>🗺️ MapMap Dashboard</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Manage your dynamic windows • {availableWindows.windows.length} windows
        available
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
        <p style={{ margin: "0", fontFamily: "monospace", fontSize: "14px" }}>
          {shortcutStatus || "Loading..."}
        </p>
        <button
          onClick={checkShortcutsStatus}
          style={{ ...buttonStyle, marginTop: "10px", fontSize: "12px" }}
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Shortcut Windows */}
      {shortcutWindows.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ marginBottom: "15px" }}>
            ⌨️ Quick Access (Keyboard Shortcuts)
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "10px",
            }}
          >
            {shortcutWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => createWindow(window.id)}
                style={primaryButtonStyle}
              >
                <span style={{ fontSize: "18px" }}>{window.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600" }}>
                    ⌘⌥⇧{window.shortcut} - {window.title}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.9 }}>
                    {window.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "15px" }}>🗂️ All Windows</h2>
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "15px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "6px 12px",
              backgroundColor:
                selectedCategory === "all" ? "#007acc" : "#f8f9fa",
              color: selectedCategory === "all" ? "white" : "#666",
              border:
                "1px solid " +
                (selectedCategory === "all" ? "#005a9e" : "#ddd"),
              borderRadius: "20px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: selectedCategory === "all" ? "600" : "400",
            }}
          >
            All ({availableWindows.windows.length})
          </button>
          {availableWindows.categories.map((category) => {
            const count = availableWindows.windows.filter(
              (w) => w.category === category.id
            ).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: "6px 12px",
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color
                      : "#f8f9fa",
                  color: selectedCategory === category.id ? "white" : "#666",
                  border:
                    "1px solid " +
                    (selectedCategory === category.id
                      ? category.color
                      : "#ddd"),
                  borderRadius: "20px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: selectedCategory === category.id ? "600" : "400",
                }}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Windows Grid */}
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px",
          }}
        >
          {filteredWindows.map((window) => {
            const category = availableWindows.categories.find(
              (c) => c.id === window.category
            );
            const isOpen = openWindows.includes(window.id);

            return (
              <div
                key={window.id}
                style={{
                  padding: "16px",
                  backgroundColor: isOpen ? "#e7f3ff" : "#fff",
                  border: "1px solid " + (isOpen ? "#b3d9ff" : "#eee"),
                  borderRadius: "8px",
                  borderLeft: "4px solid " + (category?.color || "#ddd"),
                  position: "relative",
                }}
              >
                {isOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: "#28a745",
                      color: "white",
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontWeight: "600",
                    }}
                  >
                    OPEN
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{window.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: "0",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      {window.title}
                    </h4>
                    <div
                      style={{
                        fontSize: "11px",
                        color: category?.color || "#666",
                        fontWeight: "500",
                        textTransform: "uppercase",
                      }}
                    >
                      {category?.name || window.category}
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "13px",
                    color: "#666",
                    lineHeight: "1.4",
                  }}
                >
                  {window.description}
                </p>

                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <button
                    onClick={() => createWindow(window.id)}
                    style={{
                      ...buttonStyle,
                      fontSize: "12px",
                      padding: "8px 12px",
                      backgroundColor: isOpen ? "#6c757d" : "#007acc",
                      color: "white",
                      border: "none",
                    }}
                  >
                    {isOpen ? "Focus" : "Open"}
                  </button>

                  {window.shortcut && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        backgroundColor: "#f8f9fa",
                        padding: "3px 6px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                      }}
                    >
                      ⌘⌥⇧{window.shortcut}
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      marginLeft: "auto",
                    }}
                  >
                    {window.width}×{window.height}
                  </span>
                </div>
              </div>
            );
          })}
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
            style={{ ...buttonStyle, fontSize: "12px" }}
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
            {openWindows.map((windowLabel) => {
              const windowDef = availableWindows.windows.find(
                (w) => w.id === windowLabel
              );
              return (
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
                      : windowDef
                      ? `${windowDef.emoji} ${windowDef.title}`
                      : `🪟 ${windowLabel}`}
                  </span>
                  {windowLabel !== "dashboard" && (
                    <button
                      onClick={() => closeWindow(windowLabel)}
                      style={{
                        ...dangerButtonStyle,
                        fontSize: "12px",
                        padding: "6px 12px",
                      }}
                    >
                      ✕ Close
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            Only the dashboard is open
          </p>
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
            <strong>Quick Access:</strong> Use keyboard shortcuts for frequently
            used windows
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Browse by Category:</strong> Filter windows by purpose using
            the category buttons
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

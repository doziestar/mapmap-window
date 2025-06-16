import React, { useState, useEffect } from "react";

interface FlexConfig {
  theme?: string;
  defaultTab?: string;
  windowId?: string;
}

interface FlexProps {
  config?: FlexConfig;
}

export default function Flex({ config }: FlexProps) {
  const theme = config?.theme || "default";
  const [activeTab, setActiveTab] = useState<string>(
    config?.defaultTab || "notes"
  );
  const [notes, setNotes] = useState("");
  const [calculation, setCalculation] = useState("");
  const [timerMinutes, setTimerMinutes] = useState(25);

  // Customize tabs based on theme
  const getTabsForTheme = (theme: string) => {
    switch (theme) {
      case "code":
        return [
          { id: "editor", label: "💻 Code Editor", emoji: "💻" },
          { id: "snippets", label: "📚 Snippets", emoji: "📚" },
          { id: "terminal", label: "⚡ Terminal", emoji: "⚡" },
        ];
      case "research":
        return [
          { id: "notes", label: "📝 Research Notes", emoji: "📝" },
          { id: "links", label: "🔗 Links & References", emoji: "🔗" },
          { id: "citations", label: "📖 Citations", emoji: "📖" },
        ];
      case "meeting":
        return [
          { id: "agenda", label: "📋 Agenda", emoji: "📋" },
          { id: "notes", label: "📝 Meeting Notes", emoji: "📝" },
          { id: "actions", label: "✅ Action Items", emoji: "✅" },
        ];
      case "brainstorm":
        return [
          { id: "ideas", label: "💡 Ideas", emoji: "💡" },
          { id: "mindmap", label: "🗺️ Mind Map", emoji: "🗺️" },
          { id: "sketches", label: "✏️ Sketches", emoji: "✏️" },
        ];
      case "focus":
        return [
          { id: "timer", label: "⏲️ Pomodoro", emoji: "⏲️" },
          { id: "goals", label: "🎯 Goals", emoji: "🎯" },
          { id: "music", label: "🎵 Focus Music", emoji: "🎵" },
        ];
      case "tools":
        return [
          { id: "calculator", label: "🧮 Calculator", emoji: "🧮" },
          { id: "converter", label: "🔄 Unit Converter", emoji: "🔄" },
          { id: "color", label: "🎨 Color Picker", emoji: "🎨" },
        ];
      case "monitor":
        return [
          { id: "stats", label: "📊 System Stats", emoji: "📊" },
          { id: "processes", label: "⚙️ Processes", emoji: "⚙️" },
          { id: "network", label: "🌐 Network", emoji: "🌐" },
        ];
      default:
        return [
          { id: "notes", label: "📝 Notes", emoji: "📝" },
          { id: "calculator", label: "🧮 Calculator", emoji: "🧮" },
          { id: "timer", label: "⏲️ Timer", emoji: "⏲️" },
        ];
    }
  };

  const tabs = getTabsForTheme(theme);

  // Set default tab on mount
  useEffect(() => {
    if (
      config?.defaultTab &&
      tabs.some((tab) => tab.id === config.defaultTab)
    ) {
      setActiveTab(config.defaultTab);
    }
  }, [config?.defaultTab, tabs]);

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "code":
        return { primary: "#28a745", secondary: "#20c997", accent: "#6f42c1" };
      case "research":
        return { primary: "#6f42c1", secondary: "#e83e8c", accent: "#fd7e14" };
      case "meeting":
        return { primary: "#fd7e14", secondary: "#ffc107", accent: "#28a745" };
      case "brainstorm":
        return { primary: "#e83e8c", secondary: "#6f42c1", accent: "#20c997" };
      case "focus":
        return { primary: "#dc3545", secondary: "#fd7e14", accent: "#28a745" };
      case "tools":
        return { primary: "#20c997", secondary: "#17a2b8", accent: "#6c757d" };
      case "monitor":
        return { primary: "#6c757d", secondary: "#495057", accent: "#007bff" };
      default:
        return { primary: "#007acc", secondary: "#17a2b8", accent: "#28a745" };
    }
  };

  const colors = getThemeColors(theme);

  const getWindowTitle = (theme: string, windowId?: string) => {
    if (windowId) {
      const titles: Record<string, string> = {
        "flex-workspace": "🎯 Flex Workspace",
        "flex-code": "💻 Code Scratchpad",
        "flex-research": "🔬 Research Hub",
        "flex-meeting": "👥 Meeting Notes",
        "flex-brainstorm": "💡 Brainstorm Board",
        "flex-focus": "🎯 Focus Station",
        "flex-quick": "⚡ Quick Tools",
        "flex-monitor": "📊 System Monitor",
      };
      return titles[windowId] || "🎯 Flex Window";
    }
    return "🎯 Flex Workspace";
  };

  const calculate = () => {
    try {
      const sanitized = calculation.replace(/[^0-9+\-*/.() ]/g, "");
      const result = Function('"use strict"; return (' + sanitized + ")")();
      setCalculation(result.toString());
    } catch (error) {
      setCalculation("Error");
    }
  };

  const formatTime = (minutes: number) => {
    return `${minutes.toString().padStart(2, "0")}:00`;
  };

  const getPlaceholderForTheme = (theme: string, tabId: string) => {
    switch (`${theme}-${tabId}`) {
      case "code-editor":
        return `// Code scratchpad
function example() {
  return "Hello, World!";
}

// TODO: Implement feature
// FIXME: Bug in line 42`;
      case "research-notes":
        return `Research Notes

📚 Key Findings:
• 

🔍 Questions to explore:
• 

📖 Sources:
• `;
      case "meeting-agenda":
        return `Meeting Agenda

📅 Date: ${new Date().toLocaleDateString()}
⏰ Time: 
👥 Attendees: 

📋 Agenda Items:
1. 
2. 
3. 

🎯 Objectives:
• `;
      case "brainstorm-ideas":
        return `Brainstorming Session

💡 Ideas:
• 
• 
• 

🌟 Best Ideas:
• 

🔄 Next Steps:
• `;
      default:
        return "Jot down quick thoughts, ideas, or reminders...";
    }
  };

  return (
    <div
      className="window flex"
      style={{
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme === "focus" ? "#1a1a1a" : "#fff",
        color: theme === "focus" ? "#fff" : "#333",
      }}
    >
      <header
        style={{
          marginBottom: "20px",
          borderBottom: `2px solid ${colors.primary}`,
          paddingBottom: "15px",
        }}
      >
        <h1 style={{ margin: "0 0 5px 0", color: colors.primary }}>
          {getWindowTitle(theme, config?.windowId)}
        </h1>
        <p style={{ margin: "0", color: theme === "focus" ? "#ccc" : "#666" }}>
          {theme === "code" && "Quick code snippets and experiments"}
          {theme === "research" && "Research notes, links, and references"}
          {theme === "meeting" && "Meeting agenda, notes, and action items"}
          {theme === "brainstorm" &&
            "Ideas, mind mapping, and creative thinking"}
          {theme === "focus" && "Pomodoro timer and focus tools"}
          {theme === "tools" && "Calculator, unit converter, and utilities"}
          {theme === "monitor" && "System stats and performance metrics"}
          {![
            "code",
            "research",
            "meeting",
            "brainstorm",
            "focus",
            "tools",
            "monitor",
          ].includes(theme) && "A flexible workspace for quick tasks and tools"}
        </p>
      </header>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          borderBottom: `1px solid ${colors.primary}20`,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              backgroundColor:
                activeTab === tab.id ? colors.primary : "transparent",
              color:
                activeTab === tab.id
                  ? "white"
                  : theme === "focus"
                  ? "#ccc"
                  : "#666",
              border: "none",
              borderBottom:
                activeTab === tab.id
                  ? `2px solid ${colors.primary}`
                  : "2px solid transparent",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? "600" : "400",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Notes/Text Tabs */}
        {(activeTab === "notes" ||
          activeTab === "editor" ||
          activeTab === "ideas" ||
          activeTab === "agenda" ||
          activeTab === "actions" ||
          activeTab === "citations" ||
          activeTab === "snippets") && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 15px 0", color: colors.primary }}>
              {tabs.find((t) => t.id === activeTab)?.emoji}{" "}
              {tabs
                .find((t) => t.id === activeTab)
                ?.label.split(" ")
                .slice(1)
                .join(" ")}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getPlaceholderForTheme(theme, activeTab)}
              style={{
                flex: 1,
                padding: "15px",
                border: `1px solid ${colors.primary}40`,
                borderRadius: "8px",
                fontSize: activeTab === "editor" ? "14px" : "14px",
                fontFamily:
                  activeTab === "editor"
                    ? "Monaco, 'Courier New', monospace"
                    : "system-ui, -apple-system, sans-serif",
                lineHeight: "1.6",
                resize: "none",
                outline: "none",
                backgroundColor: theme === "focus" ? "#2a2a2a" : "#fff",
                color: theme === "focus" ? "#fff" : "#333",
              }}
            />
            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: theme === "focus" ? "#888" : "#666",
              }}
            >
              {notes.length} characters
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: "0 0 20px 0", color: colors.primary }}>
              🧮 Calculator
            </h3>
            <div style={{ width: "100%", maxWidth: "300px" }}>
              <input
                type="text"
                value={calculation}
                onChange={(e) => setCalculation(e.target.value)}
                placeholder="Enter calculation (e.g., 2 + 2 * 3)"
                style={{
                  width: "100%",
                  padding: "15px",
                  border: `1px solid ${colors.primary}40`,
                  borderRadius: "8px",
                  fontSize: "18px",
                  textAlign: "center",
                  marginBottom: "15px",
                  fontFamily: "monospace",
                  backgroundColor: theme === "focus" ? "#2a2a2a" : "#fff",
                  color: theme === "focus" ? "#fff" : "#333",
                }}
                onKeyDown={(e) => e.key === "Enter" && calculate()}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                <button
                  onClick={calculate}
                  style={{
                    padding: "12px",
                    backgroundColor: colors.primary,
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  Calculate
                </button>
                <button
                  onClick={() => setCalculation("")}
                  style={{
                    padding: "12px",
                    backgroundColor: colors.secondary,
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timer Tab */}
        {activeTab === "timer" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: "0 0 30px 0", color: colors.primary }}>
              ⏲️ Focus Timer
            </h3>
            <div
              style={{
                fontSize: "48px",
                fontFamily: "monospace",
                fontWeight: "bold",
                color: colors.primary,
                marginBottom: "30px",
                padding: "20px",
                border: `3px solid ${colors.primary}`,
                borderRadius: "15px",
                minWidth: "200px",
                textAlign: "center",
                backgroundColor: theme === "focus" ? "#2a2a2a" : "transparent",
              }}
            >
              {formatTime(timerMinutes)}
            </div>

            <div
              style={{
                marginBottom: "20px",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  color: theme === "focus" ? "#ccc" : "#666",
                }}
              >
                Minutes:
              </label>
              <input
                type="number"
                value={timerMinutes}
                onChange={(e) =>
                  setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))
                }
                min="0"
                max="60"
                style={{
                  width: "60px",
                  padding: "5px",
                  border: `1px solid ${colors.primary}40`,
                  borderRadius: "4px",
                  textAlign: "center",
                  backgroundColor: theme === "focus" ? "#2a2a2a" : "#fff",
                  color: theme === "focus" ? "#fff" : "#333",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "10px",
                backgroundColor: `${colors.primary}20`,
                borderRadius: "6px",
                fontSize: "12px",
                color: theme === "focus" ? "#ccc" : "#666",
                textAlign: "center",
                maxWidth: "300px",
              }}
            >
              🍅 Pomodoro Technique: 25 min work, 5 min break
            </div>
          </div>
        )}

        {/* Other specialized tabs based on theme */}
        {activeTab === "links" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 15px 0", color: colors.primary }}>
              🔗 Links & References
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Research Links & References

🔗 Important Links:
• https://example.com - Description
• https://example.com - Description

📚 Resources:
• Book: Title by Author
• Article: Title (Journal, Year)

🏷️ Tags: #research #important #todo`}
              style={{
                flex: 1,
                padding: "15px",
                border: `1px solid ${colors.primary}40`,
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                lineHeight: "1.6",
                resize: "none",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Fallback for unknown tabs */}
        {![
          "notes",
          "calculator",
          "timer",
          "editor",
          "ideas",
          "agenda",
          "actions",
          "citations",
          "snippets",
          "links",
        ].includes(activeTab) && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme === "focus" ? "#666" : "#999",
              fontSize: "18px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                {tabs.find((t) => t.id === activeTab)?.emoji || "🛠️"}
              </div>
              <p>Feature coming soon...</p>
              <p style={{ fontSize: "14px", opacity: 0.7 }}>
                This {activeTab} tool is under development
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "15px",
          padding: "10px 0",
          borderTop: `1px solid ${colors.primary}20`,
          fontSize: "12px",
          color: theme === "focus" ? "#666" : "#666",
          textAlign: "center",
        }}
      >
        {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme • Created
        dynamically via MapMap
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function Flex() {
  const [activeTab, setActiveTab] = useState<"notes" | "calculator" | "timer">(
    "notes"
  );
  const [notes, setNotes] = useState("");
  const [calculation, setCalculation] = useState("");
  const [timerMinutes, setTimerMinutes] = useState(25);

  const tabs = [
    { id: "notes", label: "📝 Notes", emoji: "📝" },
    { id: "calculator", label: "🧮 Calculator", emoji: "🧮" },
    { id: "timer", label: "⏲️ Timer", emoji: "⏲️" },
  ];

  const calculate = () => {
    try {
      // Simple calculator - only allow basic operations for security
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

  return (
    <div
      className="window flex"
      style={{
        padding: "20px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          marginBottom: "20px",
          borderBottom: "2px solid #eee",
          paddingBottom: "15px",
        }}
      >
        <h1 style={{ margin: "0 0 5px 0", color: "#333" }}>
          🎯 Flex Workspace
        </h1>
        <p style={{ margin: "0", color: "#666" }}>
          A flexible workspace for quick tasks and tools
        </p>
      </header>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          borderBottom: "1px solid #eee",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "10px 20px",
              backgroundColor: activeTab === tab.id ? "#007acc" : "transparent",
              color: activeTab === tab.id ? "white" : "#666",
              border: "none",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid #007acc"
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
        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 15px 0" }}>📝 Quick Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down quick thoughts, ideas, or reminders..."
              style={{
                flex: 1,
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "system-ui, -apple-system, monospace",
                lineHeight: "1.6",
                resize: "none",
                outline: "none",
              }}
            />
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
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
            <h3 style={{ margin: "0 0 20px 0" }}>🧮 Quick Calculator</h3>
            <div style={{ width: "100%", maxWidth: "300px" }}>
              <input
                type="text"
                value={calculation}
                onChange={(e) => setCalculation(e.target.value)}
                placeholder="Enter calculation (e.g., 2 + 2 * 3)"
                style={{
                  width: "100%",
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "18px",
                  textAlign: "center",
                  marginBottom: "15px",
                  fontFamily: "monospace",
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
                    backgroundColor: "#007acc",
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
                    backgroundColor: "#6c757d",
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
            <h3 style={{ margin: "0 0 30px 0" }}>⏲️ Pomodoro Timer</h3>
            <div
              style={{
                fontSize: "48px",
                fontFamily: "monospace",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "30px",
                padding: "20px",
                border: "3px solid #ddd",
                borderRadius: "15px",
                minWidth: "200px",
                textAlign: "center",
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
              <label style={{ fontSize: "14px", color: "#666" }}>
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
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#e7f3ff",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#666",
                textAlign: "center",
                maxWidth: "300px",
              }}
            >
              🍅 Pomodoro Technique: 25 min work, 5 min break
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "15px",
          padding: "10px 0",
          borderTop: "1px solid #eee",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
        }}
      >
        Flexible Workspace • Created dynamically via MapMap
      </div>
    </div>
  );
}

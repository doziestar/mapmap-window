import React, { useState } from "react";

interface DailyNoteProps {
  config?: any;
}

export default function DailyNote({ config }: DailyNoteProps) {
  const [notes, setNotes] = useState<string>("");
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="window daily-note"
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
        <h1 style={{ margin: "0 0 5px 0", color: "#333" }}>📝 Daily Note</h1>
        <p style={{ margin: "0", color: "#666" }}>{today}</p>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What's on your mind today?

• Goals for today
• Important thoughts
• Ideas and insights
• Reflections..."
          style={{
            flex: 1,
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            lineHeight: "1.6",
            resize: "none",
            outline: "none",
          }}
        />

        <div
          style={{
            marginTop: "15px",
            padding: "10px 0",
            borderTop: "1px solid #eee",
            fontSize: "14px",
            color: "#666",
            textAlign: "center",
          }}
        >
          {notes.length} characters • Created dynamically via MapMap
        </div>
      </div>
    </div>
  );
}

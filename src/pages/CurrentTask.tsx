import React, { useState } from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

interface CurrentTaskProps {
  config?: any;
}

export default function CurrentTask({ config }: CurrentTaskProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        priority,
      };
      setTasks([task, ...tasks]);
      setNewTask("");
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#dc3545";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div
      className="window current-task"
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
        <h1 style={{ margin: "0 0 5px 0", color: "#333" }}>✅ Current Tasks</h1>
        <p style={{ margin: "0", color: "#666" }}>
          {activeTasks.length} active • {completedTasks.length} completed
        </p>
      </header>

      {/* Add Task Form */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new task..."
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={addTask}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007acc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Task Lists */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
              Active Tasks
            </h3>
            {activeTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  margin: "5px 0",
                  backgroundColor: "white",
                  border: "1px solid #eee",
                  borderRadius: "6px",
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  style={{ marginRight: "5px" }}
                />
                <span style={{ flex: 1, fontSize: "14px" }}>{task.text}</span>
                <span
                  style={{
                    fontSize: "12px",
                    color: getPriorityColor(task.priority),
                    fontWeight: "500",
                    textTransform: "uppercase",
                  }}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>
              Completed Tasks
            </h3>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  margin: "5px 0",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #eee",
                  borderRadius: "6px",
                  opacity: 0.7,
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  style={{ marginRight: "5px" }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    textDecoration: "line-through",
                    color: "#666",
                  }}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            No tasks yet. Add one above to get started!
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
        Dynamic Task Manager • Created via MapMap
      </div>
    </div>
  );
}

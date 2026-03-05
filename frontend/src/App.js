import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/tasks`);
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;
    await axios.post(`${API}/tasks`, { title, description });
    setTitle("");
    setDescription("");
    fetchTasks();
  };

  const completeTask = async (id) => {
    await axios.patch(`${API}/tasks/${id}/complete`);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div
      style={{
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "auto",
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Task Manager</h1>

        <input
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={addTask}
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Add Task
        </button>

        <hr style={{ margin: "20px 0" }} />

        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
              backgroundColor: "#fafafa",
            }}
          >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
              Status:{" "}
              <span
                style={{
                  color:
                    task.status === "completed" ? "green" : "orange",
                }}
              >
                {task.status}
              </span>
            </p>

            <button
              onClick={() => completeTask(task.id)}
              disabled={task.status === "completed"}
              style={{
                padding: "6px 10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                marginRight: "5px",
                cursor: "pointer",
              }}
            >
              Complete
            </button>

            <button
              onClick={() => deleteTask(task.id)}
              style={{
                padding: "6px 10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
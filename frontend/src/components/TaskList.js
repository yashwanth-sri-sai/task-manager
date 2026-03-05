import React, { useEffect, useState, useCallback } from "react";
import { taskApi } from "../services/api";
import TaskItem from "./TaskItem";

export default function TaskList({ refreshSignal }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "completed"

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + re-fetch whenever parent signals a new task was added
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshSignal]);

  const handleCompleted = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleDeleted = (deletedId) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="state-container">
        <span className="spinner spinner--lg" aria-label="Loading tasks" />
        <p className="state-text">Loading tasks…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container state-container--error">
        <p className="state-error">{error}</p>
        <button className="btn btn-primary" onClick={fetchTasks}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="task-list-panel">
      <div className="list-header">
        <h2 className="panel-heading">
          Tasks
          <span className="task-count">{counts.all}</span>
        </h2>

        <div className="filter-tabs" role="group" aria-label="Filter tasks">
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "filter-tab--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            {filter === "completed" ? "✓" : "○"}
          </div>
          <p className="empty-text">
            {filter === "all"
              ? "No tasks yet. Add one above!"
              : `No ${filter} tasks.`}
          </p>
        </div>
      ) : (
        <ul className="task-list" role="list">
          {filteredTasks.map((task) => (
            <li key={task.id} className="task-list__item">
              <TaskItem
                task={task}
                onCompleted={handleCompleted}
                onDeleted={handleDeleted}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

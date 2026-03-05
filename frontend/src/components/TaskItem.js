import React, { useState } from "react";
import { taskApi } from "../services/api";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskItem({ task, onCompleted, onDeleted }) {
  const [actionError, setActionError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isCompleted = task.status === "completed";

  const handleComplete = async () => {
    setCompleting(true);
    setActionError(null);
    try {
      const updated = await taskApi.complete(task.id);
      onCompleted(updated);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setActionError(null);
    try {
      await taskApi.delete(task.id);
      onDeleted(task.id);
    } catch (err) {
      setActionError(err.message);
      setDeleting(false);
    }
  };

  return (
    <article
      className={`task-card ${isCompleted ? "task-card--completed" : "task-card--pending"} ${
        deleting ? "task-card--deleting" : ""
      }`}
    >
      <div className="task-card__body">
        <div className="task-card__meta">
          <span className={`status-badge status-badge--${task.status}`}>
            {isCompleted ? "✓ Completed" : "● Pending"}
          </span>
          <span className="task-date">{formatDate(task.created_at)}</span>
        </div>

        <h3 className="task-title">{task.title}</h3>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      <div className="task-card__footer">
        {actionError && (
          <p className="action-error" role="alert">
            {actionError}
          </p>
        )}

        <div className="task-actions">
          <button
            className="btn btn-complete"
            onClick={handleComplete}
            disabled={isCompleted || completing || deleting}
            title={isCompleted ? "Already completed" : "Mark as complete"}
          >
            {completing ? (
              <>
                <span className="spinner spinner--sm" aria-hidden="true" />
                Completing…
              </>
            ) : (
              "Complete"
            )}
          </button>

          <button
            className="btn btn-delete"
            onClick={handleDelete}
            disabled={deleting || completing}
            title="Delete task"
          >
            {deleting ? (
              <>
                <span className="spinner spinner--sm" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

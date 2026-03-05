import React, { useState } from "react";
import { taskApi } from "../services/api";

const EMPTY_FORM = { title: "", description: "" };

export default function AddTask({ onTaskAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newTask = await taskApi.create({
        title,
        description: form.description.trim(),
      });
      setForm(EMPTY_FORM);
      onTaskAdded(newTask);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="add-task-panel">
      <h2 className="panel-heading">New Task</h2>

      <form className="add-task-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label className="field-label" htmlFor="title">
            Title <span className="required-star">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`field-input ${error && !form.title.trim() ? "field-input--error" : ""}`}
            placeholder="What needs doing?"
            value={form.title}
            onChange={handleChange}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="field-input field-textarea"
            placeholder="Any extra details…"
            value={form.description}
            onChange={handleChange}
            disabled={loading}
            rows={3}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className={`btn btn-primary ${loading ? "btn--loading" : ""}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Adding…
            </>
          ) : (
            "Add Task"
          )}
        </button>
      </form>
    </section>
  );
}

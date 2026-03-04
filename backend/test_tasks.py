"""
Pytest test suite for the Smart Task Manager API.
Run with:  pytest tests/test_tasks.py -v
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from app import create_app
from config import TestingConfig
from database import db as _db


# ── Fixtures ───────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def app():
    application = create_app(TestingConfig)
    yield application


@pytest.fixture(scope="session")
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def reset_db(app):
    """Wipe and recreate all tables before each test for isolation."""
    with app.app_context():
        _db.drop_all()
        _db.create_all()
    yield


# ── Helpers ────────────────────────────────────────────────────────────────────

def create_task(client, title="Test Task", description="A description", status="pending"):
    return client.post(
        "/tasks",
        json={"title": title, "description": description, "status": status},
        content_type="application/json",
    )


# ── Create Task ────────────────────────────────────────────────────────────────

class TestCreateTask:
    def test_creates_task_successfully(self, client):
        resp = create_task(client, title="Buy groceries")
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["title"] == "Buy groceries"
        assert data["status"] == "pending"
        assert data["id"] is not None
        assert "created_at" in data

    def test_create_task_with_completed_status(self, client):
        resp = create_task(client, title="Done task", status="completed")
        assert resp.status_code == 201
        assert resp.get_json()["status"] == "completed"

    def test_create_task_missing_title_returns_422(self, client):
        resp = client.post("/tasks", json={"description": "No title"})
        assert resp.status_code == 422

    def test_create_task_empty_title_returns_422(self, client):
        resp = client.post("/tasks", json={"title": ""})
        assert resp.status_code == 422

    def test_create_task_whitespace_title_returns_422(self, client):
        resp = client.post("/tasks", json={"title": "   "})
        assert resp.status_code == 422

    def test_create_task_invalid_status_returns_422(self, client):
        resp = client.post("/tasks", json={"title": "Task", "status": "in-progress"})
        assert resp.status_code == 422

    def test_create_task_no_body_returns_422(self, client):
        resp = client.post("/tasks", json={})
        assert resp.status_code == 422


# ── Retrieve Tasks ─────────────────────────────────────────────────────────────

class TestRetrieveTasks:
    def test_get_all_tasks_empty(self, client):
        resp = client.get("/tasks")
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_get_all_tasks_returns_created_tasks(self, client):
        create_task(client, title="Task A")
        create_task(client, title="Task B")
        resp = client.get("/tasks")
        assert resp.status_code == 200
        titles = [t["title"] for t in resp.get_json()]
        assert "Task A" in titles
        assert "Task B" in titles

    def test_get_single_task(self, client):
        task_id = create_task(client, title="Single Task").get_json()["id"]
        resp = client.get(f"/tasks/{task_id}")
        assert resp.status_code == 200
        assert resp.get_json()["title"] == "Single Task"

    def test_get_nonexistent_task_returns_404(self, client):
        resp = client.get("/tasks/9999")
        assert resp.status_code == 404
        assert "error" in resp.get_json()


# ── Update Task ────────────────────────────────────────────────────────────────

class TestUpdateTask:
    def test_update_task_title(self, client):
        task_id = create_task(client, title="Old Title").get_json()["id"]
        resp = client.put(f"/tasks/{task_id}", json={"title": "New Title"})
        assert resp.status_code == 200
        assert resp.get_json()["title"] == "New Title"

    def test_update_task_status_to_completed(self, client):
        task_id = create_task(client).get_json()["id"]
        resp = client.put(f"/tasks/{task_id}", json={"status": "completed"})
        assert resp.status_code == 200
        assert resp.get_json()["status"] == "completed"

    def test_update_nonexistent_task_returns_404(self, client):
        resp = client.put("/tasks/9999", json={"title": "Ghost"})
        assert resp.status_code == 404

    def test_update_with_invalid_status_returns_422(self, client):
        task_id = create_task(client).get_json()["id"]
        resp = client.put(f"/tasks/{task_id}", json={"status": "unknown"})
        assert resp.status_code == 422


# ── Delete Task ────────────────────────────────────────────────────────────────

class TestDeleteTask:
    def test_delete_task_successfully(self, client):
        task_id = create_task(client).get_json()["id"]
        resp = client.delete(f"/tasks/{task_id}")
        assert resp.status_code == 200
        # Verify it's gone
        assert client.get(f"/tasks/{task_id}").status_code == 404

    def test_delete_nonexistent_task_returns_404(self, client):
        resp = client.delete("/tasks/9999")
        assert resp.status_code == 404


# ── Complete Task ──────────────────────────────────────────────────────────────

class TestCompleteTask:
    def test_complete_pending_task(self, client):
        task_id = create_task(client).get_json()["id"]
        resp = client.patch(f"/tasks/{task_id}/complete")
        assert resp.status_code == 200
        assert resp.get_json()["status"] == "completed"

    def test_complete_already_completed_task_returns_409(self, client):
        task_id = create_task(client, status="completed").get_json()["id"]
        resp = client.patch(f"/tasks/{task_id}/complete")
        assert resp.status_code == 409
        assert "error" in resp.get_json()

    def test_complete_nonexistent_task_returns_404(self, client):
        resp = client.patch("/tasks/9999/complete")
        assert resp.status_code == 404

    def test_complete_then_re_complete_returns_409(self, client):
        task_id = create_task(client).get_json()["id"]
        client.patch(f"/tasks/{task_id}/complete")
        resp = client.patch(f"/tasks/{task_id}/complete")
        assert resp.status_code == 409

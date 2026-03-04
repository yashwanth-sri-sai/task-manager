from typing import Optional

from database import db
from models import Task, TaskStatus


class TaskNotFoundError(Exception):
    """Raised when a requested task does not exist."""


class TaskAlreadyCompletedError(Exception):
    """Raised when attempting to complete an already-completed task."""


def get_all_tasks() -> list[Task]:
    return Task.query.order_by(Task.created_at.desc()).all()


def get_task_by_id(task_id: int) -> Task:
    task = Task.query.get(task_id)
    if task is None:
        raise TaskNotFoundError(f"Task with id={task_id} not found.")
    return task


def create_task(title: str, description: Optional[str] = None, status: str = "pending") -> Task:
    task = Task(
        title=title.strip(),
        description=description,
        status=TaskStatus(status),
    )
    db.session.add(task)
    db.session.commit()
    return task


def update_task(task_id: int, data: dict) -> Task:
    task = get_task_by_id(task_id)

    if "title" in data:
        task.title = data["title"].strip()
    if "description" in data:
        task.description = data["description"]
    if "status" in data:
        task.status = TaskStatus(data["status"])

    db.session.commit()
    return task


def delete_task(task_id: int) -> None:
    task = get_task_by_id(task_id)
    db.session.delete(task)
    db.session.commit()


def complete_task(task_id: int) -> Task:
    task = get_task_by_id(task_id)

    if task.is_completed():
        raise TaskAlreadyCompletedError(f"Task id={task_id} is already completed.")

    task.status = TaskStatus.COMPLETED
    db.session.commit()
    return task

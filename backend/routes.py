from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from schemas import task_create_schema, task_update_schema
from services import (
    TaskAlreadyCompletedError,
    TaskNotFoundError,
    complete_task,
    create_task,
    delete_task,
    get_all_tasks,
    get_task_by_id,
    update_task,
)

tasks_bp = Blueprint("tasks", __name__, url_prefix="/tasks")


# ── Helpers ────────────────────────────────────────────────────────────────────

def _ok(data, status: int = 200):
    return jsonify(data), status


def _error(message: str, status: int):
    return jsonify({"error": message}), status


# ── Routes ─────────────────────────────────────────────────────────────────────

@tasks_bp.route("", methods=["GET"])
def list_tasks():
    tasks = get_all_tasks()
    return _ok([t.to_dict() for t in tasks])


@tasks_bp.route("/<int:task_id>", methods=["GET"])
def retrieve_task(task_id: int):
    try:
        task = get_task_by_id(task_id)
    except TaskNotFoundError as exc:
        return _error(str(exc), 404)
    return _ok(task.to_dict())


@tasks_bp.route("", methods=["POST"])
def create_task_route():
    try:
        payload = task_create_schema.load(request.get_json(silent=True) or {})
    except ValidationError as exc:
        return _error(exc.messages, 422)

    task = create_task(
        title=payload["title"],
        description=payload.get("description"),
        status=payload.get("status", "pending"),
    )
    return _ok(task.to_dict(), 201)


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
def update_task_route(task_id: int):
    try:
        payload = task_update_schema.load(request.get_json(silent=True) or {})
    except ValidationError as exc:
        return _error(exc.messages, 422)

    try:
        task = update_task(task_id, payload)
    except TaskNotFoundError as exc:
        return _error(str(exc), 404)

    return _ok(task.to_dict())


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task_route(task_id: int):
    try:
        delete_task(task_id)
    except TaskNotFoundError as exc:
        return _error(str(exc), 404)
    return jsonify({"message": f"Task {task_id} deleted successfully."}), 200


@tasks_bp.route("/<int:task_id>/complete", methods=["PATCH"])
def complete_task_route(task_id: int):
    try:
        task = complete_task(task_id)
    except TaskNotFoundError as exc:
        return _error(str(exc), 404)
    except TaskAlreadyCompletedError as exc:
        return _error(str(exc), 409)
    return _ok(task.to_dict())

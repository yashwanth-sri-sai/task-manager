from marshmallow import Schema, ValidationError, fields, validate, validates


VALID_STATUSES = ("pending", "completed")


class TaskCreateSchema(Schema):
    title = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255, error="Title cannot be empty."),
    )
    description = fields.String(load_default=None)
    status = fields.String(
        load_default="pending",
        validate=validate.OneOf(VALID_STATUSES, error="Status must be 'pending' or 'completed'."),
    )

    @validates("title")
    def validate_title_not_blank(self, value, **kwargs):
     if not value.strip():
        raise ValidationError("Title cannot be blank")


class TaskUpdateSchema(Schema):
    title = fields.String(
        validate=validate.Length(min=1, max=255, error="Title cannot be empty.")
    )
    description = fields.String(load_default=None)
    status = fields.String(
        validate=validate.OneOf(VALID_STATUSES, error="Status must be 'pending' or 'completed'.")
    )

    @validates("title")
    def validate_title_not_blank(self, value, **kwargs):
     if not value.strip():
        raise ValidationError("Title cannot be blank")


task_create_schema = TaskCreateSchema()
task_update_schema = TaskUpdateSchema()

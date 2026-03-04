from flask import Flask, jsonify
from flask_cors import CORS

from config import get_config
from database import init_db
from routes import tasks_bp


def create_app(config=None):
    """Application factory — accepts an optional config override for testing."""
    app = Flask(__name__)

    # Load config
    app.config.from_object(config or get_config())

    # Extensions
    CORS(app)
    init_db(app)

    # Blueprints
    app.register_blueprint(tasks_bp)

    # Global error handlers
    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(_):
        return jsonify({"error": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(_):
        return jsonify({"error": "An unexpected error occurred."}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)

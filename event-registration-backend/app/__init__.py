from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from app.config import Config
from app.database import init_app


def create_app(config_class=Config):
    """Application factory for EventHub Flask backend."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for React frontend (development and production origins)
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:5000",
                    "*"
                ],
                "methods": ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "Accept"],
            },
            r"/uploads/*": {
                "origins": "*",
                "methods": ["GET", "OPTIONS"],
            }
        }
    )

    # Initialize SQLite database
    init_app(app)

    # Ensure upload directory exists
    upload_folder = Path(app.config['UPLOAD_FOLDER']).resolve()
    upload_folder.mkdir(parents=True, exist_ok=True)

    # Register Blueprints
    from app.routes.events import events_bp
    from app.routes.registrations import registrations_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(events_bp)
    app.register_blueprint(registrations_bp)
    app.register_blueprint(admin_bp)

    # Serve uploaded images statically
    @app.route('/uploads/events/<path:filename>', methods=['GET'])
    def serve_uploaded_event_image(filename):
        folder = Path(app.config['UPLOAD_FOLDER']).resolve()
        target_file = folder / filename
        file_exists = target_file.is_file()
        print(f"[STATIC SERVE] Requested: {filename} from {folder} (exists: {file_exists})")
        return send_from_directory(str(folder), filename)

    @app.route('/uploads/<path:filename>', methods=['GET'])
    def serve_uploaded_file(filename):
        base_uploads = Path(app.config['UPLOAD_FOLDER']).resolve().parent
        return send_from_directory(str(base_uploads), filename)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'eventhub-api',
            'version': '1.0.0'
        }), 200

    # Global 404 handler for API routes
    @app.errorhandler(404)
    def handle_404(e):
        return jsonify({
            'code': 'NOT_FOUND',
            'error': 'NOT_FOUND',
            'message': 'Resource not found.'
        }), 404

    # Global 500 handler
    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({
            'code': 'INTERNAL_ERROR',
            'error': 'INTERNAL_ERROR',
            'message': 'An internal server error occurred.'
        }), 500

    return app

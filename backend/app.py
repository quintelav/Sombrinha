"""Application factory and local entry point for Sombrinha."""

import os
import sys
import socket
from pathlib import Path

# Garante que o diretório backend esteja no sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from flask import Flask, send_from_directory, request
from dotenv import load_dotenv

from controllers.adoption_controller import adoptions_blueprint
from controllers.ai_controller import ai_blueprint
from controllers.climate_controller import climate_blueprint
from controllers.health_controller import health_blueprint
from controllers.heat_islands_controller import heat_islands_blueprint
from controllers.recycle_controller import recycle_blueprint
from controllers.report_controller import reports_blueprint
from controllers.request_controller import requests_blueprint
from controllers.shade_controller import shade_blueprint
from controllers.user_controller import user_blueprint
from models.adoption_model import AdoptionModel
from models.report_model import ReportModel
from models.request_model import RequestModel
from models.user_model import UserModel


load_dotenv()


HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8000"))


def create_app() -> Flask:
    """Create a configured application and initialize persistent storage."""
    base_dir = Path(__file__).resolve().parent.parent
    react_dist = base_dir / "frontend-react" / "dist"
    svelte_dist = base_dir / "frontend" / "dist"
    static_dir = react_dist if (react_dist / "index.html").exists() else svelte_dist

    app = Flask(
        __name__,
        template_folder="views/templates",
        static_folder=str(static_dir),
        static_url_path="",
    )
    app.config["MAX_CONTENT_LENGTH"] = 5_000_000

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
            response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
            return response

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        return response

    @app.route("/assets/<path:filename>")
    def serve_assets(filename):
        assets_dir = Path(app.static_folder) / "assets"
        return send_from_directory(assets_dir, filename)

    @app.route("/manifest.json")
    def serve_manifest():
        return send_from_directory(Path(app.static_folder), "manifest.json")

    for blueprint in (
        reports_blueprint,
        adoptions_blueprint,
        health_blueprint,
        climate_blueprint,
        shade_blueprint,
        recycle_blueprint,
        ai_blueprint,
        heat_islands_blueprint,
        requests_blueprint,
        user_blueprint,
    ):
        app.register_blueprint(blueprint)

    # Initialization also runs when the app is loaded by Gunicorn on Render.
    with app.app_context():
        ReportModel.initialize_database()
        AdoptionModel.initialize_database()
        RequestModel.initialize_database()
        UserModel.initialize_database()

    return app


app = create_app()


def local_ip() -> str:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("192.0.2.1", 80))
            return sock.getsockname()[0]
    except OSError:
        return "IP-DO-COMPUTADOR"


if __name__ == "__main__":
    print("Sombrinha iniciado.")
    print(f"Aplicação disponível neste computador: http://localhost:{PORT}")
    print(f"Para testar no celular na mesma rede Wi-Fi: http://{local_ip()}:{PORT}")
    print("Pare o servidor com Ctrl+C.")
    app.run(host=HOST, port=PORT, debug=False, threaded=True)

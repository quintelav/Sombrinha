"""Application factory and local entry point for Sombrinha."""

import os
import socket

from flask import Flask
from dotenv import load_dotenv

from controllers.adoption_controller import adoptions_blueprint
from controllers.ai_controller import ai_blueprint
from controllers.climate_controller import climate_blueprint
from controllers.health_controller import health_blueprint
from controllers.recycle_controller import recycle_blueprint
from controllers.report_controller import reports_blueprint
from controllers.shade_controller import shade_blueprint
from models.adoption_model import AdoptionModel
from models.report_model import ReportModel


load_dotenv()


HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8000"))


def create_app() -> Flask:
    """Create a configured application and initialize persistent storage."""
    app = Flask(
        __name__,
        template_folder="views/templates",
        static_folder="static",
    )
    app.config["MAX_CONTENT_LENGTH"] = 50_000

    for blueprint in (
        reports_blueprint,
        adoptions_blueprint,
        health_blueprint,
        climate_blueprint,
        shade_blueprint,
        recycle_blueprint,
        ai_blueprint,
    ):
        app.register_blueprint(blueprint)

    # Initialization also runs when the app is loaded by Gunicorn on Render.
    with app.app_context():
        ReportModel.initialize_database()
        AdoptionModel.initialize_database()

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

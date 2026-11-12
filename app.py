"""Ponto de entrada da aplicação Sombrinha."""

import os
import socket

from flask import Flask

from controllers.report_controller import reports_blueprint
from models.report_model import ReportModel
from models.adoption_model import AdoptionModel


HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8000"))


def create_app() -> Flask:
    app = Flask(
        __name__,
        template_folder="views/templates",
        static_folder="static",
    )
    app.config["MAX_CONTENT_LENGTH"] = 10_000
    app.register_blueprint(reports_blueprint)
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
    ReportModel.initialize_database()
    AdoptionModel.initialize_database()
    print(f"Aplicação disponível neste computador: http://localhost:{PORT}")
    print(f"Para testar no celular na mesma rede Wi-Fi: http://{local_ip()}:{PORT}")
    print("Pare o servidor com Ctrl+C.")
    app.run(host=HOST, port=PORT, debug=False, threaded=True)

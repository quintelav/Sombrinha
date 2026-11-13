"""Renderização da interface web."""

from pathlib import Path

from flask import current_app, render_template, send_from_directory


def render_home():
    build_directory = Path(current_app.static_folder or "frontend/dist")
    entrypoint = build_directory / "index.html"
    if not entrypoint.exists():
        return render_template("frontend_not_built.html"), 503
    return send_from_directory(build_directory, "index.html")

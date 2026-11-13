"""HTTP endpoint for current weather conditions in Recife."""

from flask import Blueprint, jsonify

from models.weather_model import (
    WeatherNotConfiguredError,
    WeatherProviderError,
    get_current_conditions,
)


climate_blueprint = Blueprint("climate", __name__)


@climate_blueprint.get("/api/climate/current")
def current_conditions():
    try:
        conditions = get_current_conditions()
    except WeatherNotConfiguredError:
        return jsonify({
            "status": "unconfigured",
            "error": "A integração climática ainda não foi configurada no servidor.",
        }), 503
    except WeatherProviderError as error:
        return jsonify({"status": "unavailable", "error": str(error)}), 502

    return jsonify({"status": "ok", "data": conditions})

"""Google Weather API adapter for Recife current conditions."""

import json
import os
import threading
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


WEATHER_ENDPOINT = "https://weather.googleapis.com/v1/currentConditions:lookup"
RECIFE_COORDINATES = {"latitude": -8.0476, "longitude": -34.8770}
CACHE_TTL_SECONDS = 600
REQUEST_TIMEOUT_SECONDS = 8

_cache_lock = threading.Lock()
_cached_conditions: dict[str, Any] | None = None
_cached_at = 0.0


def _expire_cache() -> None:
    """Delete the temporary API response after the configured cache period."""
    global _cached_conditions, _cached_at
    with _cache_lock:
        if _cached_conditions and time.monotonic() - _cached_at >= CACHE_TTL_SECONDS:
            _cached_conditions = None
            _cached_at = 0.0


class WeatherNotConfiguredError(Exception):
    """Raised when the server does not have a Google Weather API key."""


class WeatherProviderError(Exception):
    """Raised when Google Weather API cannot return current conditions."""


def _temperature_value(payload: dict[str, Any]) -> float | None:
    value = payload.get("degrees")
    return float(value) if isinstance(value, (int, float)) else None


def _normalize_response(payload: dict[str, Any]) -> dict[str, Any]:
    condition = payload.get("weatherCondition") or {}
    description = condition.get("description") or {}
    precipitation = payload.get("precipitation") or {}
    probability = precipitation.get("probability") or {}

    return {
        "location": "Recife, PE (referência no centro da cidade)",
        "latitude": RECIFE_COORDINATES["latitude"],
        "longitude": RECIFE_COORDINATES["longitude"],
        "temperature_c": _temperature_value(payload.get("temperature") or {}),
        "feels_like_c": _temperature_value(payload.get("feelsLikeTemperature") or {}),
        "heat_index_c": _temperature_value(payload.get("heatIndex") or {}),
        "condition": description.get("text"),
        "relative_humidity_percent": payload.get("relativeHumidity"),
        "uv_index": payload.get("uvIndex"),
        "precipitation_probability_percent": probability.get("percent"),
        "observed_at": payload.get("currentTime"),
        "time_zone": (payload.get("timeZone") or {}).get("id"),
        "source": "Google Weather API",
        "note": (
            "Condição meteorológica para uma coordenada de referência; não representa "
            "medição de temperatura de cada bairro ou ilha de calor urbana."
        ),
    }


def get_current_conditions() -> dict[str, Any]:
    """Fetch Recife current conditions, caching successful responses briefly."""
    global _cached_conditions, _cached_at

    api_key = os.environ.get("GOOGLE_WEATHER_API_KEY", "").strip()
    if not api_key:
        raise WeatherNotConfiguredError

    now = time.monotonic()
    with _cache_lock:
        if _cached_conditions and now - _cached_at < CACHE_TTL_SECONDS:
            return dict(_cached_conditions)

    params = {
        "key": api_key,
        "location.latitude": RECIFE_COORDINATES["latitude"],
        "location.longitude": RECIFE_COORDINATES["longitude"],
        "languageCode": "pt-BR",
        "unitsSystem": "METRIC",
    }
    request = Request(
        f"{WEATHER_ENDPOINT}?{urlencode(params)}",
        headers={"Accept": "application/json", "User-Agent": "Sombrinha/1.0"},
    )

    try:
        with urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            provider_payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code == 429:
            raise WeatherProviderError("A cota da API climática foi atingida.") from None
        raise WeatherProviderError(
            f"A API climática respondeu com HTTP {error.code}. Verifique a chave e a configuração no Google Cloud."
        ) from None
    except (URLError, TimeoutError, OSError, UnicodeDecodeError, json.JSONDecodeError):
        raise WeatherProviderError("Não foi possível consultar a API climática agora.") from None

    if not isinstance(provider_payload, dict):
        raise WeatherProviderError("A API climática retornou uma resposta inválida.")

    conditions = _normalize_response(provider_payload)
    with _cache_lock:
        _cached_conditions = conditions
        _cached_at = time.monotonic()
        expiry = threading.Timer(CACHE_TTL_SECONDS, _expire_cache)
        expiry.daemon = True
        expiry.start()
    return dict(conditions)

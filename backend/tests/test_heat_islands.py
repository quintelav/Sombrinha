def test_heat_islands_study(client):
    response = client.get("/api/heat-islands/study")
    assert response.status_code == 200
    data = response.get_json()
    assert data["sucesso"] is True
    assert len(data["dados"]["corredores_criticos_calor"]) >= 5
    assert len(data["dados"]["pontos_recomendados_alivio"]) >= 5


def test_heat_islands_proximity_in_center(client):
    # Coordenadas próximas à Conde da Boa Vista (-8.0601, -34.8876)
    response = client.post(
        "/api/heat-islands/proximity",
        json={"latitude": -8.0601, "longitude": -34.8876},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["sucesso"] is True
    assert data["dados"]["esta_no_centro"] is True
    assert data["dados"]["status_movimento"] == "NO_CENTRO"
    assert "Você está no Centro do Recife" in data["dados"]["notificacao_proativa"]["titulo"]
    assert len(data["dados"]["pontos_frescor_proximos"]) > 0


def test_heat_islands_proximity_approaching(client):
    # Coordenadas em Casa Forte (~4km do centro)
    response = client.post(
        "/api/heat-islands/proximity",
        json={"latitude": -8.0345, "longitude": -34.9189},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["sucesso"] is True
    assert data["dados"]["esta_no_centro"] is False
    assert data["dados"]["status_movimento"] == "APROXIMANDO_DO_CENTRO"


def test_home_page_serves_frontend_index(client, tmp_path):
    frontend_dir = tmp_path / "frontend"
    frontend_dir.mkdir()
    (frontend_dir / "index.html").write_text(
        "<!doctype html><title>Sombrinha</title>", encoding="utf-8"
    )
    client.application.static_folder = str(frontend_dir)

    response = client.get("/")
    assert response.status_code == 200
    assert b"Sombrinha" in response.data


def test_climate_current_with_resilient_fallback(client):
    response = client.get("/api/climate/current")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    weather = data["data"]
    assert "temperature_c" in weather
    assert "condition" in weather
    assert "heat_index_c" in weather


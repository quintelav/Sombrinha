"""Testes para o catálogo de pontos de sombra e paradas climatizadas com ar-condicionado."""

import pytest
from app import create_app
from models.shade_points_model import ShadePointsModel


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_list_all_reference_points(client):
    response = client.get("/api/reference-points")
    assert response.status_code == 200
    data = response.get_json()
    assert data["sucesso"] is True
    assert data["total"] > 0
    assert isinstance(data["dados"], list)


def test_list_bus_stops_with_ac(client):
    response = client.get("/api/reference-points?subtipo=onibus_ar")
    assert response.status_code == 200
    data = response.get_json()
    assert data["sucesso"] is True
    assert data["total"] >= 10
    
    # Valida se todos os pontos retornados são climatizados / ar-condicionado
    for ponto in data["dados"]:
        assert ponto["subtipo"] == "onibus_ar"
        assert ponto["climatizado"] is True
        assert ponto["ar_condicionado"] is True
        assert "latitude" in ponto and "longitude" in ponto


def test_shade_points_model_filtering():
    bus_points = ShadePointsModel.list_all(subtipo="onibus_ar")
    nomes = [p["nome"] for p in bus_points]
    assert any("Tacaruna" in nome for nome in nomes)
    assert any("RioMar" in nome for nome in nomes)
    assert any("Derby" in nome for nome in nomes)
    assert any("Soledade" in nome for nome in nomes)

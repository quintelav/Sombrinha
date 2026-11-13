def test_create_report_returns_created(client):
    response = client.post(
        "/api/reports",
        json={
            "neighborhood": "Boa Vista",
            "reference": "Praça Maciel Pinheiro",
            "kind": "quente_sem_sombra",
            "note": "Pouca sombra durante a tarde.",
            "latitude": -8.0611,
            "longitude": -34.8829,
        },
    )

    assert response.status_code == 201
    assert response.get_json() == {"ok": True}


def test_create_report_rejects_coordinates_outside_geographic_bounds(client):
    response = client.post(
        "/api/reports",
        json={
            "neighborhood": "Boa Vista",
            "reference": "Praça Maciel Pinheiro",
            "kind": "quente_sem_sombra",
            "latitude": -95,
            "longitude": -34.8829,
        },
    )

    assert response.status_code == 400
    assert response.get_json()["error"] == "As coordenadas do local são inválidas."

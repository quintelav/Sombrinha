def test_create_trade_returns_simulated_points_without_real_exchange(client):
    response = client.post(
        "/api/trades",
        json={"item_tipo": "garrafa_pet", "quantidade": 6},
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["dados"]["pontos_simulados"] == 30
    assert "Não houve entrega nem resgate de recompensa" in body["mensagem"]
    assert "sem entrega ou resgate real" in body["dados"]["status"].lower()

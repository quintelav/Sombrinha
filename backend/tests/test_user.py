"""Testes para o fluxo de autenticação e perfil de usuário do Sombrinha."""

import json
import pytest
from app import create_app
import models.user_model as user_model_module
from models.user_model import UserModel, USUARIOS_INICIAIS


@pytest.fixture
def client(tmp_path, monkeypatch):
    test_data_file = tmp_path / "test_usuarios.json"
    test_sessions_file = tmp_path / "test_sessoes.json"
    test_data_file.write_text(json.dumps(USUARIOS_INICIAIS, ensure_ascii=False, indent=2), encoding="utf-8")
    test_sessions_file.write_text(json.dumps([], ensure_ascii=False, indent=2), encoding="utf-8")

    monkeypatch.setattr(user_model_module, "DATA_FILE", test_data_file)
    monkeypatch.setattr(user_model_module, "SESSIONS_FILE", test_sessions_file)

    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_demo_users_listed(client):
    response = client.get("/api/auth/demo-users")
    assert response.status_code == 200
    data = response.get_json()
    assert data["sucesso"] is True
    assert len(data["demo_users"]) >= 1
    # Check that password hash is never exposed
    for u in data["demo_users"]:
        assert "password_hash" not in u
        assert "password" not in u


def test_login_demo_user(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "charles@sombrinha.recife.br", "password": "recife123"}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["sucesso"] is True
    assert data["user"]["name"] == "Charles Magno"
    assert data["token"]
    assert "password_hash" not in data["user"]


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "charles@sombrinha.recife.br", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    data = response.get_json()
    assert data["sucesso"] is False


def test_user_lifecycle(client):
    import time
    test_email = f"cidadao_{int(time.time() * 1000)}@sombrinha.pe.gov.br"

    # 1. Registro
    reg_res = client.post(
        "/api/auth/register",
        json={
            "name": "Maria Eduarda Freire",
            "email": test_email,
            "password": "senhaForte123",
            "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            "bio": "Voluntária de arborização urbana no Espinheiro",
            "bairro": "Espinheiro"
        }
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.get_json()
    assert reg_data["sucesso"] is True
    assert reg_data["user"]["name"] == "Maria Eduarda Freire"
    token = reg_data["token"]
    assert token

    # 2. Tentar registrar novamente com o mesmo e-mail (deve falhar)
    dup_res = client.post(
        "/api/auth/register",
        json={
            "name": "Outro Nome",
            "email": test_email,
            "password": "senhaForte123"
        }
    )
    assert dup_res.status_code == 400

    # 3. Consultar perfil logado (/api/auth/me)
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.get_json()
    assert me_data["user"]["email"] == test_email
    assert me_data["user"]["bairro"] == "Espinheiro"

    # 4. Atualizar perfil (editar nome, bio e foto)
    update_res = client.put(
        "/api/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Maria Eduarda F. Silva",
            "bio": "Coordenadora de hortas comunitárias na Tamarineira e Espinheiro",
            "bairro": "Tamarineira",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"
        }
    )
    assert update_res.status_code == 200
    update_data = update_res.get_json()
    assert update_data["user"]["name"] == "Maria Eduarda F. Silva"
    assert update_data["user"]["bairro"] == "Tamarineira"

    # 5. Sair da conta (Logout)
    logout_res = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_res.status_code == 200

    # 6. Acesso após logout deve ser negado (token revogado)
    after_logout_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert after_logout_res.status_code == 401

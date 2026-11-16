"""Controlador HTTP de autenticação e gestão de perfil de usuário."""

from functools import wraps
from flask import Blueprint, jsonify, request
from models.user_model import UserModel

user_blueprint = Blueprint("user", __name__)


def extract_token(req: request) -> str | None:
    """Extrai token do cabeçalho Authorization ou X-Auth-Token."""
    auth_header = req.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return req.headers.get("X-Auth-Token")


def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = extract_token(request)
        if not token:
            return jsonify({"sucesso": False, "erro": "Autenticação necessária. Faça login na sua conta."}), 401

        user = UserModel.verify_token(token)
        if not user:
            return jsonify({"sucesso": False, "erro": "Sessão expirada ou inválida. Por favor, faça login novamente."}), 401

        request.current_user = user
        request.current_token = token
        return f(*args, **kwargs)

    return decorated_function


@user_blueprint.post("/api/auth/register")
def register():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"sucesso": False, "erro": "Envie os dados de cadastro em formato JSON."}), 400

    name = payload.get("name")
    email = payload.get("email")
    password = payload.get("password")
    avatar = payload.get("avatar", "")
    bio = payload.get("bio", "")
    bairro = payload.get("bairro", "")

    try:
        user, token = UserModel.register(
            name=name,
            email=email,
            password=password,
            avatar=avatar,
            bio=bio,
            bairro=bairro
        )
        return jsonify({
            "sucesso": True,
            "mensagem": f"Bem-vindo(a) ao Sombrinha, {user['name']}! Sua conta foi criada com sucesso.",
            "token": token,
            "user": user,
        }), 201
    except ValueError as e:
        return jsonify({"sucesso": False, "erro": str(e)}), 400
    except Exception as e:
        return jsonify({"sucesso": False, "erro": "Falha interna ao criar conta. Tente novamente."}), 500


@user_blueprint.post("/api/auth/login")
def login():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"sucesso": False, "erro": "Envie o e-mail e a senha em formato JSON."}), 400

    email = payload.get("email")
    password = payload.get("password")

    try:
        user, token = UserModel.authenticate(email=email, password=password)
        return jsonify({
            "sucesso": True,
            "mensagem": f"Olá, {user['name']}! Login realizado com sucesso.",
            "token": token,
            "user": user,
        }), 200
    except ValueError as e:
        return jsonify({"sucesso": False, "erro": str(e)}), 401
    except Exception as e:
        return jsonify({"sucesso": False, "erro": "Falha interna ao autenticar. Tente novamente."}), 500


@user_blueprint.get("/api/auth/me")
@auth_required
def get_current_user():
    return jsonify({
        "sucesso": True,
        "user": request.current_user,
    }), 200


@user_blueprint.put("/api/auth/profile")
@auth_required
def update_profile():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"sucesso": False, "erro": "Envie os dados de perfil em formato JSON."}), 400

    user_id = request.current_user["id"]
    name = payload.get("name")
    email = payload.get("email")
    avatar = payload.get("avatar")
    bio = payload.get("bio")
    bairro = payload.get("bairro")
    current_password = payload.get("current_password")
    new_password = payload.get("new_password")

    try:
        updated_user = UserModel.update_profile(
            user_id=user_id,
            name=name,
            email=email,
            avatar=avatar,
            bio=bio,
            bairro=bairro,
            current_password=current_password,
            new_password=new_password
        )
        return jsonify({
            "sucesso": True,
            "mensagem": "Perfil e dados da conta atualizados com sucesso!",
            "user": updated_user,
        }), 200
    except ValueError as e:
        return jsonify({"sucesso": False, "erro": str(e)}), 400
    except Exception as e:
        return jsonify({"sucesso": False, "erro": "Falha interna ao atualizar perfil."}), 500


@user_blueprint.post("/api/auth/logout")
def logout():
    token = extract_token(request)
    if token:
        UserModel.revoke_token(token)

    return jsonify({
        "sucesso": True,
        "mensagem": "Você saiu da sua conta com sucesso.",
    }), 200


@user_blueprint.get("/api/auth/demo-users")
def get_demo_users():
    """Retorna contas demonstrativas para facilitar testes durante a apresentação."""
    from models.user_model import USUARIOS_INICIAIS
    public_demos = [
        {
            "id": u["id"],
            "name": u["name"],
            "email": u["email"],
            "avatar": u["avatar"],
            "bio": u["bio"],
            "bairro": u["bairro"],
        }
        for u in USUARIOS_INICIAIS
    ]
    return jsonify({
        "sucesso": True,
        "demo_users": public_demos,
    }), 200

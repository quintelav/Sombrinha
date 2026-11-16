"""Modelo de Usuário para autenticação, perfil e dados cadastrais no Sombrinha."""

import json
import os
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "usuarios.json"
SESSIONS_FILE = Path(__file__).resolve().parents[1] / "data" / "sessoes.json"
LOCK = threading.Lock()

SECRET_KEY = os.environ.get("SECRET_KEY", "sombrinha-recife-segredo-civico-2026")
TOKEN_SERIALIZER = URLSafeTimedSerializer(SECRET_KEY, salt="sombrinha-user-auth")
TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 dias

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Usuários iniciais de demonstração (Recife)
USUARIOS_INICIAIS = [
    {
        "id": "usr-demo-maria",
        "name": "Maria Barreto",
        "email": "maria.barreto@sombrinha.recife.br",
        "password_hash": generate_password_hash("recife123"),
        "avatar": "https://upload.wikimedia.org/wikipedia/commons/7/7c/%281920-1977%29_Clarice_Lispector_6zxkp_please_credit%28palette.fm%29_%28cropped%29.png",
        "bio": "Desenvolvedora de software e pesquisadora cívica do projeto Sombrinha Recife no Hackathon Antena na Lama.",
        "bairro": "Boa Vista",
        "cargo": "Desenvolvedora",
        "created_at": "2026-11-12T09:00:00Z",
        "updated_at": "2026-11-12T09:00:00Z",
    },
    {
        "id": "usr-demo-charles",
        "name": "Charles Magno",
        "email": "charles@sombrinha.recife.br",
        "password_hash": generate_password_hash("recife123"),
        "avatar": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Chico_Science_%26_Na%C3%A7%C3%A3o_Zumbi_turn%C3%AA_nos_Estados_Unidos_%28cropped_2%29.jpg/330px-Chico_Science_%26_Na%C3%A7%C3%A3o_Zumbi_turn%C3%AA_nos_Estados_Unidos_%28cropped_2%29.jpg",
        "bio": "Validador comunitário do Movimento Pró-Criança e ativista da mobilidade a pé no Recife.",
        "bairro": "Boa Vista",
        "created_at": "2026-11-12T10:00:00Z",
        "updated_at": "2026-11-12T10:00:00Z",
    },
    {
        "id": "usr-demo-severino",
        "name": "Severino Ramos",
        "email": "severino@sombrinha.recife.br",
        "password_hash": generate_password_hash("recife123"),
        "avatar": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Luiz_Gonzaga_1988.png/330px-Luiz_Gonzaga_1988.png",
        "bio": "Vendedor ambulante no Centro do Recife e usuário ativo dos bebedouros públicos.",
        "bairro": "São José",
        "created_at": "2026-11-13T08:30:00Z",
        "updated_at": "2026-11-13T08:30:00Z",
    }
]


class UserModel:
    """Operações de dados para contas de usuários e perfis."""

    @classmethod
    def _database_url(cls) -> str | None:
        url = os.environ.get("DATABASE_URL")
        if url and url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    @classmethod
    def _connect(cls):
        import psycopg
        return psycopg.connect(cls._database_url())

    @classmethod
    def initialize_database(cls) -> None:
        """Cria tabelas se PostgreSQL ou inicializa arquivo JSON local."""
        if cls._database_url():
            with cls._connect() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        avatar TEXT NOT NULL DEFAULT '',
                        bio TEXT NOT NULL DEFAULT '',
                        bairro TEXT NOT NULL DEFAULT '',
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    );
                    CREATE TABLE IF NOT EXISTS revoked_tokens (
                        token TEXT PRIMARY KEY,
                        revoked_at TEXT NOT NULL
                    );
                """)
                # Insere os usuários demo caso a tabela esteja vazia
                count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
                if count == 0:
                    for u in USUARIOS_INICIAIS:
                        conn.execute("""
                            INSERT INTO users (id, name, email, password_hash, avatar, bio, bairro, created_at, updated_at)
                            VALUES (%(id)s, %(name)s, %(email)s, %(password_hash)s, %(avatar)s, %(bio)s, %(bairro)s, %(created_at)s, %(updated_at)s)
                        """, u)
            return

        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        with LOCK:
            if not DATA_FILE.exists():
                DATA_FILE.write_text(json.dumps(USUARIOS_INICIAIS, ensure_ascii=False, indent=2), encoding="utf-8")
            if not SESSIONS_FILE.exists():
                SESSIONS_FILE.write_text(json.dumps([], ensure_ascii=False, indent=2), encoding="utf-8")

    @classmethod
    def _read_users_json(cls) -> list[dict]:
        if not DATA_FILE.exists():
            return [dict(u) for u in USUARIOS_INICIAIS]
        try:
            content = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            return content if isinstance(content, list) else [dict(u) for u in USUARIOS_INICIAIS]
        except (OSError, json.JSONDecodeError):
            return [dict(u) for u in USUARIOS_INICIAIS]

    @classmethod
    def _save_users_json(cls, users: list[dict]) -> None:
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        temp = DATA_FILE.with_suffix(".tmp")
        temp.write_text(json.dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")
        temp.replace(DATA_FILE)

    @classmethod
    def _to_public_dict(cls, user: dict) -> dict:
        """Remove campos sensíveis como o hash de senha."""
        return {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "avatar": user.get("avatar", ""),
            "bio": user.get("bio", ""),
            "bairro": user.get("bairro", ""),
            "created_at": user["created_at"],
            "updated_at": user.get("updated_at", user["created_at"]),
        }

    @classmethod
    def get_by_id(cls, user_id: str, include_password: bool = False) -> dict | None:
        if cls._database_url():
            with cls._connect() as conn:
                row = conn.execute("""
                    SELECT id, name, email, password_hash, avatar, bio, bairro, created_at, updated_at
                    FROM users WHERE id = %s
                """, (user_id,)).fetchone()
                if not row:
                    return None
                u = {
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "password_hash": row[3],
                    "avatar": row[4],
                    "bio": row[5],
                    "bairro": row[6],
                    "created_at": row[7],
                    "updated_at": row[8],
                }
                return u if include_password else cls._to_public_dict(u)

        users = cls._read_users_json()
        for u in users:
            if u["id"] == user_id:
                return dict(u) if include_password else cls._to_public_dict(u)
        return None

    @classmethod
    def get_by_email(cls, email: str, include_password: bool = False) -> dict | None:
        email_clean = (email or "").strip().lower()
        if not email_clean:
            return None

        if cls._database_url():
            with cls._connect() as conn:
                row = conn.execute("""
                    SELECT id, name, email, password_hash, avatar, bio, bairro, created_at, updated_at
                    FROM users WHERE LOWER(email) = %s
                """, (email_clean,)).fetchone()
                if not row:
                    return None
                u = {
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "password_hash": row[3],
                    "avatar": row[4],
                    "bio": row[5],
                    "bairro": row[6],
                    "created_at": row[7],
                    "updated_at": row[8],
                }
                return u if include_password else cls._to_public_dict(u)

        users = cls._read_users_json()
        for u in users:
            if u["email"].lower() == email_clean:
                return dict(u) if include_password else cls._to_public_dict(u)
        return None

    @classmethod
    def register(cls, name: str, email: str, password: str, avatar: str = "", bio: str = "", bairro: str = "") -> tuple[dict, str]:
        """Valida e cria uma nova conta de usuário."""
        name = (name or "").strip()
        email = (email or "").strip().lower()
        password = password or ""
        avatar = (avatar or "").strip()
        bio = (bio or "").strip()
        bairro = (bairro or "").strip()

        if len(name) < 2:
            raise ValueError("O nome deve ter no mínimo 2 caracteres.")
        if not EMAIL_REGEX.match(email):
            raise ValueError("Informe um endereço de e-mail válido.")
        if len(password) < 6:
            raise ValueError("A senha deve conter pelo menos 6 caracteres.")

        with LOCK:
            existing = cls.get_by_email(email)
            if existing:
                raise ValueError("Este e-mail já está cadastrado. Faça login ou use outro e-mail.")

            now = datetime.now(timezone.utc).isoformat()
            user_id = f"usr-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
            hashed = generate_password_hash(password)

            new_user = {
                "id": user_id,
                "name": name,
                "email": email,
                "password_hash": hashed,
                "avatar": avatar,
                "bio": bio,
                "bairro": bairro,
                "created_at": now,
                "updated_at": now,
            }

            if cls._database_url():
                with cls._connect() as conn:
                    conn.execute("""
                        INSERT INTO users (id, name, email, password_hash, avatar, bio, bairro, created_at, updated_at)
                        VALUES (%(id)s, %(name)s, %(email)s, %(password_hash)s, %(avatar)s, %(bio)s, %(bairro)s, %(created_at)s, %(updated_at)s)
                    """, new_user)
            else:
                users = cls._read_users_json()
                users.append(new_user)
                cls._save_users_json(users)

        token = cls.generate_token(user_id)
        return cls._to_public_dict(new_user), token

    @classmethod
    def authenticate(cls, email: str, password: str) -> tuple[dict, str]:
        """Autentica o usuário com e-mail e senha."""
        email_clean = (email or "").strip().lower()
        password = password or ""

        if not email_clean or not password:
            raise ValueError("Informe o e-mail e a senha.")

        user = cls.get_by_email(email_clean, include_password=True)
        if not user or not check_password_hash(user["password_hash"], password):
            raise ValueError("E-mail ou senha incorretos.")

        token = cls.generate_token(user["id"])
        return cls._to_public_dict(user), token

    @classmethod
    def update_profile(
        cls,
        user_id: str,
        name: str | None = None,
        email: str | None = None,
        avatar: str | None = None,
        bio: str | None = None,
        bairro: str | None = None,
        current_password: str | None = None,
        new_password: str | None = None
    ) -> dict:
        """Atualiza os dados cadastrais e foto do usuário."""
        with LOCK:
            user = cls.get_by_id(user_id, include_password=True)
            if not user:
                raise ValueError("Usuário não encontrado.")

            updated = False
            now = datetime.now(timezone.utc).isoformat()

            if name is not None:
                clean_name = name.strip()
                if len(clean_name) < 2:
                    raise ValueError("O nome deve ter pelo menos 2 caracteres.")
                user["name"] = clean_name
                updated = True

            if email is not None:
                clean_email = email.strip().lower()
                if not EMAIL_REGEX.match(clean_email):
                    raise ValueError("Informe um endereço de e-mail válido.")
                if clean_email != user["email"].lower():
                    existing = cls.get_by_email(clean_email)
                    if existing and existing["id"] != user_id:
                        raise ValueError("Este e-mail já está sendo utilizado por outra conta.")
                    user["email"] = clean_email
                    updated = True

            if avatar is not None:
                user["avatar"] = avatar.strip()
                updated = True

            if bio is not None:
                user["bio"] = bio.strip()
                updated = True

            if bairro is not None:
                user["bairro"] = bairro.strip()
                updated = True

            if new_password:
                if len(new_password) < 6:
                    raise ValueError("A nova senha deve ter no mínimo 6 caracteres.")
                if not current_password or not check_password_hash(user["password_hash"], current_password):
                    raise ValueError("Senha atual incorreta para alteração de senha.")
                user["password_hash"] = generate_password_hash(new_password)
                updated = True

            if updated:
                user["updated_at"] = now
                if cls._database_url():
                    with cls._connect() as conn:
                        conn.execute("""
                            UPDATE users
                            SET name = %(name)s,
                                email = %(email)s,
                                password_hash = %(password_hash)s,
                                avatar = %(avatar)s,
                                bio = %(bio)s,
                                bairro = %(bairro)s,
                                updated_at = %(updated_at)s
                            WHERE id = %(id)s
                        """, user)
                else:
                    users = cls._read_users_json()
                    for idx, u in enumerate(users):
                        if u["id"] == user_id:
                            users[idx] = user
                            break
                    cls._save_users_json(users)

            return cls._to_public_dict(user)

    @classmethod
    def generate_token(cls, user_id: str) -> str:
        """Gera um token criptográfico seguro contendo o id do usuário."""
        return TOKEN_SERIALIZER.dumps({"user_id": user_id})

    @classmethod
    def verify_token(cls, token: str) -> dict | None:
        """Decodifica e verifica a validade do token de sessão."""
        if not token:
            return None

        # Verifica se o token foi revogado
        if cls.is_token_revoked(token):
            return None

        try:
            data = TOKEN_SERIALIZER.loads(token, max_age=TOKEN_MAX_AGE)
            user_id = data.get("user_id")
            if not user_id:
                return None
            return cls.get_by_id(user_id)
        except (SignatureExpired, BadSignature, Exception):
            return None

    @classmethod
    def revoke_token(cls, token: str) -> None:
        """Revoga um token no logout."""
        if not token:
            return

        now = datetime.now(timezone.utc).isoformat()
        if cls._database_url():
            with cls._connect() as conn:
                conn.execute("""
                    INSERT INTO revoked_tokens (token, revoked_at)
                    VALUES (%s, %s) ON CONFLICT DO NOTHING
                """, (token, now))
            return

        with LOCK:
            if not SESSIONS_FILE.exists():
                revoked = []
            else:
                try:
                    revoked = json.loads(SESSIONS_FILE.read_text(encoding="utf-8"))
                    if not isinstance(revoked, list):
                        revoked = []
                except (OSError, json.JSONDecodeError):
                    revoked = []

            if token not in revoked:
                revoked.append(token)
                # Mantém no máximo os 1000 tokens revogados mais recentes
                if len(revoked) > 1000:
                    revoked = revoked[-1000:]
                temp = SESSIONS_FILE.with_suffix(".tmp")
                temp.write_text(json.dumps(revoked, ensure_ascii=False, indent=2), encoding="utf-8")
                temp.replace(SESSIONS_FILE)

    @classmethod
    def is_token_revoked(cls, token: str) -> bool:
        if not token:
            return True

        if cls._database_url():
            with cls._connect() as conn:
                row = conn.execute("SELECT token FROM revoked_tokens WHERE token = %s", (token,)).fetchone()
                return row is not None

        if not SESSIONS_FILE.exists():
            return False

        try:
            revoked = json.loads(SESSIONS_FILE.read_text(encoding="utf-8"))
            return token in revoked if isinstance(revoked, list) else False
        except (OSError, json.JSONDecodeError):
            return False

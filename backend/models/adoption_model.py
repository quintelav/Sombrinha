"""Cadastro de pontos comunitários e compromissos voluntários de adoção."""

import json
import math
import os
import threading
from datetime import datetime, timezone
from pathlib import Path


DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "adocoes.json"
LOCK = threading.Lock()
KINDS = {"refresco": "Ponto de refresco", "onibus": "Ponto de ônibus", "area_verde": "Área verde"}


class AdoptionModel:
    @classmethod
    def _database_url(cls):
        url = os.environ.get("DATABASE_URL")
        return url.replace("postgres://", "postgresql://", 1) if url and url.startswith("postgres://") else url

    @classmethod
    def _connect(cls):
        import psycopg
        return psycopg.connect(cls._database_url())

    @classmethod
    def initialize_database(cls):
        if not cls._database_url():
            return
        with cls._connect() as connection:
            connection.execute("""CREATE TABLE IF NOT EXISTS community_adoptions (
                id BIGSERIAL PRIMARY KEY, kind TEXT NOT NULL, name TEXT NOT NULL,
                organization TEXT NOT NULL, reference TEXT NOT NULL,
                latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL,
                commitment TEXT NOT NULL, hours TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'Proposta recebida', created_at TEXT NOT NULL
            )""")

    @classmethod
    def all(cls):
        if cls._database_url():
            with cls._connect() as connection:
                rows = connection.execute("""SELECT kind,name,organization,reference,latitude,longitude,
                    commitment,hours,status,created_at FROM community_adoptions ORDER BY id DESC""").fetchall()
            fields = ("kind","name","organization","reference","latitude","longitude","commitment","hours","status","created_at")
            return [dict(zip(fields, row)) for row in rows]
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        try:
            content = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            return content if isinstance(content, list) else []
        except (OSError, json.JSONDecodeError):
            return []

    @classmethod
    def create(cls, payload):
        kind = str(payload.get("kind", "")).strip()
        name = str(payload.get("name", "")).strip()
        organization = str(payload.get("organization", "")).strip()
        reference = str(payload.get("reference", "")).strip()
        commitment = str(payload.get("commitment", "")).strip()
        hours = str(payload.get("hours", "")).strip()
        try:
            lat, lon = float(payload.get("latitude")), float(payload.get("longitude"))
        except (TypeError, ValueError):
            raise ValueError("Marque a localização aproximada no mapa.")
        if kind not in KINDS:
            raise ValueError("Escolha o tipo de local.")
        if not name or len(name) > 80 or not organization or len(organization) > 100:
            raise ValueError("Informe o nome do local e da organização (até 100 caracteres).")
        if not reference or len(reference) > 80 or not commitment or len(commitment) > 300:
            raise ValueError("Informe uma referência pública e o compromisso proposto.")
        if not math.isfinite(lat) or not math.isfinite(lon) or not -90 <= lat <= 90 or not -180 <= lon <= 180:
            raise ValueError("As coordenadas são inválidas.")
        if len(hours) > 100:
            raise ValueError("Os horários podem ter até 100 caracteres.")
        item = {"kind":kind,"name":name,"organization":organization,"reference":reference,
            "latitude":lat,"longitude":lon,"commitment":commitment,"hours":hours,
            "status":"Proposta recebida","created_at":datetime.now(timezone.utc).isoformat()}
        with LOCK:
            if cls._database_url():
                with cls._connect() as connection:
                    connection.execute("""INSERT INTO community_adoptions
                    (kind,name,organization,reference,latitude,longitude,commitment,hours,status,created_at)
                    VALUES (%(kind)s,%(name)s,%(organization)s,%(reference)s,%(latitude)s,%(longitude)s,
                    %(commitment)s,%(hours)s,%(status)s,%(created_at)s)""", item)
            else:
                items = cls.all()
                items.append(item)
                temp = DATA_FILE.with_suffix(".tmp")
                temp.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
                temp.replace(DATA_FILE)

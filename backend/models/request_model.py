"""Modelo para solicitações de melhorias e pedidos de alterações em pontos de ajuda."""

import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path


DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "pedidos.json"
LOCK = threading.Lock()

TIPOS_PEDIDO = {
    "novo_bebedouro": "Instalação de Novo Bebedouro Público",
    "manutencao_bebedouro": "Manutenção ou Conserto em Bebedouro",
    "plantio_arvore": "Plantio de Árvores / Ampliação de Sombra",
    "marquise_banco": "Instalação de Marquise ou Banco Sombreado",
    "outro": "Outra Melhoria Comunitária",
}

PEDIDOS_INICIAIS = [
    {
        "id": "ped-1",
        "tipo": "manutencao_bebedouro",
        "tipo_label": "Manutenção ou Conserto em Bebedouro",
        "local_referencia": "Bebedouro Público & Névoa BRT Soledade",
        "bairro": "Boa Vista",
        "solicitante": "Severino (Vendedor Ambulante)",
        "descricao": "Bico de água com vazão fraca no período da tarde, precisa de desobstrução do filtro.",
        "status": "Em análise pela Emlurb",
        "created_at": "2026-11-12T14:30:00Z",
    },
    {
        "id": "ped-2",
        "tipo": "novo_bebedouro",
        "tipo_label": "Instalação de Novo Bebedouro Público",
        "local_referencia": "Terminal Integrado Cais de Santa Rita (Próximo à Plataforma B)",
        "bairro": "São José",
        "solicitante": "Coletivo de Passageiros do Centro",
        "descricao": "Forte calor nas paradas externas, passageiros aguardam no sol sem nenhum ponto de água gratuito.",
        "status": "Recebido pela comunidade",
        "created_at": "2026-11-13T09:15:00Z",
    },
    {
        "id": "ped-3",
        "tipo": "plantio_arvore",
        "tipo_label": "Plantio de Árvores / Ampliação de Sombra",
        "local_referencia": "Avenida Dantas Barreto, canteiro central em frente ao Camelódromo",
        "bairro": "Santo Antônio",
        "solicitante": "Associação de Moradores e Trabalhadores do Centro",
        "descricao": "Canteiro muito exposto ao sol direto, sugerimos plantio de mudas nativas com copa larga (ipês e sibipirunas).",
        "status": "Encaminhado para Adoção",
        "created_at": "2026-11-13T11:45:00Z",
    },
]


class RequestModel:
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
            connection.execute("""CREATE TABLE IF NOT EXISTS community_requests (
                id BIGSERIAL PRIMARY KEY,
                tipo TEXT NOT NULL,
                tipo_label TEXT NOT NULL,
                local_referencia TEXT NOT NULL,
                bairro TEXT NOT NULL,
                solicitante TEXT NOT NULL,
                descricao TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Recebido',
                created_at TEXT NOT NULL
            )""")

    @classmethod
    def all(cls):
        if cls._database_url():
            with cls._connect() as connection:
                rows = connection.execute("""SELECT id, tipo, tipo_label, local_referencia,
                    bairro, solicitante, descricao, status, created_at
                    FROM community_requests ORDER BY id DESC""").fetchall()
            fields = ("id", "tipo", "tipo_label", "local_referencia", "bairro", "solicitante", "descricao", "status", "created_at")
            return [dict(zip(fields, row)) for row in rows]

        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        if not DATA_FILE.exists():
            DATA_FILE.write_text(json.dumps(PEDIDOS_INICIAIS, ensure_ascii=False, indent=2), encoding="utf-8")
            return PEDIDOS_INICIAIS

        try:
            content = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            return content if isinstance(content, list) else PEDIDOS_INICIAIS
        except (OSError, json.JSONDecodeError):
            return PEDIDOS_INICIAIS

    @classmethod
    def create(cls, payload):
        tipo = str(payload.get("tipo", "outro")).strip()
        local_ref = str(payload.get("local_referencia", "")).strip()
        bairro = str(payload.get("bairro", "")).strip()
        solicitante = str(payload.get("solicitante", "Cidadão do Recife")).strip() or "Cidadão do Recife"
        descricao = str(payload.get("descricao", "")).strip()

        if not local_ref or len(local_ref) < 3:
            raise ValueError("Informe o ponto de ajuda ou rua de referência.")
        if not descricao or len(descricao) < 5:
            raise ValueError("Descreva o pedido ou alteração necessária.")

        tipo_label = TIPOS_PEDIDO.get(tipo, "Outra Melhoria Comunitária")
        item = {
            "id": f"ped-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
            "tipo": tipo,
            "tipo_label": tipo_label,
            "local_referencia": local_ref,
            "bairro": bairro or "Centro",
            "solicitante": solicitante,
            "descricao": descricao,
            "status": "Recebido pela comunidade",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        with LOCK:
            if cls._database_url():
                with cls._connect() as connection:
                    connection.execute("""INSERT INTO community_requests
                    (tipo, tipo_label, local_referencia, bairro, solicitante, descricao, status, created_at)
                    VALUES (%(tipo)s, %(tipo_label)s, %(local_referencia)s, %(bairro)s, %(solicitante)s, %(descricao)s, %(status)s, %(created_at)s)""", item)
            else:
                items = cls.all()
                items.insert(0, item)
                temp = DATA_FILE.with_suffix(".tmp")
                temp.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
                temp.replace(DATA_FILE)

        return item

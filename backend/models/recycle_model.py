"""Store simulated recycling exchanges for the prototype."""

import json
import threading
from datetime import datetime, timezone
from pathlib import Path


DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "trocas.json"
DATA_LOCK = threading.Lock()

REWARDS = {
    "agua_mineral": {"nome": "Água mineral", "pontos": 30},
    "protetor_solar": {"nome": "Protetor solar", "pontos": 20},
}

POINTS_BY_ITEM = {"garrafa_pet": 5, "latinha": 6, "vidro": 4}
MAX_QUANTITY = 50


class RecycleModel:
    """Record a local simulation; this does not confirm a real-world exchange."""

    @classmethod
    def _read_storage(cls) -> list[dict]:
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        if not DATA_FILE.exists():
            return []
        try:
            data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise RuntimeError("Não foi possível ler os registros de demonstração.") from error
        if not isinstance(data, list):
            raise RuntimeError("O arquivo de registros tem um formato inválido.")
        return data

    @classmethod
    def _write_storage(cls, records: list[dict]) -> None:
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        temp_file = DATA_FILE.with_suffix(".tmp")
        temp_file.write_text(
            json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        temp_file.replace(DATA_FILE)

    @classmethod
    def create_trade(cls, payload: dict) -> dict:
        item_type = payload.get("item_tipo")
        if not isinstance(item_type, str) or item_type not in POINTS_BY_ITEM:
            raise ValueError("Escolha um material disponível no catálogo.")

        raw_quantity = payload.get("quantidade")
        if isinstance(raw_quantity, bool):
            raise ValueError("A quantidade deve ser um número inteiro entre 1 e 50.")
        try:
            quantity = int(raw_quantity)
        except (TypeError, ValueError):
            raise ValueError("A quantidade deve ser um número inteiro entre 1 e 50.")
        if str(raw_quantity).strip() != str(quantity) or not 1 <= quantity <= MAX_QUANTITY:
            raise ValueError("A quantidade deve ser um número inteiro entre 1 e 50.")

        points_earned = POINTS_BY_ITEM[item_type] * quantity
        suggested_reward = None
        if points_earned >= REWARDS["agua_mineral"]["pontos"]:
            suggested_reward = REWARDS["agua_mineral"]["nome"]
        elif points_earned >= REWARDS["protetor_solar"]["pontos"]:
            suggested_reward = REWARDS["protetor_solar"]["nome"]

        record = {
            "id": f"demo-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
            "item_tipo": item_type,
            "quantidade": quantity,
            "pontos_simulados": points_earned,
            "recompensa_sugerida": suggested_reward,
            "status": "Simulação; sem entrega ou resgate real",
            "impacto_estimado": (
                f"{quantity} unidade(s) registradas; origem e destinação não verificadas"
            ),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        with DATA_LOCK:
            records = cls._read_storage()
            records.insert(0, record)
            cls._write_storage(records)

        return record

    @classmethod
    def list_trades(cls) -> list[dict]:
        with DATA_LOCK:
            return cls._read_storage()

    @classmethod
    def get_catalog(cls) -> dict:
        return {
            "demonstracao": True,
            "aviso": "Pontos e recompensas são ilustrativos; não representam crédito ou benefício disponível.",
            "tabela_pontos": POINTS_BY_ITEM,
            "recompensas": REWARDS,
        }

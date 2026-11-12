"""Transparent, local keyword rules used by the assistant prototype."""


class AIModel:
    """Provide simple text classification, without claiming live AI or data."""

    @staticmethod
    def analyze_voice_text(text: str) -> dict[str, str]:
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Texto para análise é obrigatório.")

        normalized = text.casefold()
        if any(word in normalized for word in ("sede", "água", "agua", "bebedouro", "beber")):
            category = "AGUA_POTAVEL"
            response = "Entendi que você procura água. Este protótipo não confirma quais pontos estão abertos ou abastecidos."
            recommendation = "Confirme a disponibilidade com o local antes de se deslocar."
        elif any(word in normalized for word in ("calor", "sol", "sombra", "quente")):
            category = "CONFORTO_TERMICO"
            response = "Entendi que o calor ou a falta de sombra preocupa você. Consulte os relatos comunitários no mapa."
            recommendation = "Os relatos não são medições de temperatura nem avaliação oficial de risco."
        elif any(word in normalized for word in ("recicl", "garrafa", "pet", "latinha", "lixo")):
            category = "RECICLAGEM_SOLIDARIA"
            response = "Entendi que o assunto é reciclagem. O cadastro de trocas desta demonstração não confirma coleta ou recompensa real."
            recommendation = "Verifique a existência e o funcionamento do ecoponto diretamente com o responsável."
        else:
            category = "GERAL"
            response = "Posso classificar palavras relacionadas a calor, água, sombra e reciclagem."
            recommendation = "Use o mapa como referência comunitária e confirme informações antes de agir."

        return {
            "texto_original": text,
            "categoria": category,
            "resposta_voz": response,
            "recomendacao": recommendation,
            "modelo": "Regras locais por palavras-chave; sem modelo externo ou dados em tempo real",
        }

    @staticmethod
    def suggest_shade_route(origin: str, destination: str) -> dict[str, object]:
        """Return an explicit demo notice until a routing data source is integrated."""
        return {
            "origem": origin,
            "destino": destination,
            "status": "demonstracao",
            "rota_sugerida": None,
            "aviso": (
                "O Sombrinha ainda não calcula rotas nem mede cobertura de sombra. "
                "Não use esta demonstração para escolher um trajeto."
            ),
        }

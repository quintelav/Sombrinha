"""Seed points for the map prototype; none are verified live services."""

VERIFIED_POINTS = [
    {
        "id": "pt-1",
        "nome": "Parque Treze de Maio (referência demonstrativa)",
        "tipo": "sombra",
        "bairro": "Santo Amaro",
        "rpa": "1",
        "endereco": "Rua do Hospício, Santo Amaro",
        "latitude": -8.0583,
        "longitude": -34.8819,
        "descricao": "Validar no local a cobertura de sombra, os bancos, o acesso e as condições atuais.",
    },
    {
        "id": "pt-2",
        "nome": "Trecho da Av. Conde da Boa Vista (referência demonstrativa)",
        "tipo": "sombra",
        "bairro": "Boa Vista",
        "rpa": "1",
        "endereco": "Av. Conde da Boa Vista",
        "latitude": -8.0601,
        "longitude": -34.8876,
        "descricao": "Validar a existência e continuidade de áreas cobertas e o acesso para pedestres.",
    },
    {
        "id": "pt-3",
        "nome": "Parque Dona Lindu (confirmar ponto de água)",
        "tipo": "bebedouro",
        "bairro": "Boa Viagem",
        "rpa": "6",
        "endereco": "Av. Boa Viagem, s/n",
        "latitude": -8.1425,
        "longitude": -34.9038,
        "descricao": "A existência, potabilidade, funcionamento e gratuidade de ponto de água não foram confirmados.",
    },
    {
        "id": "pt-4",
        "nome": "Marco Zero (confirmar ponto de coleta)",
        "tipo": "ecoponto",
        "bairro": "Bairro do Recife",
        "rpa": "1",
        "endereco": "Praça Barão do Rio Branco",
        "latitude": -8.0631,
        "longitude": -34.8711,
        "descricao": "A existência de coleta e de qualquer programa de troca precisa ser confirmada com o responsável.",
    },
    {
        "id": "pt-5",
        "nome": "Compaz Dom Helder Câmara (confirmar serviços disponíveis)",
        "tipo": "refugio",
        "bairro": "Ilha Joana Bezerra",
        "rpa": "1",
        "endereco": "Rua Lourenço Cavalcanti",
        "latitude": -8.0772,
        "longitude": -34.8988,
        "descricao": "Horários, acessibilidade, água e serviços disponíveis precisam de confirmação direta.",
    },
    {
        "id": "pt-6",
        "nome": "Praça do Derby (referência demonstrativa)",
        "tipo": "sombra",
        "bairro": "Derby",
        "rpa": "3",
        "endereco": "Praça do Derby",
        "latitude": -8.0567,
        "longitude": -34.8998,
        "descricao": "Validar no local a cobertura de sombra, a acessibilidade e as condições atuais.",
    },
    {
        "id": "pt-7",
        "nome": "Largo da Paz, Afogados (confirmar ponto de coleta)",
        "tipo": "ecoponto",
        "bairro": "Afogados",
        "rpa": "5",
        "endereco": "Largo da Paz, Afogados",
        "latitude": -8.0792,
        "longitude": -34.9089,
        "descricao": "A existência, os materiais aceitos e os horários de coleta precisam de confirmação.",
    },
]


class ShadePointsModel:
    @classmethod
    def list_all(cls, kind: str | None = None, neighborhood: str | None = None) -> list[dict]:
        pontos = VERIFIED_POINTS
        if kind:
            pontos = [p for p in pontos if p["tipo"].lower() == kind.lower()]
        if neighborhood:
            pontos = [p for p in pontos if neighborhood.casefold() in p["bairro"].casefold()]
        return [
            {**point, "status": "Referência demonstrativa; precisa de validação"}
            for point in pontos
        ]

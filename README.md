# Sombrinha

- **Hackathon:** APONTI Academy · REC'n'Play 2026
- **Desafio:** Antena na Lama
- **Caminho:** Prevenir e cuidar, com mobilização comunitária

## Sobre o projeto

Sombrinha é um protótipo web pensado para apoiar comunidades do Recife na prevenção e no cuidado diante dos impactos das mudanças climáticas. A plataforma reúne relatos de locais com pouca sombra ou arborização e permite visualizar as demandas em um mapa, ajudando a comunidade a identificar pontos prioritários para conversar e agir.

Além dos relatos, moradores e organizações podem registrar propostas de adoção de pontos de ônibus, áreas verdes e pontos de apoio. A ideia é tornar as necessidades mais visíveis e facilitar a articulação comunitária com organizações e poder público. O protótipo também considera o calor urbano e a desigualdade na distribuição de arborização e espaços de proteção térmica.

As propostas são indicações comunitárias: o sistema não aprova intervenções, não representa autorização oficial e não garante a disponibilidade de água ou manutenção.

## Equipe

Preencher com os nomes e funções da equipe antes da entrega:

- **Desenvolvimento:** [nomes e trilhas]
- **Validador(a) do Movimento Pró-Criança:** [nome]
- **Como o(a) validador(a) participou:** [tarefas realizadas no teste e retorno recebido]

## Tecnologias

- **Aplicação:** Python e Flask
- **Arquitetura:** MVC — Models, Controllers e Views separados
- **Interface e mapa:** HTML, CSS, JavaScript, Leaflet e OpenStreetMap
- **Persistência:** JSON local para demonstração ou PostgreSQL via `DATABASE_URL`
- **Deploy configurado:** Render (`render.yaml`)

## Funcionalidades do protótipo

- Registrar bairro, referência pública, tipo de situação e localização aproximada no mapa.
- Escolher entre os 94 bairros do Recife, organizados pelas seis RPAs.
- Ver relatos agrupados em células geográficas aproximadas de 100 metros e consultar um sinal comunitário demonstrativo baseado no volume, tipo e atualidade dos registros.
- Receber uma sugestão de próximo passo para discussão comunitária.
- Cadastrar e visualizar propostas de adoção de pontos de ônibus, áreas verdes e pontos de apoio, com organização responsável, compromisso, horário e localização.
- Guardar relatos e propostas em JSON local ou PostgreSQL quando `DATABASE_URL` estiver configurada.

## Executar localmente

Requisitos: Python 3.10 ou superior.

```bash
pip install -r requirements.txt
python app.py
```

Abra `http://localhost:8000` no computador. Para testar pelo celular na mesma rede Wi-Fi, use o endereço de rede mostrado no terminal, também na porta `8000`.

## Deploy público

O arquivo `render.yaml` descreve o serviço web e o banco PostgreSQL para o Render:

1. Conecte o repositório Sombrinha ao Render e crie um Blueprint.
2. Revise os recursos identificados no `render.yaml` e aplique o deploy.
3. Abra a URL gerada em um celular com internet.

O serviço gratuito pode hibernar após um período sem acesso e o PostgreSQL gratuito tem prazo de expiração definido pelo Render. Consulte as condições atuais do serviço antes de usar o protótipo além da demonstração. Não armazene credenciais no repositório.

## Uso de inteligência artificial

- **Onde foi usada:** apoio ao brainstorming, à estrutura inicial e à documentação do protótipo.
- **Revisão humana necessária:** a equipe deve revisar o código, testar os fluxos no celular e validar as sugestões e os textos com o(a) validador(a) e a comunidade antes da apresentação. Registrem aqui as correções feitas e as ferramentas usadas durante o hackathon.

## Testes e validação

A validação prevista para esta etapa é feita com a equipe e o(a) participante do Movimento Pró-Criança, usando tarefas simples no celular: registrar um ponto, localizar uma demanda no mapa e cadastrar uma proposta. **Testes automatizados ainda não estão configurados neste repositório.** Registrem os resultados do teste com o(a) validador(a) antes da entrega.

## Arquitetura

- `models/`: validação, agregação e persistência dos relatos e propostas.
- `controllers/`: rotas HTTP e coordenação entre Model e View.
- `views/`: apresentação e templates HTML.
- `app.py`: configuração e inicialização da aplicação Flask.

## Limites e cuidados

- O mapa usa Leaflet e tiles do OpenStreetMap e precisa de internet; mantenha os créditos visíveis na interface.
- O sinal exibido é demonstrativo, não mede temperatura, não é previsão e não constitui avaliação oficial de risco.
- A versão pública compartilha os registros com quem acessa a URL. Não insira dados pessoais nem relatos sensíveis.
- O protótipo não tem autenticação, moderação, confirmação de execução ou fluxo de validação institucional.
- Intervenções de arborização, instalação de estruturas de sombra ou criação de pontos de apoio dependem de validação comunitária e autorização dos responsáveis pelo espaço.

## Fontes de dados dos bairros

A lista de bairros é baseada no [Perfil dos Bairros da Prefeitura do Recife](https://www2.recife.pe.gov.br/servico/perfil-dos-bairros) e pode ser atualizada com os [dados abertos municipais](https://dados.recife.pe.gov.br/dataset/area-urbana).

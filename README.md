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
- **Frontend:** TypeScript, Svelte, Vite, CSS, Leaflet e OpenStreetMap
- **Persistência:** JSON local para demonstração ou PostgreSQL via `DATABASE_URL`
- **Clima:** Google Maps Platform Weather API, consulta pelo backend
- **Servidor de produção:** Gunicorn
- **Deploy configurado:** Render (`render.yaml`)

## Funcionalidades do protótipo

- Registrar bairro, referência pública, tipo de situação e localização aproximada no mapa.
- Escolher entre os 94 bairros do Recife, organizados pelas seis RPAs.
- Ver relatos agrupados em células geográficas aproximadas de 100 metros e consultar um sinal comunitário demonstrativo baseado no volume, tipo e atualidade dos registros.
- Receber uma sugestão de próximo passo para discussão comunitária.
- Cadastrar e visualizar propostas de adoção de pontos de ônibus, áreas verdes e pontos de apoio, com organização responsável, compromisso, horário e localização.
- Guardar relatos e propostas em JSON local ou PostgreSQL quando `DATABASE_URL` estiver configurada.
- Consultar referências de locais no mapa, ainda sem validação de funcionamento ou disponibilidade.
- Consultar temperatura atual, sensação térmica, umidade, UV e condição para uma coordenada de referência no centro do Recife.
- Demonstrar classificação de texto por regras simples e simular pontuação de reciclagem; não são serviços de IA, coleta ou recompensa ativos.

## Executar localmente

Requisitos: Python 3.12+, Node.js 22.12+ e npm.

```powershell
py -3.12 -m venv .venv
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Set-Location frontend
npm ci
npm run build
Set-Location ..
.\.venv\Scripts\python.exe backend\app.py
```

Abra `.env` no VS Code e preencha `GOOGLE_WEATHER_API_KEY` com uma chave de prototipagem do Google. A aplicação carrega esse arquivo ao iniciar. Nunca envie a chave ao GitHub nem a coloque no JavaScript. Você também pode iniciar sem a chave; o restante do protótipo funciona e a área do clima informa que a integração está desativada.

Abra `http://localhost:8000` no computador. Para testar pelo celular na mesma rede Wi-Fi, use o endereço de rede mostrado no terminal, também na porta `8000`.

Para desenvolver a interface com atualização rápida, mantenha o Flask rodando em um terminal e, em outro, execute `Set-Location frontend` e `npm run dev`. Acesse `http://localhost:5173`; o Vite encaminha as chamadas `/api` para o Flask. Para servir a versão compilada pelo Flask, execute `npm run build` dentro da pasta `frontend` antes de iniciar o servidor.

## Deploy público

O `Dockerfile` compila o frontend Svelte e prepara a aplicação Flask com Gunicorn. O `render.yaml` configura esse serviço e o banco PostgreSQL:

1. Conecte o repositório Sombrinha ao Render e crie um Blueprint.
2. Configure `GOOGLE_WEATHER_API_KEY` nas variáveis do serviço.
3. Aplique o deploy definido pelo `render.yaml` e abra a URL gerada no celular.

O serviço gratuito pode hibernar após um período sem acesso e o PostgreSQL gratuito tem prazo de expiração definido pelo Render. Consulte as condições atuais do serviço antes de usar o protótipo além da demonstração. Não armazene credenciais no repositório.

No Render, configure `GOOGLE_WEATHER_API_KEY` nas variáveis de ambiente do serviço. Para prototipagem, o Google oferece uma Maps Demo Key sem custo, destinada a testes; uma chave padrão exige ativar faturamento. Restrinja a chave à Weather API e acompanhe cotas e custos no Google Cloud. [Configuração oficial da API](https://developers.google.com/maps/documentation/weather/get-api-key) · [Uso e faturamento](https://developers.google.com/maps/documentation/weather/usage-and-billing).

## Uso de inteligência artificial

- **Onde foi usada:** apoio ao brainstorming, à estrutura inicial e à documentação do protótipo.
- **Revisão humana necessária:** a equipe deve revisar o código, testar os fluxos no celular e validar as sugestões e os textos com o(a) validador(a) e a comunidade antes da apresentação. Registrem aqui as correções feitas e as ferramentas usadas durante o hackathon.

## Testes e validação

A validação prevista para esta etapa é feita com a equipe e o(a) participante do Movimento Pró-Criança, usando tarefas simples no celular: registrar um ponto, localizar uma demanda no mapa e cadastrar uma proposta. **Testes automatizados ainda não estão configurados neste repositório.** Registrem os resultados do teste com o(a) validador(a) antes da entrega.

## Arquitetura

- `frontend/`: interface Svelte/TypeScript, componentes, cliente tipado da API e build com Vite.
- `backend/app.py`: configuração e inicialização da aplicação Flask.
- `backend/models/`: validação, agregação e persistência dos relatos e propostas.
- `backend/controllers/`: rotas HTTP e coordenação entre Model e View.
- `backend/views/`: entrega da página compilada pelo Flask e tela de orientação se o frontend ainda não foi compilado.
- `backend/requirements.txt`: dependências Python do backend.

## Limites e cuidados

- O mapa usa Leaflet e tiles do OpenStreetMap e precisa de internet; mantenha os créditos visíveis na interface.
- O sinal exibido é demonstrativo, não mede temperatura, não é previsão e não constitui avaliação oficial de risco.
- A API retorna condições atuais para uma coordenada de referência no centro do Recife. As condições do Google são resultados meteorológicos modelados e não correspondem necessariamente a uma estação local; a resolução não identifica diferenças de calor entre bairros ou ruas. Use os relatos comunitários para apontar necessidades locais. [FAQ da Weather API](https://developers.google.com/maps/documentation/weather/faq).
- O backend mantém a resposta atual em memória por 10 minutos para reduzir chamadas; a API permite cache temporário das condições atuais por até uma hora conforme os termos aplicáveis. [Termos da Weather API](https://cloud.google.com/maps-platform/terms/maps-service-terms).
- Os marcadores de sombra, água e coleta são referências de demonstração; confirme existência, acesso e funcionamento antes de se deslocar.
- O assistente classifica algumas palavras localmente. A rota não é calculada; pontos e recompensas da reciclagem são apenas simulações.
- Não há CORS aberto: a interface deve consumir a API na mesma origem do site.
- A versão pública compartilha os registros com quem acessa a URL. Não insira dados pessoais nem relatos sensíveis.
- O protótipo não tem autenticação, moderação, confirmação de execução ou fluxo de validação institucional.
- Intervenções de arborização, instalação de estruturas de sombra ou criação de pontos de apoio dependem de validação comunitária e autorização dos responsáveis pelo espaço.

## Fontes de dados dos bairros

A lista de bairros é baseada no [Perfil dos Bairros da Prefeitura do Recife](https://www2.recife.pe.gov.br/servico/perfil-dos-bairros) e pode ser atualizada com os [dados abertos municipais](https://dados.recife.pe.gov.br/dataset/area-urbana).

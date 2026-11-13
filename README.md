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
- **Frontend principal:** React, JavaScript, Vite, CSS, Leaflet e OpenStreetMap
- **Frontend alternativo:** Svelte e TypeScript em `frontend/`
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
Set-Location frontend-react
npm ci
npm run build
Set-Location ..
.\.venv\Scripts\python.exe backend\app.py
```

Abra `.env` no VS Code e preencha `GOOGLE_WEATHER_API_KEY` com uma chave de prototipagem do Google. A aplicação carrega esse arquivo ao iniciar. Nunca envie a chave ao GitHub nem a coloque no JavaScript. Você também pode iniciar sem a chave; o restante do protótipo funciona e a área do clima informa que a integração está desativada.

Abra `http://localhost:8000` no computador. Para testar pelo celular na mesma rede Wi-Fi, use o endereço de rede mostrado no terminal, também na porta `8000`.

Para desenvolver a interface principal com atualização rápida, mantenha o Flask rodando em um terminal e, em outro, execute `Set-Location frontend-react` e `npm run dev`. Acesse `http://localhost:5173`; o Vite encaminha as chamadas `/api` para o Flask. Para servir a versão compilada pelo Flask, gere o build em `frontend-react` antes de iniciar o servidor.

## Deploy público

O `Dockerfile` compila o frontend React e prepara a aplicação Flask com Gunicorn. O `render.yaml` configura esse serviço e o banco PostgreSQL:

1. Conecte o repositório Sombrinha ao Render e crie um Blueprint.
2. Configure `GOOGLE_WEATHER_API_KEY` nas variáveis do serviço.
3. Aplique o deploy definido pelo `render.yaml` e abra a URL gerada no celular.

O serviço gratuito pode hibernar após um período sem acesso e o PostgreSQL gratuito tem prazo de expiração definido pelo Render. Consulte as condições atuais do serviço antes de usar o protótipo além da demonstração. Não armazene credenciais no repositório.

No Render, configure `GOOGLE_WEATHER_API_KEY` nas variáveis de ambiente do serviço. Para prototipagem, o Google oferece uma Maps Demo Key sem custo, destinada a testes; uma chave padrão exige ativar faturamento. Restrinja a chave à Weather API e acompanhe cotas e custos no Google Cloud. [Configuração oficial da API](https://developers.google.com/maps/documentation/weather/get-api-key) · [Uso e faturamento](https://developers.google.com/maps/documentation/weather/usage-and-billing).

## Uso de inteligência artificial

- **Onde foi usada:** apoio ao brainstorming, à estrutura inicial e à documentação do protótipo.
- **Revisão humana necessária:** a equipe deve revisar o código, testar os fluxos no celular e validar as sugestões e os textos com o(a) validador(a) e a comunidade antes da apresentação. Registrem aqui as correções feitas e as ferramentas usadas durante o hackathon.

## Testes e validação

Instale as dependências do frontend React e do backend e execute os testes a partir da raiz do repositório. O build React é necessário para que o Flask sirva a página inicial durante o teste de integração:

```powershell
Set-Location frontend-react
npm ci
npm run build
Set-Location ..
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest backend\tests
```

Os testes cobrem as respostas das rotas de criação de relatos e simulações de reciclagem, incluindo validação, pontos simulados e aviso de que não há entrega ou resgate real. Eles usam arquivos temporários e não acessam os dados JSON da demonstração. O GitHub Actions executa os mesmos testes automaticamente a cada `push` e `pull_request`. Essas verificações cobrem apenas os comportamentos automatizados do backend; não validam o deploy, o uso no celular nem a validação comunitária.

A validação com a equipe e o(a) participante do Movimento Pró-Criança continua sendo feita separadamente, usando tarefas simples no celular: registrar um ponto, localizar uma demanda no mapa e cadastrar uma proposta. Registrem os resultados desse teste antes da entrega.

## Arquitetura

- `frontend/`: interface Svelte/TypeScript (legada/alternativa), build Vite.
- `frontend-react/`: nova interface React 18 PWA com foco mobile-first, Leaflet, geofencing proativo, modo Sol Forte (alto contraste), assistente de voz e Cartão Cidadão com QR Code.
- `backend/app.py`: configuração e inicialização da aplicação Flask (serve automaticamente a build do React ou Svelte).
- `backend/models/`: validação, agregação de relatos, modelo de adoção, fallback resiliente do clima (Open-Meteo) e estudo estratégico territorial de calor (`heat_islands_model.py`).
- `backend/controllers/`: rotas HTTP e coordenação entre Model e View (incluindo `/api/heat-islands/study` e `/api/heat-islands/proximity`).
- `backend/views/`: entrega da página compilada pelo Flask.
- `backend/requirements.txt`: dependências Python do backend.

## Estudo Estratégico de Ilhas de Calor & Pontos de Alívio (Centro do Recife)

Com base em dados térmicos urbanos e fluxo de pedestres no Centro do Recife, identificamos os corredores mais críticos e os locais prioritários para instalação de bebedouros públicos e totens de nebulização:

1. **Avenida Conde da Boa Vista (Boa Vista):** Corredor BRT com asfalto escuro e pouca copa arbórea. Solução: Bebedouro refrigerado e totens de névoa nas estações BRT Soledade e Hospício.
2. **Rua da Palma & Rua da Concórdia (São José):** Ruas comerciais estreitas com lonas plásticas que aprisionam o calor. Solução: Ponto de hidratação na interseção com a Rua Nova e marquises reflexivas.
3. **Avenida Dantas Barreto (Santo Antônio):** Canteiro central descampado com alta circulação de ambulantes. Solução: Abrigo climático solar com água mineral gelada.
4. **Terminal Integrado Cais de Santa Rita (São José):** Piso de paralelepípedo e asfalto com alto fluxo de passageiros. Solução: Bebedouro industrial de alto fluxo próximo ao Mercado das Cujas.
5. **Rua Nova & Pátio do Livramento (Santo Antônio):** Calçadão histórico de pedra com retenção solar. Solução: Ponto de frescor e bebedouro na Praça do Diário.

### Geofencing e Notificação Proativa
O aplicativo solicita a localização do usuário ao abrir. Ao detectar que o usuário está no Centro ou se deslocando em direção a ele, emite um alerta com a temperatura/sensação térmica em tempo real e calcula a rota para os pontos de água e refúgio térmico mais próximos a pé.

### Clima com Fallback Resiliente (Zero 503)
A integração meteorológica suporta a Google Weather API e, caso a chave não esteja configurada ou atinja limites de cota, aciona automaticamente o fallback em tempo real da Open-Meteo para as coordenadas do Recife (`-8.0476, -34.8770`). A aplicação nunca fica indisponível ou exibe erro 503.

### Executar o Frontend em React
```bash
cd frontend-react
npm install
npm run dev   # Executa em http://localhost:5173
npm run build # Gera dist/ para ser servido pelo Flask
```

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

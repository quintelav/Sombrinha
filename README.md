# Sombrinha

- **Hackathon:** APONTI Academy · REC'n'Play 2026
- **Desafio:** Antena na Lama
- **Caminho:** Prevenir e cuidar, com mobilização comunitária

## Sobre o projeto

Sombrinha é um protótipo web de mobilização comunitária para prevenção e cuidado diante dos impactos das mudanças climáticas no Recife. A proposta é reunir relatos sobre locais com pouca sombra, arborização ou estrutura de apoio, mostrar essas demandas em um mapa e ajudar moradores, organizações e poder público a discutir possíveis ações.

O protótipo também apresenta informações meteorológicas de referência, locais demonstrativos de atenção ao calor e propostas comunitárias para cuidar de pontos de ônibus, áreas verdes e espaços de apoio. A prioridade é tornar necessidades locais visíveis e apoiar a conversa comunitária; a ferramenta não executa nem autoriza intervenções.

Relatos, pontos e propostas são indicações para discussão. O sistema não mede a temperatura de cada rua, não confirma a existência ou disponibilidade dos locais e não aprova intervenções nem garante água, manutenção ou atendimento público.

## Equipe

- **Desenvolvimento:**
  - Vitor Quintela — Back-end.
  - Maria Eduarda — Front-end.
  - Ana Paula — Front-end.
- **Validador do Movimento Pró-Criança:** Charles Magno.
- **Validação do protótipo:** registrar as tarefas realizadas por Charles, o retorno recebido e os ajustes feitos. Os resultados da validação ainda não foram informados neste README.

> **Composição da equipe:** foram informados três desenvolvedores e um validador. O item 5.1 do edital descreve equipes com quatro desenvolvedores e um validador; confirmem com a coordenação se a composição atual foi aprovada.

## Tecnologias

- **Aplicação:** Python e Flask
- **Arquitetura:** MVC — Models, Controllers e Views separados
- **Frontend principal:** React, JavaScript, Vite, CSS, Leaflet e OpenStreetMap
- **Frontend alternativo:** Svelte e TypeScript em `frontend/`
- **Persistência:** JSON local para demonstração ou PostgreSQL via `DATABASE_URL`
- **Clima:** Google Weather API, com fallback para Open-Meteo e uma estimativa de contingência; consulta pelo backend
- **Servidor de produção:** Gunicorn
- **Deploy configurado:** Render (`render.yaml`)

## Funcionalidades do protótipo

- Registrar um relato comunitário com bairro, referência pública, tipo de situação e localização aproximada no mapa.
- Escolher entre os 94 bairros do Recife, organizados pelas seis RPAs.
- Ver relatos agrupados em células geográficas aproximadas de 100 metros e um indicador demonstrativo baseado no volume, tipo e atualidade dos registros.
- Consultar no mapa pontos de referência, cuja existência, acesso e funcionamento precisam ser confirmados.
- Cadastrar e visualizar propostas de adoção de pontos de ônibus, áreas verdes e pontos de apoio, com organização responsável, compromisso, horário e localização.
- Guardar relatos e propostas em JSON local ou PostgreSQL quando `DATABASE_URL` estiver configurada.
- Consultar temperatura, sensação térmica, umidade, índice UV e condição meteorológica para uma coordenada de referência no Centro do Recife.
- Usar um assistente de texto e voz com reconhecimento de voz do navegador quando disponível; a classificação das mensagens usa regras locais por palavras-chave, não um modelo de IA conectado.
- Consultar locais demonstrativos de atenção ao calor e uma estimativa de proximidade; a localização é opcional e, sem permissão, o protótipo usa um ponto fixo de demonstração no Centro.
- Simular pontuação de reciclagem; não há coleta, entrega ou resgate de recompensa reais.

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

`GOOGLE_WEATHER_API_KEY` é opcional para executar o protótipo. Se configurada, deve ficar apenas no arquivo `.env` local ou nas variáveis secretas do serviço de hospedagem; nunca a inclua no GitHub nem no JavaScript do frontend. Sem a chave, o backend tenta consultar o Open-Meteo e, se as fontes externas não responderem, usa valores estimados de contingência.

Abra `http://localhost:8000` no computador. Para testar pelo celular na mesma rede Wi-Fi, use o endereço de rede mostrado no terminal, também na porta `8000`.

Para desenvolver a interface principal com atualização rápida, mantenha o Flask rodando em um terminal e, em outro, execute `Set-Location frontend-react` e `npm run dev`. Acesse `http://localhost:5173`; o Vite encaminha as chamadas `/api` para o Flask. Para servir a versão compilada pelo Flask, gere o build em `frontend-react` antes de iniciar o servidor.

## Deploy público

O `Dockerfile` compila o frontend React e prepara a aplicação Flask com Gunicorn. O `render.yaml` configura esse serviço e o banco PostgreSQL. O endereço público informado para a demonstração é [https://sombrinha-demo.onrender.com/](https://sombrinha-demo.onrender.com/); confirme que a página abre antes do pitch, pois a disponibilidade do serviço não foi verificada por este README.

1. Conecte o repositório Sombrinha ao Render e crie um Blueprint.
2. Configure `GOOGLE_WEATHER_API_KEY` nas variáveis do serviço.
3. Aplique o deploy definido pelo `render.yaml` e abra a URL gerada no celular.

O serviço gratuito pode hibernar após um período sem acesso e o PostgreSQL gratuito tem prazo de expiração definido pelo Render. Consulte as condições atuais do serviço antes de usar o protótipo além da demonstração. Não armazene credenciais no repositório.

No Render, configure `GOOGLE_WEATHER_API_KEY` nas variáveis de ambiente do serviço caso queira usar a fonte Google. O app tenta usar Open-Meteo quando a chave estiver ausente ou a consulta Google falhar. Planos e limites de hospedagem podem mudar; consulte as condições atuais do Render. [Configuração oficial da API Google Weather](https://developers.google.com/maps/documentation/weather/get-api-key) · [Uso e faturamento](https://developers.google.com/maps/documentation/weather/usage-and-billing).

## Uso de inteligência artificial

- **Onde foi usada:** apoio ao brainstorming, à elaboração e revisão de código, à depuração e à documentação.
- **No protótipo:** o assistente classifica texto por regras locais; não há integração com um modelo externo de IA para responder aos usuários.
- **Correções registradas nesta documentação:** foram esclarecidos os limites dos dados demonstrativos de calor, das estimativas de distância e da classificação por palavras-chave, removendo alegações de medições locais ou cálculo de rota. A equipe deve revisar o código e registrar outras sugestões corrigidas ou descartadas. Não inserir dados pessoais nas ferramentas de IA.

## Testes e validação

Instale as dependências de desenvolvimento do backend e execute os testes a partir da raiz do repositório. O teste da página inicial usa um frontend temporário, portanto os testes do backend não dependem do Node.js nem de arquivos de build:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest backend\tests
```

No GitHub Actions, a interface React é compilada e o workflow verifica a existência de `frontend-react/dist/index.html` antes de executar os testes do backend. A CI roda automaticamente a cada `push` e `pull_request`. Os testes cobrem apenas comportamentos automatizados do backend; não validam o deploy, o uso no celular nem a validação comunitária.

Há 8 testes automatizados no backend: verificam a página inicial com um frontend temporário, os endpoints de calor e clima, a criação e validação de relatos e a simulação de reciclagem, incluindo pontos e aviso explícito de que não houve entrega ou resgate real. Os testes usam arquivos temporários e não acessam os JSON da demonstração. O resultado local mais recente foi 8 testes aprovados; confirme também o status da execução mais recente em GitHub Actions.

A validação com a equipe e o(a) participante do Movimento Pró-Criança deve ser feita separadamente, usando tarefas simples no celular: registrar um relato, localizar uma demanda no mapa e cadastrar uma proposta. Registrem tarefas, observações e alterações realizadas; os testes automatizados não substituem essa validação.

### Entregáveis do edital

- **Solução funcionando no celular com deploy público:** abrir a URL pública em um celular, inclusive por rede móvel, e confirmar os fluxos principais antes da apresentação.
- **Repositório com README preenchido:** completar os nomes e trilhas da equipe, identificar o(a) validador(a), descrever a validação e registrar o uso e as correções da IA.
- **Testes automatizados no CI:** o projeto tem 8 testes; o GitHub Actions compila o frontend, confere o arquivo de saída e executa os testes em cada `push` e `pull_request`.
- **Pitch:** preparar apresentação de 3 minutos com demonstração dos fluxos principais até o code freeze às 16h do dia 13/11.
- **Validação do problema e do protótipo:** incluir no processo e neste README a contribuição real do(a) validador(a) do Movimento Pró-Criança.

## Arquitetura

- `frontend/`: interface Svelte/TypeScript (legada/alternativa), build Vite.
- `frontend-react/`: interface React 18 responsiva para celular e computador, com Leaflet, modo de alto contraste para sol forte, assistente de voz e Cartão Cidadão com QR Code.
- `backend/app.py`: configuração e inicialização da aplicação Flask (serve automaticamente a build do React ou Svelte).
- `backend/models/`: validação, agregação de relatos, modelo de adoção, fallback resiliente do clima (Open-Meteo) e estudo estratégico territorial de calor (`heat_islands_model.py`).
- `backend/controllers/`: rotas HTTP e coordenação entre Model e View, incluindo relatos, clima, propostas, reciclagem e os endpoints `/api/heat-islands/study` e `/api/heat-islands/proximity`.
- `backend/views/`: entrega da página compilada pelo Flask.
- `backend/requirements.txt`: dependências Python do backend.

## Estudo demonstrativo de calor urbano e pontos de apoio

O endpoint `/api/heat-islands/study` apresenta corredores e pontos de apoio de referência no Centro do Recife. Os registros e estimativas de temperatura de superfície estão definidos como dados demonstrativos no código: não foram verificados neste projeto por medições de campo nem por uma base geoespacial oficial. Não devem ser apresentados como medições reais ou como ranking oficial de bairros.

### Localização e aviso de proximidade
Quando disponível, o navegador solicita permissão de geolocalização. O sistema consulta proximidade em relação a um ponto de referência no Centro e pode mostrar um aviso e destacar um ponto no mapa. Se a pessoa negar a permissão, usa coordenadas fixas para demonstração. A distância e o tempo a pé são aproximações em linha reta; o app não calcula uma rota viária nem confirma acesso, funcionamento ou abastecimento dos pontos.

### Consulta meteorológica
A consulta usa uma coordenada de referência no Centro do Recife (`-8.0476, -34.8770`). O backend tenta a Google Weather API quando há chave, depois Open-Meteo e, se ambas falharem, retorna uma estimativa de contingência. Esses dados não medem diferenças de temperatura entre bairros ou ruas e a estimativa não é uma observação meteorológica.

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
- A API retorna condições para uma coordenada de referência no Centro do Recife. As condições são modeladas e não correspondem necessariamente a uma estação local; não identificam diferenças de calor entre bairros ou ruas. Use os relatos comunitários para apontar necessidades locais. [FAQ da Weather API](https://developers.google.com/maps/documentation/weather/faq).
- O backend mantém a resposta atual em memória por 10 minutos para reduzir chamadas; a API permite cache temporário das condições atuais por até uma hora conforme os termos aplicáveis. [Termos da Weather API](https://cloud.google.com/maps-platform/terms/maps-service-terms).
- Os marcadores de sombra, água e coleta são referências de demonstração; confirme existência, acesso e funcionamento antes de se deslocar.
- O assistente classifica algumas palavras localmente. A rota não é calculada; pontos e recompensas da reciclagem são apenas simulações.
- O backend atualmente permite requisições CORS de qualquer origem; não há autenticação. Essa configuração é adequada apenas ao protótipo e deve ser restringida antes de uso com dados sensíveis.
- A versão pública compartilha os registros com quem acessa a URL. Não insira dados pessoais nem relatos sensíveis.
- O protótipo não tem autenticação, moderação, confirmação de execução ou fluxo de validação institucional.
- Intervenções de arborização, instalação de estruturas de sombra ou criação de pontos de apoio dependem de validação comunitária e autorização dos responsáveis pelo espaço.

## Fontes de dados dos bairros

A lista de bairros é baseada no [Perfil dos Bairros da Prefeitura do Recife](https://www2.recife.pe.gov.br/servico/perfil-dos-bairros) e pode ser atualizada com os [dados abertos municipais](https://dados.recife.pe.gov.br/dataset/area-urbana).

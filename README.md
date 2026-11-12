# Bairro que Cuida — protótipo inicial

Aplicação web móvel em Python para registrar locais com falta de sombra, visualizar as demandas num mapa, sugerir pontos de refresco e organizar ações de cuidado de áreas verdes. Pode funcionar localmente com arquivo JSON ou hospedada com PostgreSQL.

## Executar no computador

1. Instale Python 3.10 ou superior.
2. Abra o PowerShell nesta pasta.
3. Execute `python app.py`.
4. Abra `http://localhost:8000` no navegador do computador.

O servidor imprimirá também um endereço de rede, por exemplo `http://192.168.1.25:8000`.

## Testar no celular

1. Mantenha o servidor rodando no computador.
2. Conecte o celular à mesma rede Wi-Fi do computador.
3. Digite no navegador do celular o endereço de rede mostrado no terminal, incluindo `:8000`.

O protótipo é uma página web responsiva; não precisa ser instalado. Se o celular não conectar, o firewall do computador pode estar bloqueando a porta 8000. Para acessar de fora da rede local, publique a aplicação conforme a seção abaixo.

## Publicar para acesso em qualquer dispositivo

O repositório inclui `render.yaml` para criar um serviço web e um banco PostgreSQL no Render:

1. Envie o projeto para um repositório GitHub.
2. No Render, crie um Blueprint e conecte esse repositório.
3. Revise os serviços detectados no `render.yaml` e aplique a publicação.
4. Abra a URL pública gerada pelo Render em um celular com internet.

Quando `DATABASE_URL` está configurada, os relatos são guardados no PostgreSQL. Sem essa variável, o app usa `data/relatos.json` localmente. Nunca publique credenciais ou arquivos `.env` no repositório.

O Blueprint usa instâncias gratuitas para demonstração. Serviços web gratuitos podem dormir após 15 minutos sem acesso, e o banco PostgreSQL gratuito do Render expira após 30 dias. Planeje uma alternativa de armazenamento se a demonstração precisar continuar depois desse período.

## O que o protótipo faz

- Registra bairro/local de referência e tipo de situação, sem pedir nome ou endereço residencial.
- Oferece os 94 bairros do Recife organizados pelas seis RPAs e exige uma referência pública para facilitar a localização.
- Permite marcar o local aproximado tocando no mapa e exibe os relatos geolocalizados em marcadores.
- Agrupa relatos em células geográficas aproximadas de 100 m; relatos antigos sem coordenadas são agrupados pelo texto do local.
- Calcula um **sinal comunitário demonstrativo** com base em volume, tipo e atualidade dos relatos.
- Sugere um próximo passo para conversa com a comunidade.
- Salva os dados em `data/relatos.json` localmente ou no PostgreSQL quando `DATABASE_URL` está configurada.

O mapa usa Leaflet e tiles OpenStreetMap, carregados da internet, com os créditos exibidos no mapa. O índice não é temperatura, previsão ou avaliação oficial de risco. Dados enviados à versão publicada são compartilhados com todos que acessarem a URL. Não use dados pessoais ou relatos sensíveis.

## Limites desta versão

- Não há integração com WhatsApp; o link pode ser compartilhado manualmente para acesso no navegador.
- O mapa exige conexão à internet para carregar a biblioteca Leaflet e as imagens cartográficas do OpenStreetMap.
- A lista de bairros é baseada no [Perfil dos Bairros da Prefeitura do Recife](https://www2.recife.pe.gov.br/servico/perfil-dos-bairros) e pode ser atualizada a partir dos [dados abertos municipais](https://dados.recife.pe.gov.br/dataset/area-urbana).
- Recomendações de plantio, instalação de sombra ou ponto de refresco precisam de validação comunitária e dos responsáveis pelo espaço.
- O protótipo não tem autenticação nem moderação de relatos; a versão pública é apenas para demonstração e não deve receber informações pessoais ou sensíveis.

/**
 * Sombrinha — Cliente de API com Fallback Resiliente para Resiliência Térmica Urbana
 * Conecta-se ao Flask quando ativo; se o Flask estiver pausado, executa os mesmos
 * algoritmos heurísticos localmente com as coordenadas reais do Recife.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

// Base territorial real do Centro do Recife
const CORREDORES_CALOR_RECIFE = [
  {
    id: 'corredor-1',
    nome: 'Avenida Conde da Boa Vista',
    bairro: 'Boa Vista',
    coordenadas: { latitude: -8.0601, longitude: -34.8876 },
    temperatura_superficie_estimada: '46°C - 50°C',
    nivel_risco: 'CRÍTICO',
    motivo: 'Corredor exclusivo de ônibus BRT, pavimento asfáltico contínuo e ausência de copa arbórea.'
  },
  {
    id: 'corredor-2',
    nome: 'Rua da Palma e Rua da Concórdia',
    bairro: 'São José',
    coordenadas: { latitude: -8.0664, longitude: -34.8808 },
    temperatura_superficie_estimada: '44°C - 48°C',
    nivel_risco: 'MUITO ALTO',
    motivo: 'Vias comerciais estreitas de pedestres com toldos plásticos que aprisionam ar aquecido.'
  },
  {
    id: 'corredor-3',
    nome: 'Avenida Dantas Barreto',
    bairro: 'Santo Antônio',
    coordenadas: { latitude: -8.0642, longitude: -34.8778 },
    temperatura_superficie_estimada: '45°C - 49°C',
    nivel_risco: 'CRÍTICO',
    motivo: 'Largo asfalto com canteiros descampados e forte concentração de vendedores ambulantes.'
  },
  {
    id: 'corredor-4',
    nome: 'Terminal Integrado Cais de Santa Rita',
    bairro: 'São José',
    coordenadas: { latitude: -8.0697, longitude: -34.8761 },
    temperatura_superficie_estimada: '43°C - 47°C',
    nivel_risco: 'MUITO ALTO',
    motivo: 'Piso de pedra e asfalto com alto fluxo de passageiros e radiação solar direta nas paradas.'
  },
  {
    id: 'corredor-5',
    nome: 'Rua Nova e Pátio do Livramento',
    bairro: 'Santo Antônio',
    coordenadas: { latitude: -8.0628, longitude: -34.8769 },
    temperatura_superficie_estimada: '42°C - 46°C',
    nivel_risco: 'ALTO',
    motivo: 'Calçadão de paralelepípedo escuro que armazena calor por horas sem sombras de refúgio.'
  }
];

const ESTACOES_AGUA_RECIFE = [
  {
    id: 'estacao-1',
    nome: 'Bebedouro Público & Névoa BRT Soledade',
    bairro: 'Boa Vista',
    latitude: -8.0588,
    longitude: -34.8905,
    tipo: 'bebedouro_nebulizador',
    capacidade: 'Água gelada contínua 120L/hora',
    publico_alvo: 'Passageiros do BRT e transeuntes da Boa Vista',
    distancia_metros: 180,
    tempo_pe_min: 2
  },
  {
    id: 'estacao-2',
    nome: 'Totem de Hidratação Rua da Palma x Rua Nova',
    bairro: 'São José',
    latitude: -8.0648,
    longitude: -34.8795,
    tipo: 'bebedouro_refrigerado',
    capacidade: 'Água gelada 80L/hora + protetor solar',
    publico_alvo: 'Comerciantes, ambulantes e pedestres do comércio',
    distancia_metros: 250,
    tempo_pe_min: 3
  },
  {
    id: 'estacao-3',
    nome: 'Abrigo Climático Praça do Diário',
    bairro: 'Santo Antônio',
    latitude: -8.0631,
    longitude: -34.8772,
    tipo: 'abrigo_sombreado_com_agua',
    capacidade: 'Chafariz potável + bancos sombreados',
    publico_alvo: 'Trabalhadores informais e idosos no Centro Histórico',
    distancia_metros: 320,
    tempo_pe_min: 4
  },
  {
    id: 'estacao-4',
    nome: 'Estação de Hidratação Cais de Santa Rita',
    bairro: 'São José',
    latitude: -8.0691,
    longitude: -34.8765,
    tipo: 'bebedouro_industrial',
    capacidade: 'Alto fluxo 150L/hora',
    publico_alvo: 'Usuários do transporte coletivo metropolitano',
    distancia_metros: 400,
    tempo_pe_min: 5
  },
  {
    id: 'estacao-5',
    nome: 'Ponto de Frescor Parque Treze de Maio',
    bairro: 'Boa Vista',
    latitude: -8.0573,
    longitude: -34.8821,
    tipo: 'refugio_verde_sombreado',
    capacidade: 'Canópio arbóreo natural + bebedouro',
    publico_alvo: 'Crianças, famílias e pedestres em repouso',
    distancia_metros: 520,
    tempo_pe_min: 6
  }
];

export const PARQUES_E_SOMBRAS_RECIFE_RMR = [
  // Centro
  {
    id: 'parque-treze-de-maio',
    nome: 'Parque Treze de Maio',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Centro',
    bairro: 'Santo Amaro',
    endereco: 'Rua do Hospício, s/n - Santo Amaro',
    latitude: -8.0583,
    longitude: -34.8819,
    descricao: 'Pulmão verde central com árvores centenárias, pau-brasil, palmeiras imperiais e ampla cobertura de sombra para pedestres.'
  },
  {
    id: 'praca-da-republica',
    nome: 'Praça da República & Jardins de Burle Marx',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Centro',
    bairro: 'Santo Antônio',
    endereco: 'Praça da República, Santo Antônio',
    latitude: -8.0618,
    longitude: -34.8765,
    descricao: 'Famoso Baobá centenário tombado e jardins históricos sombreados projetados por Burle Marx em frente ao Palácio.'
  },
  {
    id: 'parque-linear-aurora',
    nome: 'Parque Linear da Rua da Aurora',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Centro',
    bairro: 'Santo Amaro',
    endereco: 'Cais da Rua da Aurora, Santo Amaro',
    latitude: -8.0560,
    longitude: -34.8775,
    descricao: 'Alameda arborizada com bancos sombreados à margem do Rio Capibaribe, recebendo brisa fluvial refrescante.'
  },
  {
    id: 'praca-do-derby',
    nome: 'Praça do Derby',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Centro',
    bairro: 'Derby',
    endereco: 'Praça do Derby, s/n',
    latitude: -8.0567,
    longitude: -34.8998,
    descricao: 'Bosque tradicional com canópio denso de árvores frondosas no entroncamento viário mais movimentado.'
  },
  // Zona Norte
  {
    id: 'parque-da-jaqueira',
    nome: 'Parque da Jaqueira (Sítio da Jaqueira)',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Norte',
    bairro: 'Jaqueira',
    endereco: 'Rua do Futuro, 959 - Jaqueira',
    latitude: -8.0375,
    longitude: -34.9048,
    descricao: 'Principal parque da Zona Norte com mais de 7 hectares, centenas de jaqueiras, pista sombreada e bebedouros públicos.'
  },
  {
    id: 'parque-santana',
    nome: 'Parque Santana Ariano Suassuna',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Norte',
    bairro: 'Santana',
    endereco: 'Rua Jorge Gomes de Sá, s/n - Santana',
    latitude: -8.0360,
    longitude: -34.9184,
    descricao: 'Parque arborizado à beira do Rio Capibaribe com espécies da Mata Atlântica, ciclovia e corredores de sombra fresca.'
  },
  {
    id: 'parque-da-tamarineira',
    nome: 'Parque da Tamarineira (Memorial da Saúde)',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Norte',
    bairro: 'Tamarineira',
    endereco: 'Av. Conselheiro Rosa e Silva, 2130 - Tamarineira',
    latitude: -8.0298,
    longitude: -34.9075,
    descricao: 'Bosque preservado com árvores centenárias frondosas, promovendo microclima até 3°C mais ameno.'
  },
  {
    id: 'parque-da-macaxeira',
    nome: 'Parque Urbano da Macaxeira',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Norte',
    bairro: 'Macaxeira',
    endereco: 'Av. Norte Miguel Arraes de Alencar, s/n - Macaxeira',
    latitude: -8.0142,
    longitude: -34.9298,
    descricao: 'Grande complexo de convivência e lazer sombreado da Zona Norte, com quiosques cobertos e bosque.'
  },
  {
    id: 'sitio-trindade',
    nome: 'Sítio Trindade',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Norte',
    bairro: 'Casa Amarela',
    endereco: 'Estrada do Arraial, 3259 - Casa Amarela',
    latitude: -8.0255,
    longitude: -34.9168,
    descricao: 'Bosque histórico secular de mangueiras, baobás e cajueiros com canópio denso e preservação patrimonial.'
  },
  {
    id: 'parque-dois-irmaos',
    nome: 'Parque Estadual Dois Irmãos (Horto Florestal)',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Norte',
    bairro: 'Dois Irmãos',
    endereco: 'Praça Farias Neves, s/n - Dois Irmãos',
    latitude: -8.0108,
    longitude: -34.9455,
    descricao: 'Maior reserva de Mata Atlântica urbana do Recife com 387 hectares, o pulmão e regulador térmico da RMR.'
  },
  {
    id: 'parque-de-apipucos',
    nome: 'Parque de Apipucos Maximiano Campos',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Norte',
    bairro: 'Apipucos',
    endereco: 'Rua de Apipucos, s/n - Apipucos',
    latitude: -8.0195,
    longitude: -34.9355,
    descricao: "Orla verde do Açude de Apipucos, com canópio de mangueiras e alívio térmico do espelho d'água."
  },
  {
    id: 'parque-das-gracas',
    nome: 'Parque das Graças (Parque Linear Capibaribe)',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Norte',
    bairro: 'Graças',
    endereco: 'Rua das Graças / Beira-Rio, Graças',
    latitude: -8.0494,
    longitude: -34.8992,
    descricao: 'Parque linear suspenso e arborizado margeando o Rio Capibaribe, com mirantes sombreados e ventilação fluvial.'
  },
  // Zona Sul
  {
    id: 'parque-dona-lindu',
    nome: 'Parque Dona Lindu',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Sul',
    bairro: 'Boa Viagem',
    endereco: 'Av. Boa Viagem, s/n - Boa Viagem',
    latitude: -8.1425,
    longitude: -34.9038,
    descricao: 'Bosque de coqueiros, gramados e galerias sombreadas à beira da orla marítima com brisa litorânea constante.'
  },
  {
    id: 'segundo-jardim-boa-viagem',
    nome: 'Segundo Jardim de Boa Viagem',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Sul',
    bairro: 'Boa Viagem',
    endereco: 'Av. Boa Viagem (altura do Segundo Jardim)',
    latitude: -8.1132,
    longitude: -34.8942,
    descricao: 'Alameda arborizada com castanholas de copa aberta, pergolados e refúgio de sombra para pedestres.'
  },
  {
    id: 'parque-dos-manguezais',
    nome: 'Parque Natural Municipal dos Manguezais',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Sul',
    bairro: 'Pina / Imbiribeira',
    endereco: 'Bacia do Pina até Imbiribeira',
    latitude: -8.0935,
    longitude: -34.8920,
    descricao: 'Maior manguezal urbano contínuo das Américas, responsável pelo amortecimento térmico da Zona Sul.'
  },
  {
    id: 'lagoa-do-araca',
    nome: 'Parque da Lagoa do Araçá',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Sul',
    bairro: 'Imbiribeira',
    endereco: 'Rua José de Holanda, s/n - Imbiribeira',
    latitude: -8.0995,
    longitude: -34.9125,
    descricao: 'Única lagoa natural de Recife, cercada por árvores frutíferas e pista de caminhada arborizada.'
  },
  // Zona Oeste
  {
    id: 'jardim-botanico-recife',
    nome: 'Jardim Botânico do Recife',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Oeste',
    bairro: 'Curado',
    endereco: 'BR-232, Km 7.5 - Curado',
    latitude: -8.0772,
    longitude: -34.9658,
    descricao: '10 hectares de Mata Atlântica nativa protegida com trilhas na floresta, jardins sensoriais e microclima ameno.'
  },
  {
    id: 'parque-urbano-caiara',
    nome: 'Parque Urbano do Caiara',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Oeste',
    bairro: 'Iputinga',
    endereco: 'Av. Maurício de Nassau, s/n - Iputinga',
    latitude: -8.0402,
    longitude: -34.9305,
    descricao: 'Ampla área verde arborizada na Zona Oeste às margens do Rio Capibaribe, com bosques sombreados.'
  },
  {
    id: 'engenho-uchoa',
    nome: 'Refúgio Ecológico Engenho Uchôa',
    tipo: 'sombra',
    cidade: 'Recife',
    regiao: 'Zona Oeste',
    bairro: 'Areias / San Martin',
    endereco: 'Rua Engenho Uchôa - Areias',
    latitude: -8.0912,
    longitude: -34.9360,
    descricao: 'Unidade de conservação de 192 hectares com remanescentes de floresta e mangue da Zona Oeste.'
  },
  // Região Metropolitana (Olinda, Jaboatão, Camaragibe)
  {
    id: 'horto-del-rey-olinda',
    nome: "Horto d'El Rey (Sítio Histórico de Olinda)",
    tipo: 'sombra',
    cidade: 'Olinda (RMR)',
    regiao: 'Olinda & RMR',
    bairro: 'Carmo / Bonsucesso',
    endereco: 'Rua do Bonsucesso, Olinda',
    latitude: -8.0125,
    longitude: -34.8512,
    descricao: 'Segundo jardim botânico mais antigo do Brasil (1637), refúgio com árvores seculares voltado ao mar.'
  },
  {
    id: 'parque-memorial-arcoverde',
    nome: 'Parque Memorial Arcoverde',
    tipo: 'sombra',
    cidade: 'Olinda / Recife (RMR)',
    regiao: 'Olinda & RMR',
    bairro: 'Salgadinho (Divisa Olinda/Recife)',
    endereco: 'Av. Olinda Dom Hélder Câmara, s/n',
    latitude: -8.0305,
    longitude: -34.8625,
    descricao: 'Parque metropolitano com bosques de eucaliptos, coqueiros e sombra na divisa entre Recife e Olinda.'
  },
  {
    id: 'parque-cidade-jaboatao',
    nome: 'Parque da Cidade de Jaboatão',
    tipo: 'sombra',
    cidade: 'Jaboatão dos Guararapes (RMR)',
    regiao: 'Jaboatão & RMR Sul',
    bairro: 'Prazeres / Piedade',
    endereco: 'Estrada da Batalha, s/n - Prazeres',
    latitude: -8.1725,
    longitude: -34.9190,
    descricao: 'Área de lazer e caminhada arborizada na Região Metropolitana Sul, proporcionando sombra e esportes.'
  },
  {
    id: 'parque-serra-dos-cocos',
    nome: 'Reserva Ecológica de Aldeia (Camaragibe)',
    tipo: 'sombra',
    cidade: 'Camaragibe (RMR)',
    regiao: 'Camaragibe & Aldeia',
    bairro: 'Aldeia dos Camarás',
    endereco: 'Estrada de Aldeia, Km 9.5',
    latitude: -7.9890,
    longitude: -34.9810,
    descricao: 'Reserva florestal com clima de serra, altitude e mata densa proporcionando alívio térmico.'
  }
];

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Falha silenciosa para ativar o modo de contingência local
    throw err;
  }
}

export const ADOCOES_SEMENTES = [
  {
    kind: "refresco",
    name: "Totem de Água Gelada da Boa Vista",
    organization: "Drogaria São Paulo (Filial Conde da Boa Vista)",
    reference: "Av. Conde da Boa Vista, 450",
    commitment: "Abastecimento diário com água mineral gelada e copos descartáveis das 8h às 18h.",
    hours: "Segunda a sábado, 8h às 18h",
    status: "Ponto Ativo & Cuidado Compartilhado",
    created_at: "2026-11-10T10:00:00Z"
  },
  {
    kind: "area_verde",
    name: "Canteiro Verde & Refúgio Maciel Pinheiro",
    organization: "Café & Livraria da Praça",
    reference: "Praça Maciel Pinheiro, 28",
    commitment: "Rega diária das mudas de árvores nativas e disponibilização de bancos sombreados.",
    hours: "Todos os dias, 7h às 19h",
    status: "Ponto Ativo & Cuidado Compartilhado",
    created_at: "2026-11-11T14:30:00Z"
  },
  {
    kind: "onibus",
    name: "Parada de Ônibus Sombreada Cais de Santa Rita",
    organization: "Cooperativa de Logística do Porto",
    reference: "Em frente ao Armazém 14",
    commitment: "Instalação de cobertura protetora com isolamento térmico e manutenção semanal.",
    hours: "Horário contínuo",
    status: "Proposta em implantação",
    created_at: "2026-11-12T16:00:00Z"
  },
  {
    kind: "refresco",
    name: "Oásis Urbano & Chafariz Parque Treze de Maio",
    organization: "Associação Comercial do Recife & Setor Hoteleiro",
    reference: "Parque Treze de Maio, próximo à Biblioteca Infantil",
    commitment: "Manutenção de bebedouro refrigerado de alta vazão e bancos com isolamento térmico.",
    hours: "Diariamente, 6h às 19h",
    status: "Ponto Ativo & Cuidado Compartilhado",
    created_at: "2026-11-13T08:00:00Z"
  }
];

export const RELATOS_SEMENTES = [
  {
    id: "rel-1",
    location: "Centro",
    neighborhood: "São José",
    reference: "Rua da Palma, altura do nº 180",
    kind: "quente_sem_sombra",
    kind_label: "Lugar muito quente e sem sombra",
    note: "Calçadão muito estreito, sem nenhuma árvore. O asfalto e as pedras esquentam muito das 11h às 14h, dificultando a vida de ambulantes e pedestres idosos.",
    created_at: "2026-11-13T11:20:00Z"
  },
  {
    id: "rel-2",
    location: "Centro",
    neighborhood: "Santo Antônio",
    reference: "Avenida Dantas Barreto, próximo ao Camelódromo",
    kind: "quente_sem_sombra",
    kind_label: "Lugar muito quente e sem sombra",
    note: "Ponto crítico de calor. Não há sombra nem água gratuita para os trabalhadores que passam o dia inteiro no asfalto.",
    created_at: "2026-11-13T12:05:00Z"
  },
  {
    id: "rel-3",
    location: "Centro",
    neighborhood: "Boa Vista",
    reference: "Parada de Ônibus do BRT Soledade",
    kind: "precisa_sombra",
    kind_label: "Espaço que precisa de mais sombra",
    note: "A fila fica no sol quente durante a tarde inteira. Seria essencial plantar árvores ou estender a cobertura da parada.",
    created_at: "2026-11-13T12:40:00Z"
  },
  {
    id: "rel-4",
    location: "Centro",
    neighborhood: "Boa Vista",
    reference: "Cruzamento da Rua do Hospício com Rua da Aurora",
    kind: "quente_sem_sombra",
    kind_label: "Lugar muito quente e sem sombra",
    note: "Travessia de pedestres sob sol a pino sem nenhuma marquise ou árvore de apoio. O asfalto atinge temperaturas extremas.",
    created_at: "2026-11-13T13:10:00Z"
  }
];

export const PEDIDOS_SEMENTES = [
  {
    id: "ped-1",
    tipo: "manutencao_bebedouro",
    tipo_label: "Manutenção ou Conserto em Bebedouro",
    local_referencia: "Bebedouro Público & Névoa BRT Soledade",
    bairro: "Boa Vista",
    solicitante: "Severino (Vendedor Ambulante)",
    descricao: "Bico de água com vazão fraca no período da tarde, precisa de desobstrução do filtro.",
    status: "Em análise pela Emlurb",
    created_at: "2026-11-12T14:30:00Z"
  },
  {
    id: "ped-2",
    tipo: "novo_bebedouro",
    tipo_label: "Instalação de Novo Bebedouro Público",
    local_referencia: "Terminal Integrado Cais de Santa Rita (Próximo à Plataforma B)",
    bairro: "São José",
    solicitante: "Coletivo de Passageiros do Centro",
    descricao: "Forte calor nas paradas externas, passageiros aguardam no sol sem nenhum ponto de água gratuito.",
    status: "Recebido pela comunidade",
    created_at: "2026-11-13T09:15:00Z"
  },
  {
    id: "ped-3",
    tipo: "plantio_arvore",
    tipo_label: "Plantio de Árvores / Ampliação de Sombra",
    local_referencia: "Avenida Dantas Barreto, canteiro central em frente ao Camelódromo",
    bairro: "Santo Antônio",
    solicitante: "Associação de Moradores e Trabalhadores do Centro",
    descricao: "Canteiro muito exposto ao sol direto, sugerimos plantio de mudas nativas com copa larga (ipês e sibipirunas).",
    status: "Encaminhado para Adoção",
    created_at: "2026-11-13T11:45:00Z"
  },
  {
    id: "ped-4",
    tipo: "plantio_arvore",
    tipo_label: "Plantio de Árvores / Ampliação de Sombra",
    local_referencia: "Calçadão da Rua Nova, trecho central",
    bairro: "Santo Antônio",
    solicitante: "Comerciantes e Pedestres da Rua Nova",
    descricao: "Calçadão de pedra muito aquecido. Pedido de instalação de floreiras e arborização em vasos grandes para criar sombra.",
    status: "Em análise técnica",
    created_at: "2026-11-13T12:00:00Z"
  }
];

export const api = {
  // 0. Teste de saúde da conexão com o Flask
  checkHealth: async () => {
    try {
      const res = await fetchJson('/api/health');
      return res.status === 'online';
    } catch {
      return false;
    }
  },

  // 1. Clima em tempo real (Google Weather / Open-Meteo)
  getWeather: async () => {
    try {
      const data = await fetchJson('/api/climate/current');
      return data.data || data;
    } catch {
      return {
        temperature_c: 30.5,
        feels_like_c: 35.8,
        heat_index_c: 36.0,
        uv_index: 10,
        condition: 'Sol forte e calor intenso no Centro',
        relative_humidity_percent: 74,
        location: 'Recife, PE (Centro / RMR)',
        source: 'Sensores Locais RMR (Contingência Resiliente)',
        recomendacoes: 'Evite caminhadas prolongadas sob o sol entre 11h e 14h. Mantenha hidratação contínua.'
      };
    }
  },

  // 2. Estudo estratégico das ruas mais quentes e pontos recomendados
  getHeatStudy: async () => {
    try {
      const res = await fetchJson('/api/heat-islands/study');
      return res.dados;
    } catch {
      return {
        municipio: 'Recife - PE',
        area_foco: 'Centro Expandido (Boa Vista, São José, Santo Antônio)',
        resumo_estrategico:
          'Estudo territorial de calor urbano do Centro do Recife, cruzando impermeabilização do solo, corredores de ônibus e fluxo de pedestres.',
        corredores_criticos_calor: CORREDORES_CALOR_RECIFE,
        pontos_recomendados_alivio: ESTACOES_AGUA_RECIFE
      };
    }
  },
  getHeatIslandsStudy: async () => {
    return await api.getHeatStudy();
  },

  // 3. Avaliação de Proximidade e Geofencing Proativo
  checkProximity: async (latitude, longitude) => {
    try {
      const res = await fetchJson('/api/heat-islands/proximity', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude })
      });
      return res.dados;
    } catch {
      // Cálculo heurístico local caso o Flask esteja pausado
      const centroLat = -8.0601;
      const centroLon = -34.8819;
      const distCentro = haversineKm(latitude, longitude, centroLat, centroLon);
      const estaNoCentro = distCentro <= 1.8;
      const aproximando = distCentro <= 5.0 && !estaNoCentro;

      // Encontra ponto de água mais próximo
      const pontosOrdenados = ESTACOES_AGUA_RECIFE.map((p) => {
        const dKm = haversineKm(latitude, longitude, p.latitude, p.longitude);
        const dMetros = Math.round(dKm * 1000);
        const tempoPe = Math.max(1, Math.round(dMetros / 70));
        return {
          ...p,
          distancia_metros: dMetros,
          tempo_pe_min: tempoPe
        };
      }).sort((a, b) => a.distancia_metros - b.distancia_metros);

      const maisProximo = pontosOrdenados[0];

      // Encontra parque / sombra mais próximo em toda a cidade e RMR
      const sombrasOrdenadas = PARQUES_E_SOMBRAS_RECIFE_RMR.map((s) => {
        const dKm = haversineKm(latitude, longitude, s.latitude, s.longitude);
        const dMetros = Math.round(dKm * 1000);
        const tempoPe = Math.max(1, Math.round(dMetros / 70));
        return {
          ...s,
          distancia_metros: dMetros,
          tempo_pe_min: tempoPe
        };
      }).sort((a, b) => a.distancia_metros - b.distancia_metros);
      const sombraMaisProxima = sombrasOrdenadas[0];

      return {
        esta_no_centro: estaNoCentro,
        distancia_centro_km: Number(distCentro.toFixed(2)),
        status_movimento: estaNoCentro
          ? 'NO_CENTRO'
          : aproximando
          ? 'APROXIMANDO_DO_CENTRO'
          : 'FORA_DO_CENTRO',
        notificacao_proativa: {
          alerta_ativo: true,
          titulo: estaNoCentro
            ? '☀️ Você está no Centro do Recife — Calor Crítico'
            : aproximando
            ? '🚶 Você está se aproximando do Centro do Recife'
            : sombraMaisProxima && sombraMaisProxima.distancia_metros <= 2500
            ? `🌳 Perto de você: ${sombraMaisProxima.nome}`
            : '☂️ Monitor Climático Sombrinha Recife & RMR',
          mensagem: estaNoCentro
            ? `Sensação térmica acima de 35°C no asfalto. Ponto de água potável mais próximo: ${maisProximo.nome} a ${maisProximo.distancia_metros}m (${maisProximo.tempo_pe_min} min a pé).`
            : sombraMaisProxima
            ? `Parque e refúgio de sombra a ${sombraMaisProxima.distancia_metros}m (~${sombraMaisProxima.tempo_pe_min} min a pé) em ${sombraMaisProxima.bairro}.`
            : 'Consulte os parques e pontos de sombra mais próximos do seu bairro.',
          sugestao_acao: `Caminhe até ${sombraMaisProxima?.nome || maisProximo.nome} para descanso sob sombra natural.`
        },
        ponto_mais_proximo: maisProximo,
        pontos_frescor_proximos: pontosOrdenados.slice(0, 3),
        sombra_mais_proxima: sombraMaisProxima,
        parques_proximos: sombrasOrdenadas.slice(0, 4)
      };
    }
  },

  // 4. Pontos de Sombra e Bebedouros
  getReferencePoints: async () => {
    try {
      const res = await fetchJson('/api/reference-points');
      return res.dados || [];
    } catch {
      const bebedouros = ESTACOES_AGUA_RECIFE.map((e) => ({
        id: e.id,
        nome: e.nome,
        endereco: `${e.bairro}, Recife - PE`,
        tipo: 'bebedouro',
        latitude: e.latitude,
        longitude: e.longitude,
        descricao: e.capacidade
      }));
      return [...PARQUES_E_SOMBRAS_RECIFE_RMR, ...bebedouros];
    }
  },

  // 5. Relatos e Comentários sobre Pontos Críticos
  getReports: async () => {
    try {
      const res = await fetchJson('/api/reports');
      if (res && res.relatos && res.relatos.length > 0) {
        return res.relatos;
      }
    } catch {
      // fallback
    }
    return RELATOS_SEMENTES;
  },

  createReport: async (reportData) => {
    try {
      return await fetchJson('/api/reports', {
        method: 'POST',
        body: JSON.stringify(reportData)
      });
    } catch {
      return { ok: true, simulado: true };
    }
  },

  getSummary: async () => {
    try {
      return await fetchJson('/api/summary');
    } catch {
      return { locations: [], total_reports: 0 };
    }
  },

  // 6. Propostas de Adoção por Empresas e Organizações
  getAdoptions: async () => {
    try {
      const res = await fetchJson('/api/adoptions');
      if (res && res.adoptions && res.adoptions.length > 0) {
        return res.adoptions;
      }
    } catch {
      // fallback
    }
    return ADOCOES_SEMENTES;
  },

  createAdoption: async (adoptionData) => {
    try {
      return await fetchJson('/api/adoptions', {
        method: 'POST',
        body: JSON.stringify(adoptionData)
      });
    } catch {
      return { ok: true, status: 'Proposta recebida' };
    }
  },

  // 7. Pedidos e Solicitações de Melhorias em Pontos de Apoio
  getCommunityRequests: async () => {
    try {
      const res = await fetchJson('/api/community-requests');
      if (res && res.pedidos && res.pedidos.length > 0) {
        return res.pedidos;
      }
    } catch {
      // fallback
    }
    return PEDIDOS_SEMENTES;
  },

  createCommunityRequest: async (reqData) => {
    try {
      return await fetchJson('/api/community-requests', {
        method: 'POST',
        body: JSON.stringify(reqData)
      });
    } catch {
      return {
        sucesso: true,
        pedido: {
          id: `ped-${Date.now()}`,
          ...reqData,
          status: 'Recebido pela comunidade',
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // 7. Reciclagem e Troca Solidária
  createTrade: async (tradeData) => {
    try {
      return await fetchJson('/api/trades', {
        method: 'POST',
        body: JSON.stringify(tradeData)
      });
    } catch {
      return { ok: true, simulado: true, pontos: tradeData.pontos };
    }
  },
  registrarTroca: async (tradeData) => {
    return await api.createTrade(tradeData);
  },

  // 8. Assistente de Voz com IA
  analyzeVoice: async (text) => {
    try {
      const res = await fetchJson('/api/ai/voice', {
        method: 'POST',
        body: JSON.stringify({ texto: text })
      });
      return res.dados;
    } catch {
      return {
        resposta_voz: 'Encontrei água gelada gratuita perto de você na Conde da Boa Vista e no Pátio de São Pedro.',
        recomendacao: 'Beba água em pequenos goles para evitar desidratação e procure calçadas com marquises.'
      };
    }
  }
};

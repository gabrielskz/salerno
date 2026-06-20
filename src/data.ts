import type { CategoryTemplate, Project, SalernoData } from './types'

const q = (section: string, questions: string[]) =>
  questions.map((question, index) => ({ id: `${section}-${index}`, section, question }))

export const defaultCategories: CategoryTemplate[] = [
  {
    id: 'interiores',
    name: 'Design de interiores',
    description: 'Ambientes residenciais ou comerciais, do conceito ao detalhamento.',
    icon: 'sofa',
    color: '#8F430D',
    software: ['AutoCAD', 'SketchUp', 'Layout', 'Enscape'],
    prefeituraRequired: false,
    rrtRequired: true,
    defaultDeadlineDays: 45,
    checklist: [
      { id: 'levantamento', title: 'Levantamento e medições', description: 'Conferir medidas, fotos e pontos existentes.' },
      { id: 'briefing', title: 'Briefing com o cliente', description: 'Registrar rotina, referências e orçamento.' },
      { id: 'conceito', title: 'Estudo preliminar', description: 'Layout, moodboard e conceito geral.' },
      { id: '3d', title: 'Projeto 3D', description: 'Modelagem e imagens para apresentação.' },
      { id: 'executivo', title: 'Projeto executivo', description: 'Detalhamentos, marcenaria e especificações.' },
      { id: 'entrega', title: 'Entrega final', description: 'Pranchas, arquivos e orientações finais.' },
    ],
    briefing: [
      ...q('Informações iniciais', [
        'Qual é o objetivo principal do projeto?',
        'Quantas pessoas utilizam o imóvel e qual é a rotina delas?',
        'Quanto pretende investir nesta fase?',
        'Já possui móveis ou eletrodomésticos que deseja manter?',
        'Tem animais de estimação? Há alguma necessidade especial?',
      ]),
      ...q('Preferências gerais', [
        'Prefere ambientes integrados ou separados?',
        'Quais ambientes precisam de TV e quais os tamanhos?',
        'Costuma receber visitas? Com qual frequência?',
        'Precisa de espaço para home office, leitura ou coleção?',
        'Gosta de espelhos, quadros, tapetes e plantas?',
      ]),
      ...q('Cozinha', [
        'Quais eletrodomésticos serão utilizados? Informe modelos e medidas.',
        'Prefere cooktop, fogão comum ou de embutir?',
        'Deseja bancada para refeições rápidas? Para quantas pessoas?',
        'Deseja adega, cervejeira, cantinho do café ou lava-louças?',
        'Prefere armários até o teto?',
      ]),
      ...q('Acabamentos e estética', [
        'Prefere cores claras ou escuras, neutras ou alegres?',
        'Gosta de madeira, mármore, cimento queimado ou outros acabamentos?',
        'Prefere porcelanato, vinílico ou mescla de pisos?',
        'Há alguma cor, material ou estilo que não deseja?',
        'Quais referências representam o ambiente ideal?',
      ]),
      ...q('Investimento', [
        'Quanto pretende investir em móveis planejados?',
        'Há um valor limite para mobiliário, iluminação e decoração?',
        'Qual item considera prioridade no investimento?',
      ]),
    ],
  },
  {
    id: 'arquitetonico',
    name: 'Projeto arquitetônico',
    description: 'Residências e edificações novas, da concepção à aprovação.',
    icon: 'house',
    color: '#5A6339',
    software: ['AutoCAD', 'Revit', 'SketchUp', 'Enscape'],
    prefeituraRequired: true,
    rrtRequired: true,
    defaultDeadlineDays: 90,
    checklist: [
      { id: 'docs', title: 'Documentação do terreno', description: 'Matrícula, IPTU e levantamento topográfico.' },
      { id: 'legislacao', title: 'Consulta à legislação', description: 'Zoneamento, recuos e parâmetros urbanísticos.' },
      { id: 'briefing', title: 'Programa de necessidades', description: 'Ambientes, áreas, prioridades e orçamento.' },
      { id: 'estudo', title: 'Estudo preliminar', description: 'Implantação, plantas e volumetria.' },
      { id: 'legal', title: 'Projeto legal e prefeitura', description: 'Pranchas, requerimentos e acompanhamento.' },
      { id: 'rrt', title: 'Emitir RRT', description: 'Registrar atividade no SICCAU.' },
      { id: 'executivo', title: 'Projeto executivo', description: 'Detalhamento completo para obra.' },
    ],
    briefing: [
      ...q('Terreno e investimento', [
        'Qual é o endereço e a área do terreno?',
        'Quantos m² pretende construir? Existe limite?',
        'Quanto pretende investir na obra?',
        'A construção será executada em uma ou mais etapas?',
      ]),
      ...q('Programa de necessidades', [
        'Quantos quartos, suítes e banheiros serão necessários?',
        'Deseja garagem para quantos veículos?',
        'Precisa de depósito, despensa, escritório ou área de serviço?',
        'Deseja área gourmet, piscina, jardim ou horta?',
        'Prefere ambientes integrados ou separados?',
      ]),
      ...q('Estilo e desempenho', [
        'Prefere telhado embutido ou aparente?',
        'Qual estilo de fachada representa melhor o projeto?',
        'Qual pé-direito deseja nos ambientes principais?',
        'Há necessidades de acessibilidade?',
        'Deseja soluções de sustentabilidade ou automação?',
      ]),
    ],
  },
  {
    id: 'reforma',
    name: 'Reforma',
    description: 'Planejamento e detalhamento para transformar imóveis existentes.',
    icon: 'hammer',
    color: '#9F5621',
    software: ['AutoCAD', 'SketchUp', 'Enscape', 'Excel'],
    prefeituraRequired: true,
    rrtRequired: true,
    defaultDeadlineDays: 60,
    checklist: [
      { id: 'levantamento', title: 'Levantamento cadastral', description: 'Medições, fotos e análise do existente.' },
      { id: 'condominio', title: 'Regras do condomínio', description: 'Manual de reforma, horários e documentos.' },
      { id: 'briefing', title: 'Briefing e prioridades', description: 'Escopo, orçamento e itens que permanecem.' },
      { id: 'demolir', title: 'Planta de demolir/construir', description: 'Mapear todas as intervenções.' },
      { id: 'rrt', title: 'RRT e documentos', description: 'Emitir registros necessários antes da obra.' },
      { id: 'executivo', title: 'Detalhamentos executivos', description: 'Pontos, revestimentos e marcenaria.' },
    ],
    briefing: [
      ...q('Imóvel atual', [
        'Quais são os principais problemas do imóvel hoje?',
        'Quais ambientes serão reformados?',
        'O imóvel estará ocupado durante a obra?',
        'Há elementos que obrigatoriamente devem permanecer?',
      ]),
      ...q('Escopo', [
        'Haverá demolição ou construção de paredes?',
        'Serão alterados pontos elétricos, hidráulicos ou de gás?',
        'Haverá troca de pisos, revestimentos, forros ou esquadrias?',
        'Qual é o prazo ideal para conclusão da obra?',
        'Qual é o orçamento disponível para reforma?',
      ]),
    ],
  },
]

const category = defaultCategories[0]

export const demoProject: Project = {
  id: 'demo-1',
  name: 'Apartamento 403',
  client: 'Karol e Hugo',
  categoryId: 'interiores',
  status: 'Em andamento',
  createdAt: '2026-02-24',
  deadline: '2026-04-10',
  phone: '',
  email: '',
  address: 'Apartamento 403 — nº 1720',
  budget: 'R$ 10.000 nesta primeira fase',
  notes: 'Cliente prefere tons escuros, madeira e piso vinílico. Possui pet de pequeno porte.',
  checklist: category.checklist.map((item, index) => ({ ...item, completed: index < 2 })),
  briefing: category.briefing.map((item, index) => ({
    ...item,
    answer: index === 2 ? 'R$ 10.000 nesta primeira fase.' : index === 4 ? 'Sim, Lhasa Apso de pequeno porte.' : '',
  })),
  contract: {
    contractorName: 'Júlia Salerno — Arquiteta e Urbanista',
    contractorDocument: 'CAU nº __________________',
    contractorAddress: '',
    clientName: 'Karol e Hugo',
    clientDocument: '',
    clientAddress: '',
    projectAddress: 'Apartamento 403 — nº 1720',
    scope: 'Elaboração de projeto de design de interiores conforme briefing aprovado pelo CONTRATANTE.',
    deliverables: 'Estudo preliminar, projeto 3D, detalhamentos executivos, especificação de materiais e marcenaria.',
    totalValue: 'R$ 10.000,00',
    paymentTerms: '30% na assinatura, 40% na aprovação do estudo preliminar e 30% na entrega final.',
    deadline: '45 dias úteis, contados após a entrega de todas as informações necessárias pelo CONTRATANTE.',
    revisions: 'Estão incluídas até 2 rodadas de alterações por etapa. Alterações adicionais serão orçadas separadamente.',
    observations: 'Visitas técnicas, acompanhamento de obra, taxas, impressões e serviços de terceiros não estão incluídos, salvo quando descritos expressamente.',
    city: 'Uberlândia/MG',
    date: '24 de fevereiro de 2026',
  },
}

export const initialData: SalernoData = {
  projects: [demoProject],
  categories: defaultCategories,
}

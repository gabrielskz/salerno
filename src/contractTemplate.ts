import type { ContractClause, ContractData, Project } from './types'

export const DEFAULT_CONTRACT_TITLE = 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PROJETO DE INTERIORES RESIDENCIAL'

export function createContractClauses(contract: ContractData): ContractClause[] {
  return [
    {
      id: 'objeto',
      title: 'CLÁUSULA 1 - OBJETO',
      content: [
        `O presente contrato tem por objeto a prestação de serviços de arquitetura/interiores para o projeto localizado em ${contract.projectAddress || '[endereço do projeto]'}, compreendendo:`,
        contract.scope || '[descreva o objeto contratado]',
        '',
        'Itens previstos no objeto:',
        contract.deliverables || '[liste os itens previstos, como estudo preliminar, projeto 3D, desenhos técnicos, detalhamentos, especificações e/ou aprovação legal]',
      ].join('\n'),
    },
    {
      id: 'escopo',
      title: 'CLÁUSULA 2 - ESCOPO DOS SERVIÇOS',
      content: [
        'A CONTRATADA se compromete a desenvolver e entregar os serviços descritos neste contrato, conforme briefing, informações e documentos fornecidos pela CONTRATANTE.',
        '',
        'O escopo poderá incluir, conforme a contratação: levantamento do local, estudo preliminar, maquete eletrônica, plantas baixas, cortes, layouts, detalhamentos técnicos, especificações de materiais, caderno de projeto e entrega digital em PDF.',
      ].join('\n'),
    },
    {
      id: 'prazos',
      title: 'CLÁUSULA 3 - PRAZOS',
      content: contract.deadline || 'Os prazos de desenvolvimento serão contados a partir da assinatura deste contrato, do pagamento inicial e do recebimento integral das informações necessárias pela CONTRATADA. Eventuais atrasos na aprovação das etapas, envio de documentos ou retorno da CONTRATANTE poderão alterar o cronograma.',
    },
    {
      id: 'valor-pagamento',
      title: 'CLÁUSULA 4 - VALOR E FORMA DE PAGAMENTO',
      content: [
        `O valor total dos serviços é de ${contract.totalValue || '[valor total]'}, pagos da seguinte forma:`,
        contract.paymentTerms || '[descreva a forma de pagamento]',
        '',
        'Os pagamentos poderão ser efetuados via PIX, transferência bancária ou outro meio indicado pela CONTRATADA.',
      ].join('\n'),
    },
    {
      id: 'obrigacoes',
      title: 'CLÁUSULA 5 - OBRIGAÇÕES DAS PARTES',
      content: [
        'Da CONTRATADA:',
        '- Cumprir os prazos e etapas descritos neste contrato, desde que a CONTRATANTE forneça todas as informações necessárias em tempo hábil;',
        '- Elaborar o projeto conforme normas técnicas vigentes e boas práticas profissionais;',
        '- Fornecer os arquivos digitais em formato de fácil leitura.',
        '',
        'Da CONTRATANTE:',
        '- Fornecer informações, documentos, medidas e aprovações corretas sobre o imóvel e o projeto;',
        '- Efetuar os pagamentos nas datas acordadas;',
        '- Efetuar, quando aplicável, o pagamento de taxas, registros, boletos, emolumentos, RRT/RT, taxas municipais, impressões e serviços de terceiros;',
        '- Avaliar e aprovar as etapas do projeto conforme apresentadas.',
      ].join('\n'),
    },
    {
      id: 'direitos-autorais',
      title: 'CLÁUSULA 6 - DIREITOS AUTORAIS',
      content: 'O projeto é protegido pela Lei nº 9.610/1998 (Lei de Direitos Autorais). A CONTRATANTE possui o direito de uso para execução da obra no imóvel indicado neste contrato, sendo vedada a reprodução, cópia, modificação, revenda, cessão ou uso comercial do projeto sem autorização expressa da CONTRATADA.',
    },
    {
      id: 'rescisao',
      title: 'CLÁUSULA 7 - RESCISÃO',
      content: [
        'O contrato poderá ser rescindido por qualquer das partes, mediante comunicação escrita, observando-se que:',
        '- Caso a rescisão ocorra antes da conclusão do projeto, a CONTRATADA fará jus ao recebimento proporcional aos serviços já executados;',
        '- Caso o cancelamento ocorra após a entrega final ou após etapa já aprovada, os valores correspondentes permanecerão devidos;',
        '- Valores já pagos por etapas concluídas ou em andamento não serão devolvidos, salvo acordo escrito entre as partes.',
      ].join('\n'),
    },
    {
      id: 'disposicoes-gerais',
      title: 'CLÁUSULA 8 - DISPOSIÇÕES GERAIS',
      content: [
        'Alterações no escopo, prazos, quantidade de imagens, detalhamentos, visitas ou entregas deverão ser acordadas entre as partes por meio de aditivo contratual.',
        contract.observations || 'Serviços não descritos expressamente neste contrato não estão incluídos no valor contratado.',
      ].join('\n'),
    },
    {
      id: 'foro',
      title: 'CLÁUSULA 9 - FORO',
      content: `Fica eleito o foro da comarca de ${contract.city || '[cidade/UF]'}, com renúncia a qualquer outro, para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato.`,
    },
  ]
}

export function getContractClauses(contract: ContractData): ContractClause[] {
  return contract.clauses?.length ? contract.clauses : createContractClauses(contract)
}

export function createDefaultContract(project: Pick<Project, 'client' | 'name' | 'address'>, defaults?: Partial<ContractData>): ContractData {
  const contract: ContractData = {
    contractTitle: DEFAULT_CONTRACT_TITLE,
    contractorName: 'Júlia Salerno - Arquiteta e Urbanista',
    contractorDocument: 'CAU nº __________________',
    contractorAddress: '',
    contractorEmail: 'salernoarquurb@gmail.com',
    contractorPhone: '(34) 9271-7342',
    contractorInstagram: '@juliasalerno_arq',
    clientName: project.client,
    clientDocument: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    projectAddress: project.address || project.name,
    scope: 'Elaboração de projeto de arquitetura/interiores conforme briefing aprovado pela CONTRATANTE.',
    deliverables: 'Estudo preliminar, projeto 3D, desenhos técnicos, detalhamentos, especificações e entrega digital em PDF.',
    totalValue: '',
    paymentTerms: 'Pagamento conforme condições acordadas entre as partes.',
    deadline: 'Os prazos serão definidos conforme escopo, aprovações e recebimento das informações necessárias.',
    revisions: '',
    observations: 'Não estão incluídos serviços de terceiros, taxas, impressões, acompanhamento de obra ou itens não descritos expressamente neste contrato.',
    city: 'Uberlândia/MG',
    date: '',
    ...defaults,
  }

  return { ...contract, clauses: defaults?.clauses?.length ? defaults.clauses : createContractClauses(contract) }
}

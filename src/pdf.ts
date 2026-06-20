import { jsPDF } from 'jspdf'
import type { ContractData, Project } from './types'

const OLIVE = [90, 99, 57] as const
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_TOP = 40
const CONTENT_BOTTOM = 270
const CONTENT_MARGIN = 24
const CONTENT_WIDTH = PAGE_WIDTH - (CONTENT_MARGIN * 2)

async function loadLetterhead() {
  const response = await fetch('/assets/timbrado-salerno.png')
  if (!response.ok) throw new Error('Não foi possível carregar o timbrado SALERNO.')
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function addLetterhead(pdf: jsPDF, letterhead: string) {
  pdf.addImage(letterhead, 'PNG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT)
}

function addBlock(pdf: jsPDF, letterhead: string, title: string, text: string, y: number) {
  const lines = pdf.splitTextToSize(text || 'Não informado.', CONTENT_WIDTH)
  const needed = 8 + lines.length * 4.6
  if (y + needed > CONTENT_BOTTOM) {
    pdf.addPage()
    addLetterhead(pdf, letterhead)
    y = CONTENT_TOP
  }
  pdf.setTextColor(...OLIVE)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10.5)
  pdf.text(title.toUpperCase(), CONTENT_MARGIN, y)
  pdf.setTextColor(50, 48, 43)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(lines, CONTENT_MARGIN, y + 5.5, { lineHeightFactor: 1.3 })
  return y + needed + 2.5
}

export async function createContractPdf(project: Project, data: ContractData, letterhead?: string) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const background = letterhead || await loadLetterhead()
  addLetterhead(pdf, background)
  pdf.setTextColor(50, 48, 43)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 105, 42, { align: 'center' })
  pdf.setFontSize(10.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Projeto: ${project.name}`, 105, 48, { align: 'center' })

  let y = 58
  y = addBlock(pdf, background, '1. Partes', `CONTRATADA: ${data.contractorName}, ${data.contractorDocument}, com endereço em ${data.contractorAddress || 'endereço a preencher'}.\n\nCONTRATANTE: ${data.clientName}, ${data.clientDocument || 'documento a preencher'}, residente em ${data.clientAddress || 'endereço a preencher'}.`, y)
  y = addBlock(pdf, background, '2. Objeto do contrato', `${data.scope}\n\nLocal do projeto: ${data.projectAddress}.`, y)
  y = addBlock(pdf, background, '3. Entregáveis', data.deliverables, y)
  y = addBlock(pdf, background, '4. Honorários e forma de pagamento', `Valor total: ${data.totalValue}.\n\nForma de pagamento: ${data.paymentTerms}`, y)
  y = addBlock(pdf, background, '5. Prazo', data.deadline, y)
  y = addBlock(pdf, background, '6. Alterações', data.revisions, y)
  y = addBlock(pdf, background, '7. Responsabilidades', 'A CONTRATADA executará os serviços com diligência e conforme as normas profissionais aplicáveis. O CONTRATANTE fornecerá documentos, medidas, aprovações e informações necessárias, respondendo pela veracidade dos dados apresentados. A execução da obra deverá respeitar os projetos entregues e ser realizada por profissionais habilitados.', y)
  y = addBlock(pdf, background, '8. Direitos autorais e uso do projeto', 'O projeto é protegido pela legislação autoral. Sua utilização limita-se ao endereço e ao objeto deste contrato. Alterações, reproduções ou reutilizações dependem de autorização da CONTRATADA. A CONTRATADA poderá divulgar imagens do projeto em portfólio, preservando dados pessoais do CONTRATANTE, salvo manifestação contrária por escrito.', y)
  y = addBlock(pdf, background, '9. Rescisão', 'O contrato poderá ser rescindido por qualquer das partes mediante comunicação escrita. Serão devidos os valores proporcionais às etapas já executadas, além de despesas e compromissos assumidos até a data da rescisão.', y)
  y = addBlock(pdf, background, '10. Observações', data.observations, y)
  y = addBlock(pdf, background, '11. Foro', `Fica eleito o foro da comarca correspondente a ${data.city}, com renúncia a qualquer outro, para dirimir dúvidas decorrentes deste contrato.`, y)

  if (y > 238) {
    pdf.addPage()
    addLetterhead(pdf, background)
    y = 54
  }
  pdf.setTextColor(50, 48, 43)
  pdf.setFontSize(10)
  pdf.text(`${data.city}, ${data.date}.`, 105, y + 6, { align: 'center' })
  pdf.line(28, y + 32, 91, y + 32)
  pdf.line(119, y + 32, 182, y + 32)
  pdf.text('CONTRATADA', 59.5, y + 38, { align: 'center' })
  pdf.text('CONTRATANTE', 150.5, y + 38, { align: 'center' })
  return pdf
}

export async function generateContractPdf(project: Project, data: ContractData) {
  const pdf = await createContractPdf(project, data)
  pdf.save(`Contrato - ${project.client || project.name}.pdf`)
}

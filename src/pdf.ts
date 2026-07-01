import { jsPDF } from 'jspdf'
import { DEFAULT_CONTRACT_TITLE, formatCauForDisplay, getContractClauses, getContractorCau, getContractorCpf, getContractorSignatureLine } from './contractTemplate'
import type { ContractData, Project } from './types'

const OLIVE = [90, 99, 57] as const
const TEXT = [50, 48, 43] as const
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

function ensureSpace(pdf: jsPDF, letterhead: string, y: number, needed: number) {
  if (y + needed <= CONTENT_BOTTOM) return y
  pdf.addPage()
  addLetterhead(pdf, letterhead)
  return CONTENT_TOP
}

function addMultiline(pdf: jsPDF, text: string, x: number, y: number, width: number, lineHeight = 4.8) {
  const lines = pdf.splitTextToSize(text || 'Não informado.', width)
  pdf.text(lines, x, y, { lineHeightFactor: 1.25 })
  return y + lines.length * lineHeight
}

function addPartyBlock(pdf: jsPDF, letterhead: string, title: string, rows: string[], y: number) {
  const lines = rows.filter(Boolean)
  y = ensureSpace(pdf, letterhead, y, 9 + lines.length * 5)
  pdf.setTextColor(...OLIVE)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10.5)
  pdf.text(title.toUpperCase(), CONTENT_MARGIN, y)
  y += 6
  pdf.setTextColor(...TEXT)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  for (const line of lines) {
    y = addMultiline(pdf, line, CONTENT_MARGIN, y, CONTENT_WIDTH)
    y += 1.3
  }
  return y + 2.5
}

function addClause(pdf: jsPDF, letterhead: string, title: string, content: string, y: number) {
  const paragraphs = content.split('\n')
  const estimatedLines = paragraphs.reduce((sum, paragraph) => {
    if (!paragraph.trim()) return sum + 1
    return sum + Math.max(1, pdf.splitTextToSize(paragraph, CONTENT_WIDTH).length)
  }, 0)
  y = ensureSpace(pdf, letterhead, y, 8 + estimatedLines * 4.8)

  pdf.setTextColor(...OLIVE)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10.5)
  pdf.text(title.toUpperCase(), CONTENT_MARGIN, y)
  y += 6

  pdf.setTextColor(...TEXT)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      y += 2.2
      continue
    }
    if (paragraph.trim().startsWith('- ')) {
      y = ensureSpace(pdf, letterhead, y, 7)
      const bulletText = paragraph.trim().slice(2)
      pdf.text('•', CONTENT_MARGIN + 2, y)
      y = addMultiline(pdf, bulletText, CONTENT_MARGIN + 8, y, CONTENT_WIDTH - 8)
      y += 1.2
      continue
    }
    y = ensureSpace(pdf, letterhead, y, 8)
    y = addMultiline(pdf, paragraph, CONTENT_MARGIN, y, CONTENT_WIDTH)
    y += 1.2
  }

  return y + 3
}

function addSignatures(pdf: jsPDF, letterhead: string, data: ContractData, y: number) {
  y = ensureSpace(pdf, letterhead, y, 48)
  pdf.setTextColor(...TEXT)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(`${data.city || '[cidade/UF]'}, ${data.date || '[data]'}.`, 105, y + 5, { align: 'center' })
  y += 30
  pdf.line(28, y, 91, y)
  pdf.line(119, y, 182, y)
  pdf.text('CONTRATADA', 59.5, y + 6, { align: 'center' })
  pdf.text('CONTRATANTE', 150.5, y + 6, { align: 'center' })
  pdf.setFontSize(8.5)
  pdf.text(getContractorSignatureLine(data), 59.5, y + 12, { align: 'center', maxWidth: 62 })
  pdf.text(data.clientName || 'Contratante', 150.5, y + 12, { align: 'center', maxWidth: 62 })
}

export async function createContractPdf(project: Project, data: ContractData, letterhead?: string) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const background = letterhead || await loadLetterhead()
  addLetterhead(pdf, background)

  pdf.setTextColor(...TEXT)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  const titleLines = pdf.splitTextToSize(data.contractTitle || DEFAULT_CONTRACT_TITLE, 158)
  pdf.text(titleLines, 105, 39, { align: 'center', lineHeightFactor: 1.15 })

  let y = 39 + titleLines.length * 6 + 5
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Projeto: ${project.name}`, 105, y, { align: 'center' })
  y += 13

  y = addPartyBlock(pdf, background, 'Contratante', [
    `Nome: ${data.clientName || '[nome do cliente]'}`,
    `CPF/CNPJ: ${data.clientDocument || '[documento do cliente]'}`,
    `E-mail: ${data.clientEmail || '[e-mail do cliente]'}`,
    `Endereço: ${data.clientAddress || '[endereço do cliente]'}`,
    `Telefone: ${data.clientPhone || '[telefone do cliente]'}`,
  ], y)

  y = addPartyBlock(pdf, background, 'Contratada', [
    `Nome: ${data.contractorName || '[nome da contratada]'}`,
    `CPF: ${getContractorCpf(data) || '[CPF da contratada]'}`,
    `CAU: ${formatCauForDisplay(getContractorCau(data)) || '[CAU da contratada]'}`,
    `E-mail: ${data.contractorEmail || '[e-mail da contratada]'}`,
    `Endereço comercial: ${data.contractorAddress || '[endereço comercial]'}`,
    `Telefone: ${data.contractorPhone || '[telefone da contratada]'}`,
    `Instagram: ${data.contractorInstagram || '[instagram]'}`,
  ], y)

  for (const clause of getContractClauses(data)) {
    y = addClause(pdf, background, clause.title, clause.content, y)
  }

  addSignatures(pdf, background, data, y)
  return pdf
}

export async function generateContractPdf(project: Project, data: ContractData) {
  const pdf = await createContractPdf(project, data)
  pdf.save(`Contrato - ${project.client || project.name}.pdf`)
}

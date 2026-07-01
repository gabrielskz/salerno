export type ProjectStatus = 'Em andamento' | 'Aguardando cliente' | 'Concluído'
export type ProjectTab = 'visao' | 'briefing' | 'processo' | 'contrato'

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
}

export interface BriefingQuestion {
  id: string
  section: string
  question: string
  answer: string
}

export interface CategoryTemplate {
  id: string
  name: string
  description: string
  icon: string
  color: string
  software: string[]
  prefeituraRequired: boolean
  rrtRequired: boolean
  checklist: Omit<ChecklistItem, 'completed'>[]
  briefing: Omit<BriefingQuestion, 'answer'>[]
  defaultDeadlineDays: number
}

export interface ContractData {
  contractTitle?: string
  contractorName: string
  contractorDocument: string
  contractorAddress: string
  contractorEmail?: string
  contractorPhone?: string
  contractorInstagram?: string
  clientName: string
  clientDocument: string
  clientAddress: string
  clientEmail?: string
  clientPhone?: string
  projectAddress: string
  scope: string
  deliverables: string
  totalValue: string
  paymentTerms: string
  deadline: string
  revisions: string
  observations: string
  city: string
  date: string
  clauses?: ContractClause[]
}

export interface ContractClause {
  id: string
  title: string
  content: string
}

export interface Project {
  id: string
  name: string
  client: string
  categoryId: string
  status: ProjectStatus
  createdAt: string
  deadline: string
  phone: string
  email: string
  address: string
  budget: string
  notes: string
  checklist: ChecklistItem[]
  briefing: BriefingQuestion[]
  contract: ContractData
}

export interface SalernoData {
  projects: Project[]
  categories: CategoryTemplate[]
}

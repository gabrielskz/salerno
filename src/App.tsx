import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, BriefcaseBusiness, Building2, CalendarDays, Check, ChevronRight,
  CircleDollarSign, ClipboardCheck, Cloud, CloudOff, Download, FilePenLine,
  FolderKanban, Hammer, House, LayoutDashboard, Menu, MoreHorizontal, Plus,
  Search, Settings, Sofa, Sparkles, Trash2, UserRound, X,
} from 'lucide-react'
import { addDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { initialData } from './data'
import { firebaseEnabled, loadCloudData, login, logout, observeUser, register, saveCloudData } from './firebase'
import { formatCurrency, formatPhone } from './formatters'
import { generateContractPdf } from './pdf'
import type {
  CategoryTemplate, ContractData, Project, ProjectStatus, ProjectTab, SalernoData,
} from './types'

type View = 'dashboard' | 'projects' | 'categories' | 'settings' | 'project'

const iconMap = {
  sofa: Sofa,
  house: House,
  hammer: Hammer,
  building: Building2,
}

const STORAGE_KEY = 'salerno-workspace-v1'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatDate(value: string) {
  if (!value) return 'Sem prazo'
  return format(parseISO(value), "dd 'de' MMM", { locale: ptBR })
}

function getAuthErrorMessage(error: unknown, mode: 'login' | 'register') {
  if (!(error instanceof FirebaseError)) {
    return 'Não foi possível concluir. Tente novamente em alguns instantes.'
  }

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Esse e-mail já tem uma conta. Clique em “Já tenho conta” e entre com a senha cadastrada.',
    'auth/invalid-email': 'O e-mail digitado não é válido. Confira se ele está correto.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/missing-password': 'Digite uma senha com pelo menos 6 caracteres.',
    'auth/operation-not-allowed': 'O login por e-mail/senha ainda não está liberado neste projeto do Firebase.',
    'auth/invalid-credential': 'E-mail ou senha incorretos. Se ainda não criou a conta, clique em “Primeiro acesso? Criar conta”.',
    'auth/user-not-found': 'Não existe conta cadastrada com esse e-mail. Clique em “Primeiro acesso? Criar conta”.',
    'auth/wrong-password': 'Senha incorreta para esse e-mail.',
    'auth/too-many-requests': 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.',
    'auth/network-request-failed': 'Falha de conexão com o Firebase. Confira se localhost/127.0.0.1 está em Authentication > Configurações > Domínios autorizados, reinicie o npm run dev depois de alterar o .env.local e teste sem VPN/adblock.',
    'auth/unauthorized-domain': 'Este domínio não está autorizado no Firebase. Adicione localhost ou o domínio da Vercel em Authentication > Configurações > Domínios autorizados.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'A API key do Firebase no .env.local está inválida. Copie novamente as configurações do app Web.',
    'auth/invalid-api-key': 'A API key do Firebase no .env.local está inválida. Copie novamente as configurações do app Web.',
    'auth/app-not-authorized': 'Este app Web não está autorizado neste projeto Firebase. Confira se o authDomain e o projectId do .env.local são do mesmo projeto.',
  }

  return messages[error.code] || `Firebase retornou: ${error.code}. ${mode === 'register' ? 'Confira as configurações do Authentication e tente criar a conta novamente.' : 'Confira os dados e tente entrar novamente.'}`
}

function App() {
  const [data, setData] = useState<SalernoData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialData
  })
  const [view, setView] = useState<View>('dashboard')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [projectTab, setProjectTab] = useState<ProjectTab>('visao')
  const [search, setSearch] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [projectModal, setProjectModal] = useState(false)
  const [categoryModal, setCategoryModal] = useState(false)
  const [user, setUser] = useState<User | null | undefined>(firebaseEnabled ? undefined : null)
  const [cloudReady, setCloudReady] = useState(!firebaseEnabled)
  const [syncState, setSyncState] = useState<'local' | 'syncing' | 'synced' | 'error'>(
    firebaseEnabled ? 'syncing' : 'local',
  )

  useEffect(() => {
    if (!firebaseEnabled) return
    return observeUser(setUser)
  }, [])

  useEffect(() => {
    if (!firebaseEnabled || !user) return
    setCloudReady(false)
    loadCloudData(user.uid)
      .then((cloud) => {
        if (cloud) setData(cloud)
        setCloudReady(true)
        setSyncState('synced')
      })
      .catch(() => setSyncState('error'))
  }, [user])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    if (!firebaseEnabled || !user || !cloudReady) return
    const timer = window.setTimeout(() => {
      setSyncState('syncing')
      saveCloudData(user.uid, data).then(() => setSyncState('synced')).catch(() => setSyncState('error'))
    }, 800)
    return () => window.clearTimeout(timer)
  }, [data, user, cloudReady])

  const selectedProject = data.projects.find((project) => project.id === selectedId)

  function navigate(next: View) {
    setView(next)
    setMobileMenu(false)
  }

  function openProject(projectId: string) {
    setSelectedId(projectId)
    setProjectTab('visao')
    setView('project')
  }

  function updateProject(projectId: string, updater: (project: Project) => Project) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === projectId ? updater(project) : project),
    }))
  }

  function deleteProject(projectId: string) {
    if (!window.confirm('Excluir este projeto? Essa ação não pode ser desfeita.')) return
    setData((current) => ({ ...current, projects: current.projects.filter((p) => p.id !== projectId) }))
    navigate('projects')
  }

  const pageTitle = view === 'dashboard' ? 'Visão geral'
    : view === 'projects' ? 'Projetos'
      : view === 'categories' ? 'Categorias'
        : view === 'settings' ? 'Configurações'
          : selectedProject?.name || 'Projeto'

  if (firebaseEnabled && user === undefined) return <div className="loading-screen"><Logo /><span>Carregando seu espaço...</span></div>
  if (firebaseEnabled && user === null) return <AuthScreen />

  return (
    <div className="app-shell">
      <Sidebar view={view} onNavigate={navigate} open={mobileMenu} onClose={() => setMobileMenu(false)} />
      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileMenu(true)} aria-label="Abrir menu">
            <Menu size={21} />
          </button>
          <div className="topbar-title">
            {view === 'project' && (
              <button className="back-button" onClick={() => navigate('projects')}><ArrowLeft size={18} /></button>
            )}
            <div>
              <span className="eyebrow">SALERNO · GESTÃO</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>
          <div className={`sync-pill ${syncState}`}>
            {syncState === 'synced' ? <Cloud size={15} /> : syncState === 'local' ? <CloudOff size={15} /> : <Cloud size={15} />}
            <span>{syncState === 'synced' ? 'Firebase' : syncState === 'syncing' ? 'Salvando...' : syncState === 'error' ? 'Erro ao sincronizar' : 'Modo local'}</span>
          </div>
        </header>

        <div className="page">
          {view === 'dashboard' && (
            <Dashboard
              data={data}
              onOpenProject={openProject}
              onNewProject={() => setProjectModal(true)}
              onAllProjects={() => navigate('projects')}
            />
          )}
          {view === 'projects' && (
            <ProjectsPage
              projects={data.projects}
              categories={data.categories}
              search={search}
              setSearch={setSearch}
              onOpen={openProject}
              onNew={() => setProjectModal(true)}
            />
          )}
          {view === 'categories' && (
            <CategoriesPage
              categories={data.categories}
              onNew={() => setCategoryModal(true)}
              onDelete={(id) => setData((current) => ({
                ...current,
                categories: current.categories.filter((category) => category.id !== id),
              }))}
            />
          )}
          {view === 'settings' && <SettingsPage firebaseEnabled={firebaseEnabled} onLogout={firebaseEnabled ? logout : undefined} />}
          {view === 'project' && selectedProject && (
            <ProjectPage
              project={selectedProject}
              category={data.categories.find((category) => category.id === selectedProject.categoryId)}
              tab={projectTab}
              setTab={setProjectTab}
              update={(updater) => updateProject(selectedProject.id, updater)}
              onDelete={() => deleteProject(selectedProject.id)}
            />
          )}
        </div>
      </main>
      <MobileNav view={view} onNavigate={navigate} onNew={() => setProjectModal(true)} />

      {projectModal && (
        <NewProjectModal
          categories={data.categories}
          onClose={() => setProjectModal(false)}
          onCreate={(project) => {
            setData((current) => ({ ...current, projects: [project, ...current.projects] }))
            setProjectModal(false)
            openProject(project.id)
          }}
        />
      )}
      {categoryModal && (
        <NewCategoryModal
          onClose={() => setCategoryModal(false)}
          onCreate={(category) => {
            setData((current) => ({ ...current, categories: [...current.categories, category] }))
            setCategoryModal(false)
          }}
        />
      )}
    </div>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span>SALERNO</span>
      <small>ARQUITETURA</small>
    </div>
  )
}

function Sidebar({ view, onNavigate, open, onClose }: {
  view: View
  onNavigate: (view: View) => void
  open: boolean
  onClose: () => void
}) {
  const links = [
    { id: 'dashboard' as View, label: 'Visão geral', icon: LayoutDashboard },
    { id: 'projects' as View, label: 'Projetos', icon: FolderKanban },
    { id: 'categories' as View, label: 'Categorias', icon: BriefcaseBusiness },
    { id: 'settings' as View, label: 'Configurações', icon: Settings },
  ]
  return (
    <>
      {open && <button className="sidebar-overlay" onClick={onClose} aria-label="Fechar menu" />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-head">
          <Logo />
          <button className="icon-button mobile-only" onClick={onClose}><X size={20} /></button>
        </div>
        <nav>
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? 'active' : ''} onClick={() => onNavigate(id)}>
              <Icon size={19} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-quote">
          <Sparkles size={18} />
          <p>Projetos com intenção, processos com clareza.</p>
        </div>
        <div className="profile">
          <div className="avatar">JS</div>
          <div><strong>Júlia Salerno</strong><span>Arquiteta</span></div>
        </div>
      </aside>
    </>
  )
}

function MobileNav({ view, onNavigate, onNew }: {
  view: View
  onNavigate: (view: View) => void
  onNew: () => void
}) {
  return (
    <nav className="mobile-nav">
      <button className={view === 'dashboard' ? 'active' : ''} onClick={() => onNavigate('dashboard')}>
        <LayoutDashboard /><span>Início</span>
      </button>
      <button className={view === 'projects' || view === 'project' ? 'active' : ''} onClick={() => onNavigate('projects')}>
        <FolderKanban /><span>Projetos</span>
      </button>
      <button className="mobile-new" onClick={onNew}><Plus /></button>
      <button className={view === 'categories' ? 'active' : ''} onClick={() => onNavigate('categories')}>
        <BriefcaseBusiness /><span>Categorias</span>
      </button>
      <button className={view === 'settings' ? 'active' : ''} onClick={() => onNavigate('settings')}>
        <Settings /><span>Ajustes</span>
      </button>
    </nav>
  )
}

function Dashboard({ data, onOpenProject, onNewProject, onAllProjects }: {
  data: SalernoData
  onOpenProject: (id: string) => void
  onNewProject: () => void
  onAllProjects: () => void
}) {
  const active = data.projects.filter((p) => p.status === 'Em andamento').length
  const waiting = data.projects.filter((p) => p.status === 'Aguardando cliente').length
  const done = data.projects.filter((p) => p.status === 'Concluído').length
  const totalTasks = data.projects.reduce((sum, p) => sum + p.checklist.length, 0)
  const completedTasks = data.projects.reduce((sum, p) => sum + p.checklist.filter((i) => i.completed).length, 0)
  return (
    <>
      <section className="welcome">
        <div>
          <span className="eyebrow light">BOM DIA, JÚLIA</span>
          <h2>Seus projetos,<br /><em>todos no lugar.</em></h2>
          <p>Acompanhe briefings, etapas e contratos sem perder nenhum detalhe.</p>
          <button className="primary-button cream" onClick={onNewProject}><Plus size={18} /> Novo projeto</button>
        </div>
        <div className="welcome-shapes" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <section className="stats-grid">
        <StatCard label="Em andamento" value={active} icon={FolderKanban} tone="terracotta" />
        <StatCard label="Aguardando" value={waiting} icon={CalendarDays} tone="olive" />
        <StatCard label="Concluídos" value={done} icon={Check} tone="green" />
        <StatCard label="Tarefas feitas" value={`${completedTasks}/${totalTasks}`} icon={ClipboardCheck} tone="sand" />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">ACESSO RÁPIDO</span><h3>Projetos recentes</h3></div>
          <button className="text-button" onClick={onAllProjects}>Ver todos <ChevronRight size={16} /></button>
        </div>
        {data.projects.length ? (
          <div className="project-grid">
            {data.projects.slice(0, 3).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                category={data.categories.find((category) => category.id === project.categoryId)}
                onClick={() => onOpenProject(project.id)}
              />
            ))}
          </div>
        ) : <EmptyState onNew={onNewProject} />}
      </section>
    </>
  )
}

function StatCard({ label, value, icon: Icon, tone }: {
  label: string
  value: string | number
  icon: typeof FolderKanban
  tone: string
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
      <div><strong>{value}</strong><span>{label}</span></div>
    </article>
  )
}

function ProjectsPage({ projects, categories, search, setSearch, onOpen, onNew }: {
  projects: Project[]
  categories: CategoryTemplate[]
  search: string
  setSearch: (value: string) => void
  onOpen: (id: string) => void
  onNew: () => void
}) {
  const filtered = projects.filter((project) =>
    `${project.name} ${project.client}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <section className="section-block flush">
      <div className="section-heading projects-heading">
        <div><span className="eyebrow">PORTFÓLIO ATIVO</span><h3>Todos os projetos</h3></div>
        <button className="primary-button" onClick={onNew}><Plus size={18} /> Novo projeto</button>
      </div>
      <div className="search-box">
        <Search size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por projeto ou cliente..." />
      </div>
      {filtered.length ? (
        <div className="project-grid">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} category={categories.find((c) => c.id === project.categoryId)} onClick={() => onOpen(project.id)} />
          ))}
        </div>
      ) : <EmptyState onNew={onNew} />}
    </section>
  )
}

function ProjectCard({ project, category, onClick }: {
  project: Project
  category?: CategoryTemplate
  onClick: () => void
}) {
  const progress = project.checklist.length
    ? Math.round(project.checklist.filter((item) => item.completed).length / project.checklist.length * 100)
    : 0
  const Icon = iconMap[category?.icon as keyof typeof iconMap] || Building2
  return (
    <button className="project-card" onClick={onClick}>
      <div className="project-card-top">
        <div className="category-icon" style={{ backgroundColor: `${category?.color || '#5A6339'}18`, color: category?.color }}>
          <Icon size={22} />
        </div>
        <span className={`status ${project.status.toLowerCase().replaceAll(' ', '-')}`}>{project.status}</span>
      </div>
      <span className="category-label">{category?.name || 'Sem categoria'}</span>
      <h4>{project.name}</h4>
      <p><UserRound size={14} /> {project.client || 'Cliente não informado'}</p>
      <div className="progress-row"><span>Progresso</span><strong>{progress}%</strong></div>
      <div className="progress-bar"><i style={{ width: `${progress}%` }} /></div>
      <div className="card-footer"><CalendarDays size={15} /> Prazo: {formatDate(project.deadline)} <ChevronRight size={17} /></div>
    </button>
  )
}

function CategoriesPage({ categories, onNew, onDelete }: {
  categories: CategoryTemplate[]
  onNew: () => void
  onDelete: (id: string) => void
}) {
  return (
    <section className="section-block flush">
      <div className="section-heading projects-heading">
        <div>
          <span className="eyebrow">MODELOS REUTILIZÁVEIS</span>
          <h3>Tipos de projeto</h3>
          <p className="subtext">Cada categoria guarda seu próprio briefing, etapas, softwares e obrigações.</p>
        </div>
        <button className="primary-button" onClick={onNew}><Plus size={18} /> Nova categoria</button>
      </div>
      <div className="category-grid">
        {categories.map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap] || Building2
          return (
            <article className="category-card" key={category.id}>
              <div className="category-card-head">
                <div className="category-icon large" style={{ backgroundColor: `${category.color}18`, color: category.color }}><Icon /></div>
                <button className="icon-button danger" onClick={() => onDelete(category.id)} aria-label="Excluir categoria"><Trash2 size={17} /></button>
              </div>
              <h4>{category.name}</h4>
              <p>{category.description}</p>
              <div className="category-meta">
                <span><ClipboardCheck size={15} /> {category.checklist.length} etapas</span>
                <span><FilePenLine size={15} /> {category.briefing.length} perguntas</span>
              </div>
              <div className="chips">
                {category.software.map((software) => <span key={software}>{software}</span>)}
              </div>
              <div className="required-row">
                <span className={category.prefeituraRequired ? 'yes' : ''}>Prefeitura {category.prefeituraRequired ? '✓' : '—'}</span>
                <span className={category.rrtRequired ? 'yes' : ''}>RRT {category.rrtRequired ? '✓' : '—'}</span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ProjectPage({ project, category, tab, setTab, update, onDelete }: {
  project: Project
  category?: CategoryTemplate
  tab: ProjectTab
  setTab: (tab: ProjectTab) => void
  update: (updater: (project: Project) => Project) => void
  onDelete: () => void
}) {
  const tabs: { id: ProjectTab, label: string }[] = [
    { id: 'visao', label: 'Visão geral' },
    { id: 'briefing', label: 'Briefing' },
    { id: 'processo', label: 'Processo' },
    { id: 'contrato', label: 'Contrato' },
  ]
  return (
    <>
      <div className="project-hero">
        <div>
          <span>{category?.name}</span>
          <h2>{project.name}</h2>
          <p><UserRound size={16} /> {project.client}</p>
        </div>
        <select value={project.status} onChange={(e) => update((p) => ({ ...p, status: e.target.value as ProjectStatus }))}>
          <option>Em andamento</option>
          <option>Aguardando cliente</option>
          <option>Concluído</option>
        </select>
      </div>
      <div className="tabs">
        {tabs.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}
      </div>
      {tab === 'visao' && <OverviewTab project={project} category={category} update={update} onDelete={onDelete} />}
      {tab === 'briefing' && <BriefingTab project={project} update={update} />}
      {tab === 'processo' && <ProcessTab project={project} category={category} update={update} />}
      {tab === 'contrato' && <ContractTab project={project} update={update} />}
    </>
  )
}

function OverviewTab({ project, category, update, onDelete }: {
  project: Project
  category?: CategoryTemplate
  update: (updater: (project: Project) => Project) => void
  onDelete: () => void
}) {
  return (
    <div className="detail-grid">
      <section className="panel">
        <div className="panel-title"><h3>Dados do projeto</h3><FilePenLine size={18} /></div>
        <div className="form-grid">
          <Field label="Cliente" value={project.client} onChange={(client) => update((p) => ({ ...p, client }))} />
          <Field
            label="Telefone"
            value={project.phone}
            onChange={(phone) => update((p) => ({ ...p, phone: formatPhone(phone) }))}
            placeholder="(34) 99999-9999"
            inputMode="tel"
            maxLength={15}
          />
          <Field label="E-mail" value={project.email} onChange={(email) => update((p) => ({ ...p, email }))} />
          <Field label="Prazo" type="date" value={project.deadline} onChange={(deadline) => update((p) => ({ ...p, deadline }))} />
          <Field label="Endereço do projeto" className="full" value={project.address} onChange={(address) => update((p) => ({ ...p, address }))} />
          <Field
            label="Orçamento do cliente"
            className="full"
            value={project.budget}
            onChange={(budget) => update((p) => ({ ...p, budget: formatCurrency(budget) }))}
            placeholder="R$ 0,00"
            inputMode="numeric"
          />
          <label className="field full"><span>Observações</span><textarea value={project.notes} onChange={(e) => update((p) => ({ ...p, notes: e.target.value }))} rows={4} /></label>
        </div>
      </section>
      <aside className="side-stack">
        <section className="panel compact">
          <div className="panel-title"><h3>Recursos</h3></div>
          <div className="info-list">
            <div><span>Softwares</span><strong>{category?.software.join(', ') || '—'}</strong></div>
            <div><span>Prefeitura</span><strong>{category?.prefeituraRequired ? 'Necessário' : 'Não se aplica'}</strong></div>
            <div><span>RRT</span><strong>{category?.rrtRequired ? 'Necessário' : 'Não se aplica'}</strong></div>
          </div>
        </section>
        <button className="delete-button" onClick={onDelete}><Trash2 size={17} /> Excluir projeto</button>
      </aside>
    </div>
  )
}

function BriefingTab({ project, update }: {
  project: Project
  update: (updater: (project: Project) => Project) => void
}) {
  const sections = [...new Set(project.briefing.map((item) => item.section))]
  const answered = project.briefing.filter((item) => item.answer.trim()).length
  return (
    <section className="panel briefing-panel">
      <div className="panel-title briefing-title">
        <div><h3>Briefing do cliente</h3><p>Responda “N/A” quando a pergunta não se aplicar.</p></div>
        <span className="completion">{answered}/{project.briefing.length} respondidas</span>
      </div>
      {sections.map((section) => (
        <div className="briefing-section" key={section}>
          <h4>{section}</h4>
          {project.briefing.filter((item) => item.section === section).map((item, index) => (
            <label className="question" key={item.id}>
              <span><b>{index + 1}.</b> {item.question}</span>
              <textarea
                value={item.answer}
                placeholder="Digite a resposta..."
                rows={2}
                onChange={(e) => update((p) => ({
                  ...p,
                  briefing: p.briefing.map((question) => question.id === item.id ? { ...question, answer: e.target.value } : question),
                }))}
              />
            </label>
          ))}
        </div>
      ))}
    </section>
  )
}

function ProcessTab({ project, category, update }: {
  project: Project
  category?: CategoryTemplate
  update: (updater: (project: Project) => Project) => void
}) {
  const done = project.checklist.filter((item) => item.completed).length
  return (
    <div className="detail-grid">
      <section className="panel">
        <div className="panel-title">
          <div><h3>Checklist do projeto</h3><p>{done} de {project.checklist.length} etapas concluídas</p></div>
          <ClipboardCheck size={20} />
        </div>
        <div className="checklist">
          {project.checklist.map((item) => (
            <label className={`check-item ${item.completed ? 'done' : ''}`} key={item.id}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => update((p) => ({
                  ...p,
                  checklist: p.checklist.map((check) => check.id === item.id ? { ...check, completed: !check.completed } : check),
                }))}
              />
              <i><Check size={15} /></i>
              <div><strong>{item.title}</strong><span>{item.description}</span></div>
            </label>
          ))}
        </div>
      </section>
      <aside className="side-stack">
        {category?.prefeituraRequired && (
          <GuideCard title="Protocolo na prefeitura" icon={Building2} steps={[
            'Consultar legislação e documentação exigida no município.',
            'Preparar projeto legal, formulários e documentos do proprietário.',
            'Emitir taxas, protocolar e salvar o número do processo.',
            'Acompanhar análises e responder às eventuais pendências.',
            'Baixar e arquivar o projeto aprovado e o alvará.',
          ]} />
        )}
        {category?.rrtRequired && (
          <GuideCard title="Emissão de RRT" icon={FilePenLine} steps={[
            'Acessar o SICCAU com login profissional.',
            'Selecionar novo RRT e o grupo de atividade adequado.',
            'Preencher contratante, endereço, atividade e honorários.',
            'Revisar os dados, gerar o boleto e efetuar o pagamento.',
            'Baixar o RRT registrado e anexar ao projeto.',
          ]} />
        )}
      </aside>
    </div>
  )
}

function GuideCard({ title, icon: Icon, steps }: { title: string, icon: typeof Building2, steps: string[] }) {
  return (
    <section className="panel compact guide">
      <div className="panel-title"><h3>{title}</h3><Icon size={19} /></div>
      <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
    </section>
  )
}

function ContractTab({ project, update }: {
  project: Project
  update: (updater: (project: Project) => Project) => void
}) {
  function setContract(key: keyof ContractData, value: string) {
    update((p) => ({ ...p, contract: { ...p.contract, [key]: value } }))
  }
  const c = project.contract
  return (
    <div className="contract-layout">
      <section className="panel contract-form">
        <div className="panel-title">
          <div><h3>Contrato editável</h3><p>Revise os dados antes de gerar o documento.</p></div>
          <button className="primary-button" onClick={() => generateContractPdf(project, c)}><Download size={17} /> Gerar PDF</button>
        </div>
        <div className="form-grid">
          <Field label="Contratada" value={c.contractorName} onChange={(v) => setContract('contractorName', v)} />
          <Field label="CAU / documento" value={c.contractorDocument} onChange={(v) => setContract('contractorDocument', v)} />
          <Field label="Cliente" value={c.clientName} onChange={(v) => setContract('clientName', v)} />
          <Field label="CPF / CNPJ do cliente" value={c.clientDocument} onChange={(v) => setContract('clientDocument', v)} />
          <Field label="Endereço do cliente" className="full" value={c.clientAddress} onChange={(v) => setContract('clientAddress', v)} />
          <Field label="Endereço do projeto" className="full" value={c.projectAddress} onChange={(v) => setContract('projectAddress', v)} />
          <TextField label="Objeto / escopo" value={c.scope} onChange={(v) => setContract('scope', v)} />
          <TextField label="Entregáveis" value={c.deliverables} onChange={(v) => setContract('deliverables', v)} />
          <Field label="Valor total" value={c.totalValue} onChange={(v) => setContract('totalValue', formatCurrency(v))} placeholder="R$ 0,00" inputMode="numeric" />
          <Field label="Cidade / foro" value={c.city} onChange={(v) => setContract('city', v)} />
          <TextField label="Forma de pagamento" value={c.paymentTerms} onChange={(v) => setContract('paymentTerms', v)} />
          <TextField label="Prazo" value={c.deadline} onChange={(v) => setContract('deadline', v)} />
          <TextField label="Alterações incluídas" value={c.revisions} onChange={(v) => setContract('revisions', v)} />
          <TextField label="Observações e exclusões" value={c.observations} onChange={(v) => setContract('observations', v)} />
          <Field label="Data por extenso" className="full" value={c.date} onChange={(v) => setContract('date', v)} />
        </div>
      </section>
      <aside className="letterhead-preview">
        <div className="paper-title">CONTRATO DE<br />PRESTAÇÃO DE SERVIÇOS</div>
        <div className="paper-lines"><i /><i /><i /><i /><i /><i /></div>
      </aside>
    </div>
  )
}

function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
    } catch (err) {
      setError(getAuthErrorMessage(err, mode))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-brand">
        <Logo />
        <div>
          <span className="eyebrow light">GESTÃO DE PROJETOS</span>
          <h1>Processos claros.<br /><em>Projetos com alma.</em></h1>
          <p>Briefings, etapas, contratos e prazos reunidos no mesmo lugar.</p>
        </div>
        <div className="auth-orb one" /><div className="auth-orb two" />
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">ÁREA RESTRITA</span>
          <h2>{mode === 'login' ? 'Bem-vinda de volta' : 'Crie seu acesso'}</h2>
          <p>{mode === 'login' ? 'Entre para acessar seus projetos.' : 'Use o mesmo acesso no computador e no celular.'}</p>
          <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
          <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="Mínimo de 6 caracteres" />
          {error && <div className="auth-error">{error}</div>}
          <button className="primary-button auth-submit" disabled={loading}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
          <button type="button" className="auth-toggle" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Primeiro acesso? Criar conta' : 'Já tenho conta'}
          </button>
        </form>
      </section>
    </div>
  )
}

function SettingsPage({ firebaseEnabled, onLogout }: { firebaseEnabled: boolean, onLogout?: () => void }) {
  return (
    <div className="settings-grid">
      <section className="panel">
        <div className="panel-title"><h3>Integração com Firebase</h3>{firebaseEnabled ? <Cloud /> : <CloudOff />}</div>
        <div className={`firebase-status ${firebaseEnabled ? 'connected' : ''}`}>
          <strong>{firebaseEnabled ? 'Firebase configurado' : 'Modo local ativo'}</strong>
          <p>{firebaseEnabled ? 'Os dados são sincronizados automaticamente com o Firestore.' : 'Preencha as variáveis do arquivo .env para ativar a nuvem. Enquanto isso, os dados ficam salvos neste navegador.'}</p>
        </div>
        <div className="code-list">
          <code>VITE_FIREBASE_API_KEY</code>
          <code>VITE_FIREBASE_AUTH_DOMAIN</code>
          <code>VITE_FIREBASE_PROJECT_ID</code>
          <code>VITE_FIREBASE_STORAGE_BUCKET</code>
          <code>VITE_FIREBASE_MESSAGING_SENDER_ID</code>
          <code>VITE_FIREBASE_APP_ID</code>
        </div>
      </section>
      <section className="panel">
        <div className="panel-title"><h3>Identidade SALERNO</h3><Sparkles /></div>
        <div className="palette">
          {['#8F430D', '#9F5621', '#5A6339', '#6D7550', '#F7E9DE'].map((color) => <div key={color}><i style={{ background: color }} /><span>{color}</span></div>)}
        </div>
        <p className="subtext">Paleta aplicada à interface, aos componentes e ao contrato em PDF.</p>
        {onLogout && <button className="delete-button settings-logout" onClick={onLogout}>Sair da conta</button>}
      </section>
    </div>
  )
}

function NewProjectModal({ categories, onClose, onCreate }: {
  categories: CategoryTemplate[]
  onClose: () => void
  onCreate: (project: Project) => void
}) {
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const category = categories.find((item) => item.id === categoryId)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !client || !category) return
    const today = new Date()
    const project: Project = {
      id: uid(), name, client, categoryId, status: 'Em andamento',
      createdAt: format(today, 'yyyy-MM-dd'),
      deadline: format(addDays(today, category.defaultDeadlineDays), 'yyyy-MM-dd'),
      phone: '', email: '', address: '', budget: '', notes: '',
      checklist: category.checklist.map((item) => ({ ...item, completed: false })),
      briefing: category.briefing.map((item) => ({ ...item, answer: '' })),
      contract: {
        contractorName: 'Júlia Salerno — Arquiteta e Urbanista',
        contractorDocument: 'CAU nº __________________',
        contractorAddress: '',
        clientName: client,
        clientDocument: '',
        clientAddress: '',
        projectAddress: '',
        scope: `Elaboração de ${category.name.toLowerCase()} conforme briefing aprovado pelo CONTRATANTE.`,
        deliverables: category.checklist.map((item) => item.title).join(', ') + '.',
        totalValue: '',
        paymentTerms: '30% na assinatura, 40% durante o desenvolvimento e 30% na entrega final.',
        deadline: `${category.defaultDeadlineDays} dias, contados após o recebimento de todas as informações necessárias.`,
        revisions: 'Estão incluídas até 2 rodadas de alterações por etapa.',
        observations: 'Taxas, impressões, acompanhamento de obra e serviços de terceiros não estão incluídos, salvo quando descritos expressamente.',
        city: 'Uberlândia/MG',
        date: format(today, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      },
    }
    onCreate(project)
  }
  return (
    <Modal title="Novo projeto" subtitle="Comece escolhendo um modelo de processo." onClose={onClose}>
      <form onSubmit={submit} className="modal-form">
        <Field label="Nome do projeto" value={name} onChange={setName} placeholder="Ex.: Casa Oliveira" />
        <Field label="Cliente" value={client} onChange={setClient} placeholder="Nome do cliente" />
        <label className="field full"><span>Tipo de projeto</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        {category && <div className="template-summary"><ClipboardCheck size={18} /><span>{category.checklist.length} etapas · {category.briefing.length} perguntas · prazo inicial de {category.defaultDeadlineDays} dias</span></div>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">Criar projeto</button></div>
      </form>
    </Modal>
  )
}

function NewCategoryModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (category: CategoryTemplate) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [software, setSoftware] = useState('')
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    onCreate({
      id: uid(), name, description, icon: 'building', color: '#6D7550',
      software: software.split(',').map((item) => item.trim()).filter(Boolean),
      prefeituraRequired: false, rrtRequired: false, defaultDeadlineDays: 30,
      checklist: [
        { id: uid(), title: 'Briefing com o cliente', description: 'Registrar necessidades e referências.' },
        { id: uid(), title: 'Desenvolvimento do projeto', description: 'Executar o escopo contratado.' },
        { id: uid(), title: 'Entrega final', description: 'Revisar e enviar todos os arquivos.' },
      ],
      briefing: [
        { id: uid(), section: 'Informações iniciais', question: 'Qual é o objetivo principal do projeto?' },
        { id: uid(), section: 'Informações iniciais', question: 'Qual é o prazo desejado?' },
        { id: uid(), section: 'Investimento', question: 'Qual é o orçamento disponível?' },
      ],
    })
  }
  return (
    <Modal title="Nova categoria" subtitle="Você poderá usar este modelo em novos projetos." onClose={onClose}>
      <form onSubmit={submit} className="modal-form">
        <Field label="Nome da categoria" value={name} onChange={setName} placeholder="Ex.: Consultoria" />
        <Field label="Descrição" value={description} onChange={setDescription} placeholder="Uma frase sobre este serviço" />
        <Field label="Softwares" value={software} onChange={setSoftware} placeholder="AutoCAD, SketchUp, Excel" />
        <div className="template-summary"><Sparkles size={18} /><span>A categoria será criada com um checklist e briefing iniciais.</span></div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">Criar categoria</button></div>
      </form>
    </Modal>
  )
}

function Modal({ title, subtitle, onClose, children }: {
  title: string
  subtitle: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head"><div><span className="eyebrow">SALERNO</span><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose}><X /></button></div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, className = '', type = 'text', placeholder = '', inputMode, maxLength }: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
  type?: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
}) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function TextField({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) {
  return <label className="field full"><span>{label}</span><textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} /></label>
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="empty-state"><FolderKanban /><h3>Nenhum projeto por aqui</h3><p>Crie o primeiro projeto para começar.</p><button className="primary-button" onClick={onNew}><Plus size={18} /> Novo projeto</button></div>
  )
}

export default App

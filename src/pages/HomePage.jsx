import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageSection from '../components/common/PageSection.jsx'
import InfoCard from '../components/ui/InfoCard.jsx'
import StatusCard from '../components/ui/StatusCard.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../auth/useAuth.js'
import { useRoleAccess } from '../auth/useRoleAccess.js'
import { getProjects } from '../services/projectService.js'
import { getTasks } from '../services/taskService.js'
import { getDevelopers } from '../services/developerService.js'
import { getChefsDeProjet } from '../services/chefDeProjetService.js'
import { getManagers } from '../services/managerService.js'
import {
  getApiErrorMessage,
  getCollection,
  getText,
} from '../utils/apiResponse.js'

const FOCUS_OPTIONS = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'team', label: 'Team' },
]

const WINDOW_OPTIONS = [
  { id: '30d', label: 'Last 30 days' },
  { id: 'quarter', label: 'Quarter view' },
  { id: 'live', label: 'Live mode' },
]

const STATUS_ORDER = ['pending', 'in_progress', 'done', 'validated']
const STATUS_COLORS = ['#53d7ff', '#16c79a', '#ff8a5b', '#ffd166']

const FEATURE_PANELS = [
  {
    title: 'Projects, progress, and files',
    text: 'The platform manages project creation, progress tracking, project files, detail pages, exports, and developer assignments.',
    accent: 'Cyan',
  },
  {
    title: 'Managers and team assignment',
    text: 'Managers can create projects, assign developers and chefs de projet, review statistics, and organise staffing from one flow.',
    accent: 'Mint',
  },
  {
    title: 'Tasks and delivery execution',
    text: 'Tasks move from pending to validated with status updates, developer assignment, filtering by role, and execution follow-up.',
    accent: 'Coral',
  },
  {
    title: 'SLA, exports, and role access',
    text: 'SLA projects, project exports, personal profiles, and protected routes are already connected to the DRACO secure API.',
    accent: 'Gold',
  },
]

const WORKFLOW_STEPS = [
  {
    title: 'Manager creates the project',
    text: 'A manager opens the project, prepares assignment data, and links the right people to the right scope.',
  },
  {
    title: 'Chef de projet coordinates delivery',
    text: 'The chef de projet follows tasks, project rhythm, and validation flow while keeping delivery aligned.',
  },
  {
    title: 'Developers execute and update',
    text: 'Developers follow their own projects, tasks, timeline, and progress updates directly from the workspace.',
  },
]

const ROLE_SPOTLIGHTS = [
  {
    role: 'Manager',
    summary: 'Creates projects, assigns teams, reviews exports, and pilots project-level statistics.',
  },
  {
    role: 'Chef de projet',
    summary: 'Coordinates projects, supervises execution, and validates delivery progress.',
  },
  {
    role: 'Developer',
    summary: 'Follows assigned tasks, active projects, personal workload, and execution timeline.',
  },
]

const WORKSPACE_SYMBOL_BADGES = [
  { label: 'Projects', tone: 'cyan' },
  { label: 'Tasks', tone: 'mint' },
  { label: 'SLA', tone: 'gold' },
  { label: 'Files', tone: 'coral' },
  { label: 'Team', tone: 'cyan' },
  { label: 'Exports', tone: 'mint' },
]

const FALLBACK_BOARD_CARDS = [
  {
    id: 'brief',
    title: 'Create the project record',
    meta: 'Project details, progress, and scope',
    status: 'pending',
    date: 'Kickoff',
  },
  {
    id: 'assign',
    title: 'Assign chefs and developers',
    meta: 'Manager assignment flow',
    status: 'pending',
    date: 'Staffing',
  },
  {
    id: 'track',
    title: 'Track tasks and progress',
    meta: 'Status, execution, and follow-up',
    status: 'in_progress',
    date: 'Live',
  },
  {
    id: 'validate',
    title: 'Validate task completion',
    meta: 'Chef de projet review flow',
    status: 'in_progress',
    date: 'Review',
  },
  {
    id: 'sla',
    title: 'Review SLA project coverage',
    meta: 'SLA governance and compliance',
    status: 'validated',
    date: 'Secure',
  },
  {
    id: 'export',
    title: 'Export project information',
    meta: 'Report, archive, and handoff',
    status: 'done',
    date: 'Done',
  },
]

function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    notation: value >= 1000 ? 'compact' : 'standard',
  }).format(value)
}

function formatPercent(value) {
  return `${Math.round(value)}%`
}

function formatDate(value) {
  if (!value) {
    return 'Recent'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recent'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function buildSparkPath(values, width = 116, height = 38) {
  const max = Math.max(...values, 1)
  const step = values.length > 1 ? width / (values.length - 1) : width

  return values
    .map((value, index) => {
      const x = Math.round(index * step * 100) / 100
      const y = Math.round((height - (value / max) * height) * 100) / 100
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function buildLineChartPoints(values, max, width = 520, height = 240) {
  const step = values.length > 1 ? width / (values.length - 1) : width

  return values
    .map((value, index) => {
      const x = Math.round(index * step * 100) / 100
      const y = Math.round((height - (value / max) * height) * 100) / 100
      return `${x},${y}`
    })
    .join(' ')
}

function normalizeStatus(value) {
  return String(value ?? 'pending').trim().toLowerCase()
}

function getStatusLabel(status) {
  return status.replace('_', ' ')
}

function getBoardColumn(status) {
  if (status === 'done' || status === 'validated') {
    return 'done'
  }

  if (status === 'in_progress') {
    return 'doing'
  }

  return 'todo'
}

function mapSettledCollections(results) {
  return results.map((result) => (result.status === 'fulfilled' ? getCollection(result.value) : []))
}

function HomePage() {
  const {
    authenticated,
    error,
    initialized,
    keycloakReady,
    login,
    profile,
  } = useAuth()
  const { actorIds, canViewPeople, currentRole, isChef, isManager } = useRoleAccess()
  const navigate = useNavigate()

  const [focus, setFocus] = useState('portfolio')
  const [windowView, setWindowView] = useState('30d')
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    tasks: [],
    developers: [],
    chefs: [],
    managers: [],
  })
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true

    if (!authenticated) {
      setDashboardData({
        projects: [],
        tasks: [],
        developers: [],
        chefs: [],
        managers: [],
      })
      setLoading(false)
      setLoadError('')
      return () => {
        active = false
      }
    }

    async function loadDashboard() {
      try {
        setLoading(true)
        setLoadError('')

        const dashboardRequests = [
          getProjects({ actorIds, currentRole }),
          getTasks(),
          canViewPeople ? getDevelopers() : Promise.resolve([]),
          isChef || isManager ? getChefsDeProjet() : Promise.resolve([]),
          isManager ? getManagers() : Promise.resolve([]),
        ]

        const results = await Promise.allSettled(dashboardRequests)

        if (!active) {
          return
        }

        const [projects, tasks, developers, chefs, managers] = mapSettledCollections(results)

        setDashboardData({
          projects,
          tasks,
          developers,
          chefs,
          managers,
        })

        const failures = results.filter((result) => result.status === 'rejected')
        if (failures.length === results.length) {
          setLoadError(
            getApiErrorMessage(
              failures[0].reason,
              'Unable to load dashboard data.',
            ),
          )
        } else if (failures.length > 0) {
          setLoadError('Some dashboard panels are limited by your current API access.')
        }
      } catch (loadDashboardError) {
        if (active) {
          setLoadError(
            getApiErrorMessage(loadDashboardError, 'Unable to load dashboard data.'),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [authenticated, actorIds, canViewPeople, currentRole, isChef, isManager])

  const { projects, tasks, developers, chefs, managers } = dashboardData

  const statusCounts = useMemo(() => {
    const counts = {
      pending: 0,
      in_progress: 0,
      done: 0,
      validated: 0,
    }

    tasks.forEach((task) => {
      const status = normalizeStatus(task.status)

      if (status === 'completed') {
        counts.done += 1
        return
      }

      if (counts[status] !== undefined) {
        counts[status] += 1
      }
    })

    return counts
  }, [tasks])

  const projectCount = projects.length
  const taskCount = tasks.length
  const activeTaskCount = statusCounts.pending + statusCounts.in_progress
  const completedTaskCount = statusCounts.done + statusCounts.validated
  const completionRate = taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0
  const slaCoverageCount = projects.filter((project) => project.sla_project).length
  const slaCoverage = projectCount > 0 ? (slaCoverageCount / projectCount) * 100 : 0
  const deliveryPeople = developers.length + chefs.length + managers.length

  const metricCards = useMemo(() => {
    const baseSeries = {
      portfolio: [projectCount, Math.max(projectCount - 1, 0), activeTaskCount, completedTaskCount || 1],
      delivery: [activeTaskCount || 1, statusCounts.in_progress || 1, completedTaskCount || 1, taskCount || 1],
      team: [developers.length || 1, chefs.length || 1, managers.length || 1, deliveryPeople || 1],
    }

    return [
      {
        title: 'Projects Online',
        value: formatCompactNumber(projectCount),
        delta: `${formatCompactNumber(slaCoverageCount)} with SLA coverage`,
        series: baseSeries.portfolio,
      },
      {
        title: 'Active Tasks',
        value: formatCompactNumber(activeTaskCount),
        delta: `${formatCompactNumber(statusCounts.in_progress)} in progress now`,
        series: baseSeries.delivery,
      },
      {
        title: 'Delivery Rate',
        value: formatPercent(completionRate),
        delta: `${formatCompactNumber(completedTaskCount)} finished or validated`,
        series: [completionRate || 1, slaCoverage || 1, completedTaskCount || 1, activeTaskCount || 1],
      },
      {
        title: 'Team Capacity',
        value: formatCompactNumber(deliveryPeople),
        delta: `${formatCompactNumber(developers.length)} developers available`,
        series: baseSeries.team,
      },
    ]
  }, [
    activeTaskCount,
    chefs.length,
    completedTaskCount,
    completionRate,
    deliveryPeople,
    developers.length,
    managers.length,
    projectCount,
    slaCoverage,
    slaCoverageCount,
    statusCounts.in_progress,
    taskCount,
  ])

  const topProjects = useMemo(() => (
    [...projects]
      .map((project) => ({
        id: project.id,
        name: getText(project.name, 'Untitled project'),
        value:
          getCollection(project.tasks).length ||
          Number(project.tasks_count ?? 0) ||
          Number(project.total_tasks ?? 0),
        status: getText(project.status, 'planned'),
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5)
  ), [projects])

  const recentTasks = useMemo(() => (
    [...tasks]
      .sort((left, right) => {
        const leftDate = new Date(left.updated_at ?? left.created_at ?? 0).getTime()
        const rightDate = new Date(right.updated_at ?? right.created_at ?? 0).getTime()
        return rightDate - leftDate
      })
      .slice(0, 6)
      .map((task) => ({
        id: task.id,
        title: getText(task.title, `Task #${task.id ?? 'n/a'}`),
        project: getText(task.project?.name ?? task.project_id, 'No project'),
        status: normalizeStatus(task.status),
        date: formatDate(task.updated_at ?? task.created_at),
      }))
  ), [tasks])

  const chartSeries = useMemo(() => {
    const focusBoost = focus === 'delivery' ? 1.2 : focus === 'team' ? 0.9 : 1
    const windowBoost = windowView === 'live' ? 1.18 : windowView === 'quarter' ? 1.08 : 1
    const base = [
      projectCount || 1,
      activeTaskCount || 1,
      completedTaskCount || 1,
      statusCounts.pending || 1,
      statusCounts.in_progress || 1,
      statusCounts.validated || 1,
      slaCoverageCount || 1,
    ]

    const delivery = base.map((value, index) =>
      Math.max(1, Math.round((value + index + 1) * focusBoost)),
    )
    const collaboration = base.map((value, index) =>
      Math.max(1, Math.round((value * 0.8 + developers.length + index) * windowBoost)),
    )
    const governance = base.map((value, index) =>
      Math.max(1, Math.round((value * 0.6 + chefs.length + managers.length + index) * 0.92)),
    )

    return [delivery, collaboration, governance]
  }, [
    activeTaskCount,
    chefs.length,
    completedTaskCount,
    developers.length,
    focus,
    managers.length,
    projectCount,
    slaCoverageCount,
    statusCounts.in_progress,
    statusCounts.pending,
    statusCounts.validated,
    windowView,
  ])

  const chartMax = Math.max(...chartSeries.flat(), 1)
  const chartLines = chartSeries.map((series) => buildLineChartPoints(series, chartMax))

  const distribution = useMemo(() => {
    const total = Math.max(taskCount, 1)
    let cursor = 0

    return STATUS_ORDER.map((status, index) => {
      const value = statusCounts[status]
      const percentage = (value / total) * 100
      const segment = {
        status,
        value,
        percentage,
        color: STATUS_COLORS[index],
        start: cursor,
        end: cursor + percentage,
      }
      cursor += percentage
      return segment
    })
  }, [statusCounts, taskCount])

  const distributionBackground = `conic-gradient(${distribution
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(', ')})`

  const boardColumns = useMemo(() => {
    const liveCards = recentTasks.map((task, index) => ({
      id: task.id ?? `task-${index}`,
      title: task.title,
      meta: task.project,
      status: task.status,
      date: task.date,
    }))

    const sourceCards = liveCards.length > 0 ? liveCards : FALLBACK_BOARD_CARDS
    const groupedCards = {
      todo: [],
      doing: [],
      done: [],
    }

    sourceCards.forEach((card) => {
      const column = getBoardColumn(card.status)
      if (groupedCards[column].length < 3) {
        groupedCards[column].push(card)
      }
    })

    FALLBACK_BOARD_CARDS.forEach((card) => {
      const column = getBoardColumn(card.status)
      if (groupedCards[column].length < 2) {
        groupedCards[column].push(card)
      }
    })

    return [
      {
        id: 'todo',
        label: 'To plan',
        tone: 'cyan',
        cards: groupedCards.todo,
      },
      {
        id: 'doing',
        label: 'In motion',
        tone: 'mint',
        cards: groupedCards.doing,
      },
      {
        id: 'done',
        label: 'Delivered',
        tone: 'coral',
        cards: groupedCards.done,
      },
    ]
  }, [recentTasks])

  const spotlightStats = useMemo(() => ([
    {
      label: authenticated ? 'Live projects' : 'Main modules',
      value: authenticated ? formatCompactNumber(projectCount) : '08',
      detail: authenticated ? 'Loaded from backend data' : 'Projects, tasks, people, files, SLA, assignments',
    },
    {
      label: authenticated ? 'Team members' : 'Access roles',
      value: authenticated ? formatCompactNumber(deliveryPeople) : '03',
      detail: authenticated ? 'Managers, chefs, developers' : 'Manager, chef de projet, developer',
    },
    {
      label: authenticated ? 'Task completion' : 'Security and API',
      value: authenticated ? formatPercent(completionRate) : 'DRACO',
      detail: authenticated ? 'From your current task statuses' : 'Keycloak auth and DRACO endpoints',
    },
  ]), [authenticated, completionRate, deliveryPeople, projectCount])

  const focusSummary = {
    portfolio: 'Track total program scope, SLA coverage, and project density.',
    delivery: 'Spot execution pressure across pending, active, and validated work.',
    team: 'Read staffing balance between managers, chefs, and developers.',
  }[focus]

  const statusTone = error
    ? 'danger'
    : authenticated
      ? 'success'
      : keycloakReady
        ? 'warning'
        : 'neutral'

  const welcomeName = profile.name ?? profile.username ?? 'team'

  if (!authenticated) {
    return (
      <div className="hpl-root">
        <PageSection className="hero-panel immersive-landing">
          <div className="landing-ambient landing-ambient-one" aria-hidden="true" />
          <div className="landing-ambient landing-ambient-two" aria-hidden="true" />
          <div className="landing-ambient landing-ambient-three" aria-hidden="true" />

          <div className="landing-hero-grid">
            <div className="landing-copy-column">
              <p className="eyebrow">DRACO project command center</p>
              <h2 className="landing-mega-title">
                Une entree claire pour comprendre le site avant d entrer dans le workspace.
              </h2>
              <p className="landing-mega-lead">
                Cette plateforme permet de gerer les projets, suivre les taches, organiser developers et chefs de projet, piloter les managers, gerer les fichiers projet, suivre les SLA et acceder aux vues protegees selon le role.
              </p>

              <div className="landing-actions">
                <Button
                  onClick={() => navigate('/login')}
                  disabled={!keycloakReady || !initialized}
                >
                  Entrer dans le workspace
                </Button>
                <a href="#workspace-zone" className="ghost-button landing-link-button">
                  Voir la zone de travail
                </a>
              </div>

              <div className="landing-route-row">
                <span className="landing-route-chip">Projects</span>
                <span className="landing-route-chip">Tasks</span>
                <span className="landing-route-chip">Developers</span>
                <span className="landing-route-chip">Chefs de projet</span>
                <span className="landing-route-chip">Managers</span>
                <span className="landing-route-chip">SLA Projects</span>
                <span className="landing-route-chip">Project Files</span>
                <span className="landing-route-chip">Assignments</span>
                <span className="landing-route-chip">Exports</span>
              </div>
            </div>

            <div className="landing-command-wall landing-visual-stage">
              <div className="landing-visual-orbit">
                <div className="landing-orbit-ring landing-orbit-ring-one" />
                <div className="landing-orbit-ring landing-orbit-ring-two" />
                <div className="landing-orbit-core">
                  <span>DRACO</span>
                  <strong>Flow</strong>
                  <small>Projects, people, delivery</small>
                </div>
              </div>

              <article className="landing-floating-panel landing-floating-panel-main">
                <div className="landing-floating-panel-head">
                  <span className="landing-floating-badge">Live preview</span>
                  <strong>Real product scope</strong>
                </div>
                <p>Projects, tasks, assignments, files, statistics, timelines, exports, and protected access already exist in the real application flow.</p>
                <div className="landing-mini-bars">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </article>

              <article className="landing-floating-panel landing-floating-panel-side">
                <div className="landing-floating-panel-head">
                  <strong>Roles</strong>
                </div>
                <div className="landing-mini-pill-row">
                  {ROLE_SPOTLIGHTS.map((item) => (
                    <span key={item.role} className="landing-mini-pill">
                      {item.role}
                    </span>
                  ))}
                </div>
              </article>

              <div className="landing-spotlight-rail landing-spotlight-rail-hero">
                {spotlightStats.map((item) => (
                  <div key={item.label} className="landing-spotlight-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <small>{item.detail}</small>
                  </div>
                ))}
              </div>

              <div className="landing-process-panel landing-process-panel-hero">
                <div className="landing-process-header">
                  <div>
                    <p className="panel-kicker">Operational flow</p>
                    <h3>Du cadrage jusqu a la livraison</h3>
                  </div>
                </div>
                <div className="landing-process-lane">
                  {WORKFLOW_STEPS.map((step, index) => (
                    <article key={step.title} className="landing-process-step">
                      <span className="landing-process-index">0{index + 1}</span>
                      <strong>{step.title}</strong>
                      <p>{step.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageSection>

        <section className="landing-marquee-band" aria-label="Platform highlights">
          <div className="landing-marquee-track">
            {Array.from({ length: 2 }).map((_, loopIndex) => (
              FEATURE_PANELS.map((panel) => (
                <span key={`${panel.title}-${loopIndex}`} className="landing-marquee-chip">
                  {panel.title}
                </span>
              ))
            ))}
          </div>
        </section>

        <section id="capabilities" className="landing-panorama-grid">
          <InfoCard className="panorama-card panorama-card-featured">
            <span className="panorama-kicker">Platform overview</span>
            <h2 className="landing-story-title">
              Une introduction qui montre vraiment ce que le site permet de faire.
            </h2>
            <p className="landing-mega-lead">
              L utilisateur doit comprendre des le debut qu il peut ouvrir un projet, assigner une equipe, suivre la progression, consulter des details, gerer des fichiers, verifier le SLA et travailler selon son role.
            </p>
            <div className="panorama-role-list">
              {ROLE_SPOTLIGHTS.map((item) => (
                <span key={item.role} className="panorama-role-pill">
                  {item.role}
                </span>
              ))}
            </div>
          </InfoCard>

          {FEATURE_PANELS.map((panel) => (
            <InfoCard key={panel.title} className="panorama-card">
              <span className="feature-accent-label">{panel.accent}</span>
              <h3>{panel.title}</h3>
              <p>{panel.text}</p>
            </InfoCard>
          ))}
        </section>

        <section id="workflow" className="landing-storyboard">
          <InfoCard className="landing-story-copy">
            <p className="panel-kicker">Role architecture</p>
            <h2 className="landing-story-title">Chaque acteur comprend sa place des la premiere page.</h2>
            <p className="landing-mega-lead">
              Le site est structure autour de trois roles reels. Le manager lance et organise, le chef de projet coordonne et valide, et le developpeur suit ses projets et ses taches.
            </p>

            <div className="landing-role-columns">
              {ROLE_SPOTLIGHTS.map((item) => (
                <article key={item.role} className="landing-role-card">
                  <strong>{item.role}</strong>
                  <p>{item.summary}</p>
                </article>
              ))}
            </div>
          </InfoCard>

          <InfoCard className="landing-process-panel">
            <div className="landing-process-header">
              <div>
                <p className="panel-kicker">Experience promise</p>
                <h3>Espace large, lisible, et axe pilotage</h3>
              </div>
            </div>

            <div className="landing-process-lane">
              <article className="landing-process-step">
                <span className="landing-process-index">A</span>
                <strong>Presenter les modules reels</strong>
                <p>Projects, tasks, developers, chefs de projet, managers, SLA projects, files, assignments, exports.</p>
              </article>
              <article className="landing-process-step">
                <span className="landing-process-index">B</span>
                <strong>Montrer le parcours utilisateur</strong>
                <p>Creation, assignation, suivi, validation, export: le parcours complet est deja lisible depuis la premiere page.</p>
              </article>
              <article className="landing-process-step">
                <span className="landing-process-index">C</span>
                <strong>Faire entrer dans l espace protege</strong>
                <p>La landing introduit le produit puis mene naturellement vers la connexion Keycloak et les vues protegees.</p>
              </article>
            </div>
          </InfoCard>
        </section>

        <section className="landing-board-stage">
          <div className="landing-wide-board">
            <div className="landing-wide-board-head">
              <div>
                <p className="panel-kicker">Board preview</p>
                <h2>Le site s organise autour des projets, des taches et des validations.</h2>
              </div>
              <span className="board-preview-pill">DRACO workflow</span>
            </div>

            <div className="landing-wide-board-grid">
              {boardColumns.map((column) => (
                <div key={column.id} className={`board-column board-column-${column.tone}`}>
                  <div className="board-column-head">
                    <strong>{column.label}</strong>
                    <span>{column.cards.length}</span>
                  </div>

                  <div className="board-card-stack">
                    {column.cards.map((card) => (
                      <article key={card.id} className="board-task-card">
                        <div className="board-task-accent" />
                        <strong>{card.title}</strong>
                        <p>{card.meta}</p>
                        <div className="board-task-meta">
                          <span className="board-task-status">{getStatusLabel(card.status)}</span>
                          <small>{card.date}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


      </div>
    )
  }

  return (
    <>
      <PageSection className="hero-panel workspace-hero dashboard-command-hero">
        <div className="dashboard-command-grid">
          <div className="dashboard-command-copy">
            <p className="eyebrow">Workspace online</p>
            <h2 className="dashboard-title">Pilotage large pour {welcomeName}.</h2>
            <p className="lead">
              Retrouve les projets, les taches, les equipes et le suivi SLA dans un espace plus large, puis entre directement dans les modules de travail.
            </p>

            <div className="workspace-action-strip">
              <Link to="/projects" className="primary-button landing-link-button">
                Ouvrir les projets
              </Link>
              <Link to="/tasks" className="ghost-button landing-link-button">
                Voir les taches
              </Link>
              <Link
                to={canViewPeople ? '/developers' : '/profile'}
                className="ghost-button landing-link-button"
              >
                {canViewPeople ? 'Equipe' : 'Profil'}
              </Link>
            </div>
          </div>

          <div className="workspace-stat-wall">
            <div className="workspace-crest-stage" aria-hidden="true">
              <div className="workspace-crest-shell">
                <div className="workspace-crest-ring workspace-crest-ring-one" />
                <div className="workspace-crest-ring workspace-crest-ring-two" />
                <div className="workspace-crest-ring workspace-crest-ring-three" />

                <div className="workspace-crest-ray workspace-crest-ray-one" />
                <div className="workspace-crest-ray workspace-crest-ray-two" />
                <div className="workspace-crest-ray workspace-crest-ray-three" />

                <div className="workspace-crest-core">
                  <span>Atlas</span>
                  <strong>DRACO Core</strong>
                  <small>Delivery, staffing, SLA</small>
                </div>

                {WORKSPACE_SYMBOL_BADGES.map((item, index) => (
                  <div
                    key={item.label}
                    className={`workspace-orbit-badge workspace-orbit-badge-${index + 1}`}
                  >
                    <i className={`workspace-orbit-dot workspace-orbit-dot-${item.tone}`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="workspace-stat-belt">
              {spotlightStats.map((item) => (
                <div key={item.label} className="landing-stat-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.detail}</small>
                </div>
              ))}
            </div>
            <p className="workspace-micro-note">{focusSummary}</p>
          </div>
        </div>

        <div className="dashboard-filter-row">
          <div className="dashboard-filter-group">
            <span className="dashboard-filter-label">Focus</span>
            <div className="dashboard-filter-options">
              {FOCUS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`dashboard-chip${focus === option.id ? ' active' : ''}`}
                  onClick={() => setFocus(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-filter-group">
            <span className="dashboard-filter-label">Timeframe</span>
            <div className="dashboard-filter-options">
              {WINDOW_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`dashboard-chip${windowView === option.id ? ' active' : ''}`}
                  onClick={() => setWindowView(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <StatusCard tone={statusTone} title="Session status">
          <strong>
            {!keycloakReady && 'Missing Keycloak configuration'}
            {keycloakReady && !initialized && 'Initializing Keycloak...'}
            {keycloakReady && initialized && authenticated && 'Workspace online'}
          </strong>
          {error ? <p>{error}</p> : <p>{focusSummary}</p>}
        </StatusCard>
      </PageSection>

      <section className="metrics-grid">
        {metricCards.map((card) => (
          <InfoCard key={card.title} className="metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">{card.title}</span>
              <span className="metric-card-badge">Live</span>
            </div>
            <p className="metric-card-value">{card.value}</p>
            <p className="metric-card-delta">{card.delta}</p>
            <svg className="metric-card-spark" viewBox="0 0 116 38" aria-hidden="true">
              <path
                d={buildSparkPath(card.series)}
                className="metric-card-spark-line"
                pathLength="100"
              />
            </svg>
          </InfoCard>
        ))}
      </section>

      {loadError ? (
        <div className="route-feedback">
          <p className="feedback-message feedback-error">{loadError}</p>
        </div>
      ) : null}

      <section className="dashboard-grid">
        <InfoCard className="dashboard-card chart-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Delivery overview</p>
              <h2>Portfolio pulse</h2>
            </div>
            <span className="panel-badge">{WINDOW_OPTIONS.find((option) => option.id === windowView)?.label}</span>
          </div>

          <div className="chart-legend">
            <span><i className="legend-dot legend-cyan" /> Delivery</span>
            <span><i className="legend-dot legend-violet" /> Collaboration</span>
            <span><i className="legend-dot legend-pink" /> Governance</span>
          </div>

          <div className="chart-shell">
            <div className="chart-axis">
              <span>0</span>
              <span>{Math.max(1, Math.round(chartMax * 0.33))}</span>
              <span>{Math.max(1, Math.round(chartMax * 0.66))}</span>
              <span>{chartMax}</span>
            </div>

            <svg className="chart-surface" viewBox="0 0 520 240" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="dashboardGlowA" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(83, 215, 255, 0.55)" />
                  <stop offset="100%" stopColor="rgba(83, 215, 255, 0)" />
                </linearGradient>
                <linearGradient id="dashboardGlowB" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(22, 199, 154, 0.4)" />
                  <stop offset="100%" stopColor="rgba(22, 199, 154, 0)" />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3].map((row) => (
                <line
                  key={row}
                  className="chart-grid-line"
                  x1="0"
                  x2="520"
                  y1={row * 80}
                  y2={row * 80}
                />
              ))}

              {[0, 1, 2, 3, 4, 5, 6].map((column) => (
                <line
                  key={column}
                  className="chart-grid-line chart-grid-line-vertical"
                  x1={(520 / 6) * column}
                  x2={(520 / 6) * column}
                  y1="0"
                  y2="240"
                />
              ))}

              <polyline
                points={chartLines[0]}
                className="chart-line chart-line-cyan"
                fill="none"
              />
              <polyline
                points={chartLines[1]}
                className="chart-line chart-line-violet"
                fill="none"
              />
              <polyline
                points={chartLines[2]}
                className="chart-line chart-line-pink"
                fill="none"
              />
            </svg>
          </div>
        </InfoCard>

        <InfoCard className="dashboard-card distribution-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Task distribution</p>
              <h2>Status mix</h2>
            </div>
          </div>

          <div className="distribution-ring" style={{ background: distributionBackground }}>
            <div className="distribution-ring-inner">
              <strong>{taskCount}</strong>
              <span>Total tasks</span>
            </div>
          </div>

          <div className="distribution-list">
            {distribution.map((segment) => (
              <div key={segment.status} className="distribution-item">
                <div className="distribution-item-copy">
                  <i className="legend-dot" style={{ background: segment.color }} />
                  <span>{getText(getStatusLabel(segment.status))}</span>
                </div>
                <strong>{formatPercent(segment.percentage)}</strong>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard className="dashboard-card performance-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Top workload</p>
              <h2>Project intensity</h2>
            </div>
          </div>

          <div className="performance-list">
            {topProjects.length > 0 ? topProjects.map((project, index) => {
              const maxValue = Math.max(...topProjects.map((item) => item.value), 1)
              const width = `${(project.value / maxValue) * 100}%`

              return (
                <div key={project.id ?? `${project.name}-${index}`} className="performance-row">
                  <div className="performance-head">
                    <span>{project.name}</span>
                    <strong>{project.value}</strong>
                  </div>
                  <div className="progress-track">
                    <span className="progress-fill" style={{ width }} />
                  </div>
                  <p className="performance-meta">{project.status}</p>
                </div>
              )
            }) : (
              <p className="empty-state">Projects will appear here once the API returns portfolio data.</p>
            )}
          </div>
        </InfoCard>

        <InfoCard className="dashboard-card network-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Delivery network</p>
              <h2>Team structure</h2>
            </div>
          </div>

          <div className="network-stage">
            <div className="network-node network-node-main">
              <span>Projects</span>
              <strong>{projectCount}</strong>
            </div>
            <div className="network-node network-node-one">
              <span>Managers</span>
              <strong>{managers.length}</strong>
            </div>
            <div className="network-node network-node-two">
              <span>Chefs</span>
              <strong>{chefs.length}</strong>
            </div>
            <div className="network-node network-node-three">
              <span>Developers</span>
              <strong>{developers.length}</strong>
            </div>
            <div className="network-node network-node-four">
              <span>SLA</span>
              <strong>{slaCoverageCount}</strong>
            </div>
          </div>
        </InfoCard>

        <InfoCard className="dashboard-card bars-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Workflow pressure</p>
              <h2>Status bars</h2>
            </div>
          </div>

          <div className="bar-chart">
            {STATUS_ORDER.map((status, index) => {
              const value = statusCounts[status]
              const max = Math.max(...Object.values(statusCounts), 1)
              const height = `${Math.max((value / max) * 100, value > 0 ? 18 : 8)}%`

              return (
                <div key={status} className="bar-column">
                  <div className="bar-shell">
                    <span
                      className="bar-fill"
                      style={{ height, background: `linear-gradient(180deg, ${STATUS_COLORS[index]}, rgba(10, 21, 32, 0.28))` }}
                    />
                  </div>
                  <strong>{value}</strong>
                  <span>{getStatusLabel(status)}</span>
                </div>
              )
            })}
          </div>
        </InfoCard>

        <InfoCard className="dashboard-card activity-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Recent updates</p>
              <h2>Latest tasks</h2>
            </div>
          </div>

          <div className="activity-list">
            {recentTasks.length > 0 ? recentTasks.map((task) => (
              <div key={task.id} className="activity-row">
                <div className="activity-avatar">{String(task.title).slice(0, 1).toUpperCase()}</div>
                <div className="activity-copy">
                  <strong>{task.title}</strong>
                  <span>{task.project}</span>
                </div>
                <div className="activity-meta">
                  <span className={`status-pill status-pill-${task.status}`}>{getStatusLabel(task.status)}</span>
                  <small>{task.date}</small>
                </div>
              </div>
            )) : (
              <p className="empty-state">No task activity available yet.</p>
            )}
          </div>
        </InfoCard>
      </section>

      {loading ? (
        <section className="info-grid">
          <InfoCard wide>
            <p className="feedback-message">Loading live dashboard data...</p>
          </InfoCard>
        </section>
      ) : null}
    </>
  )
}

export default HomePage
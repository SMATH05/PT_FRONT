import { useEffect, useMemo, useState } from 'react'
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
const STATUS_COLORS = ['#6ad7ff', '#7d6bff', '#b85dff', '#56f0c5']

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
    logout,
    profile,
  } = useAuth()
  const { actorIds, canViewPeople, currentRole, isChef, isManager } = useRoleAccess()

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
      .slice(0, 5)
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

    const segments = STATUS_ORDER.map((status, index) => {
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

    return segments
  }, [statusCounts, taskCount])

  const distributionBackground = `conic-gradient(${distribution
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(', ')})`

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

  return (
    <>
      <PageSection className="hero-panel dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="eyebrow">Dashboard</p>
          <h2 className="dashboard-title">
            {authenticated
              ? `Welcome back, ${profile.name}.`
              : 'A cinematic project dashboard powered by your existing backend.'}
          </h2>
          <p className="lead">
            This redesign keeps your routing, backend calls, task assignment flow, and Keycloak auth intact while shifting the interface toward a polished analytics command center.
          </p>
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
            {keycloakReady && initialized && authenticated && 'Analytics online'}
            {keycloakReady && initialized && !authenticated && 'Sign in to load live backend data'}
          </strong>
          {error ? <p>{error}</p> : null}
          {!error ? <p>{focusSummary}</p> : null}
        </StatusCard>

        <div className="actions">
          <Button
            onClick={login}
            disabled={!keycloakReady || !initialized || authenticated}
          >
            Sign in with Keycloak
          </Button>
          <Button
            variant="ghost"
            onClick={logout}
            disabled={!authenticated}
          >
            Sign out
          </Button>
        </div>
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
                  <stop offset="0%" stopColor="rgba(106, 215, 255, 0.55)" />
                  <stop offset="100%" stopColor="rgba(106, 215, 255, 0)" />
                </linearGradient>
                <linearGradient id="dashboardGlowB" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(141, 114, 255, 0.45)" />
                  <stop offset="100%" stopColor="rgba(141, 114, 255, 0)" />
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
                  <span>{getText(segment.status.replace('_', ' '))}</span>
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
                      style={{ height, background: `linear-gradient(180deg, ${STATUS_COLORS[index]}, rgba(125, 107, 255, 0.28))` }}
                    />
                  </div>
                  <strong>{value}</strong>
                  <span>{status.replace('_', ' ')}</span>
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
                  <span className={`status-pill status-pill-${task.status}`}>{task.status.replace('_', ' ')}</span>
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

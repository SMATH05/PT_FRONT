import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import {
  getProject,
  getProjectProgress,
  getProjectSla,
} from '../../services/projectService.js'
import {
  getApiErrorMessage,
  getCollection,
  getEntity,
  getText,
} from '../../utils/apiResponse.js'

function formatProgress(progress) {
  const value =
    progress?.progress_percentage ??
    progress?.progress ??
    progress?.percentage ??
    progress

  if (value === null || value === undefined || value === '') {
    return 'Unavailable'
  }

  return `${value}%`
}

function ProjectDetailsPage() {
  const { id, managerId, projectId } = useParams()
  const resolvedProjectId = id ?? projectId
  const [project, setProject] = useState(null)
  const [progress, setProgress] = useState(null)
  const [sla, setSla] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProject() {
      try {
        setLoading(true)
        const [projectPayload, progressPayload, slaPayload] = await Promise.all([
          getProject(resolvedProjectId),
          getProjectProgress(resolvedProjectId).catch(() => null),
          getProjectSla(resolvedProjectId).catch(() => null),
        ])

        if (!active) {
          return
        }

        setProject(getEntity(projectPayload))
        setProgress(getEntity(progressPayload))
        setSla(getEntity(slaPayload))
        setError('')
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load project.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProject()

    return () => {
      active = false
    }
  }, [resolvedProjectId])

  const resolvedManagerId = managerId ?? project?.manager_id
  const tasks = getCollection(project?.tasks)
  const developers = getCollection(project?.developers)

  async function handleCopyWorkspacePath() {
    if (!project?.absolute_folder_path || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(project.absolute_folder_path)
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Project details</p>
        <h1>{project?.name ? project.name : `Project #${resolvedProjectId}`}</h1>
        <p className="lead">
          Review project data, team members, progress, files, and SLA from the API.
        </p>
      </PageSection>

      <section className="info-grid">
        {loading ? <p className="feedback-message">Loading project...</p> : null}
        {error ? <p className="feedback-message feedback-error">{error}</p> : null}

        {!loading && !error && project ? (
          <>
            <InfoCard>
              <h2>General information</h2>
              <div className="session-list">
                <div>
                  <p className="session-label">Name</p>
                  <p className="session-value">{getText(project.name)}</p>
                </div>
                <div>
                  <p className="session-label">Client</p>
                  <p className="session-value">{getText(project.client)}</p>
                </div>
                <div>
                  <p className="session-label">Description</p>
                  <p className="session-value">
                    {getText(project.description, 'No description')}
                  </p>
                </div>
                <div>
                  <p className="session-label">Status</p>
                  <p className="session-value">{getText(project.status)}</p>
                </div>
                <div>
                  <p className="session-label">Start date</p>
                  <p className="session-value">{getText(project.start_date, 'Not set')}</p>
                </div>
                <div>
                  <p className="session-label">Deadline</p>
                  <p className="session-value">{getText(project.deadline, 'Not set')}</p>
                </div>
                <div>
                  <p className="session-label">Progress</p>
                  <p className="session-value">{formatProgress(progress)}</p>
                </div>
              </div>
            </InfoCard>

            <InfoCard>
              <h2>Relations</h2>
              <div className="session-list">
                <div>
                  <p className="session-label">Manager</p>
                  <p className="session-value">
                    {getText(project.manager?.name ?? project.manager_id)}
                  </p>
                </div>
                <div>
                  <p className="session-label">Chef de projet</p>
                  <p className="session-value">
                    {getText(
                      project.chef_de_projet?.name ?? project.chef_de_projet_id,
                      'Not assigned',
                    )}
                  </p>
                </div>
                <div>
                  <p className="session-label">Developers</p>
                  <p className="session-value">{developers.length}</p>
                </div>
                <div>
                  <p className="session-label">Tasks</p>
                  <p className="session-value">{tasks.length}</p>
                </div>
                <div>
                  <p className="session-label">Folder path</p>
                  <p className="session-value">
                    {getText(project.folder_path, 'No folder path')}
                  </p>
                </div>
                <div>
                  <p className="session-label">Workspace path</p>
                  <p className="session-value">
                    {getText(project.absolute_folder_path, 'Not available')}
                  </p>
                </div>
              </div>
            </InfoCard>

            <InfoCard>
              <h2>Developers</h2>
              {developers.length > 0 ? (
                <div className="session-list">
                  {developers.map((developer) => (
                    <div key={developer.id}>
                      <p className="session-label">{getText(developer.name)}</p>
                      <p className="session-value">
                        {getText(developer.pivot?.position, 'Developer')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No developers assigned yet.</p>
              )}
            </InfoCard>

            <InfoCard>
              <h2>Tasks</h2>
              {tasks.length > 0 ? (
                <div className="session-list">
                  {tasks.map((task) => (
                    <div key={task.id}>
                      <p className="session-label">{getText(task.title, `Task #${task.id}`)}</p>
                      <p className="session-value">{getText(task.status)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No tasks created yet.</p>
              )}
            </InfoCard>

            <InfoCard wide>
              <div className="page-toolbar">
                <div>
                  <h2>SLA and actions</h2>
                  <p>
                    {sla
                      ? `${getText(sla.priority)} priority, response ${getText(
                          sla.max_response_time,
                        )}h, resolution ${getText(sla.max_resolution_time)}d`
                      : 'No SLA configured yet.'}
                  </p>
                </div>
                <div className="toolbar-actions">
                  <Link
                    to={`/projects/${resolvedProjectId}/edit`}
                    className="primary-button action-link"
                  >
                    Edit project
                  </Link>
                  {resolvedManagerId ? (
                    <Link
                      to={`/managers/${resolvedManagerId}/projects/${resolvedProjectId}/assign`}
                      className="ghost-button action-link"
                    >
                      Assign team
                    </Link>
                  ) : null}
                  <Link
                    to={`/projects/${resolvedProjectId}/files`}
                    className="ghost-button action-link"
                  >
                    Manage files
                  </Link>
                  {project.vscode_url ? (
                    <a
                      href={project.vscode_url}
                      className="ghost-button action-link"
                    >
                      Open in VS Code
                    </a>
                  ) : null}
                  {project.absolute_folder_path ? (
                    <button
                      type="button"
                      className="ghost-button action-link"
                      onClick={handleCopyWorkspacePath}
                    >
                      Copy workspace path
                    </button>
                  ) : null}
                  <Link
                    to={`/sla-projects/${resolvedProjectId}`}
                    className="ghost-button action-link"
                  >
                    SLA
                  </Link>
                </div>
              </div>
            </InfoCard>
          </>
        ) : null}
      </section>
    </>
  )
}

export default ProjectDetailsPage

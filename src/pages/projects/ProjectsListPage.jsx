import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getProjects } from '../../services/projectService.js'
import { useRoleAccess } from '../../auth/useRoleAccess.js'
import {
  getApiErrorMessage,
  getCollection,
  getText,
} from '../../utils/apiResponse.js'

function ProjectsListPage() {
  const { actorIds, canManageProjects, currentRole } = useRoleAccess()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const emptyStateMessage = currentRole === 'developer'
    ? 'No projects are assigned to this developer yet.'
    : currentRole === 'chef_de_projet'
      ? 'No supervised projects were returned for this chef de projet yet.'
      : 'No projects were returned by the API.'

  useEffect(() => {
    let active = true

    async function loadProjects() {
      try {
        setLoading(true)
        const payload = await getProjects({ actorIds, currentRole })

        if (!active) {
          return
        }

        setProjects(getCollection(payload))
        setError('')
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load projects.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      active = false
    }
  }, [actorIds, currentRole])

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Projects</p>
        <h1>Manage all projects from one place.</h1>
        <p className="lead">
          View project status, team ownership, file access, and assignment links from the API.
        </p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <div className="page-toolbar">
            <div>
              <h2>Projects list</h2>
              <p>Navigate into each project and keep the manager flow intact.</p>
            </div>
            {canManageProjects ? (
              <Link to="/projects/create" className="primary-button action-link">
                Create project
              </Link>
            ) : null}
          </div>

          {loading ? <p className="feedback-message">Loading projects...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}
          {!loading && !error && projects.length === 0 ? (
            <p className="empty-state">{emptyStateMessage}</p>
          ) : null}

          {!loading && !error && projects.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Client</th>
                    <th>Manager</th>
                    <th>Chef de projet</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Workspace</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{getText(project.name)}</td>
                      <td>{getText(project.client)}</td>
                      <td>{getText(project.manager?.name ?? project.manager_id)}</td>
                      <td>
                        {getText(
                          project.chef_de_projet?.name ?? project.chef_de_projet_id,
                          'Not assigned',
                        )}
                      </td>
                      <td>{getText(project.status)}</td>
                      <td>{getText(project.deadline, 'Not set')}</td>
                      <td>{getText(project.workspace_exists ? 'Ready' : 'Missing')}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/projects/${project.id}`} className="table-link">
                            View
                          </Link>
                          {canManageProjects ? (
                            <Link
                              to={`/projects/${project.id}/edit`}
                              className="table-link"
                            >
                              Edit
                            </Link>
                          ) : null}
                          {canManageProjects && project.manager_id ? (
                            <Link
                              to={`/managers/${project.manager_id}/projects/${project.id}/assign`}
                              className="table-link"
                            >
                              Assign
                            </Link>
                          ) : null}
                          {canManageProjects ? (
                            <Link
                              to={`/projects/${project.id}/files`}
                              className="table-link"
                            >
                              Files
                            </Link>
                          ) : null}
                          {project.vscode_url ? (
                            <a
                              href={project.vscode_url}
                              className="table-link"
                            >
                              Open
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default ProjectsListPage

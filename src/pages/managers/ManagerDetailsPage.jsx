import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getManager, getManagerProjects } from '../../services/managerService.js'
import {
  getApiErrorMessage,
  getCollection,
  getEntity,
  getText,
} from '../../utils/apiResponse.js'

function ManagerDetailsPage() {
  const { id } = useParams()
  const [manager, setManager] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [managerPayload, projectsPayload] = await Promise.all([
          getManager(id),
          getManagerProjects(id),
        ])

        if (!active) {
          return
        }

        setManager(getEntity(managerPayload))
        setProjects(getCollection(projectsPayload))
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load manager.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [id])

  const developers = getCollection(manager?.developers)
  const chefs = getCollection(manager?.chef_de_projets ?? manager?.chefDeProjets)

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Managers</p>
        <h1>{manager?.name ? manager.name : `Manager #${id}`}</h1>
        <p className="lead">View manager profile, projects, chefs de projet, and developers.</p>
      </PageSection>

      <section className="info-grid">
        {loading ? <p className="feedback-message">Loading manager...</p> : null}
        {error ? <p className="feedback-message feedback-error">{error}</p> : null}

        {!loading && manager ? (
          <>
            <InfoCard>
              <h2>Manager profile</h2>
              <div className="session-list">
                <div>
                  <p className="session-label">Name</p>
                  <p className="session-value">{getText(manager.name)}</p>
                </div>
                <div>
                  <p className="session-label">Email</p>
                  <p className="session-value">{getText(manager.email)}</p>
                </div>
                <div>
                  <p className="session-label">Projects</p>
                  <p className="session-value">{projects.length}</p>
                </div>
                <div>
                  <p className="session-label">Developers</p>
                  <p className="session-value">{developers.length}</p>
                </div>
                <div>
                  <p className="session-label">Chefs de projet</p>
                  <p className="session-value">{chefs.length}</p>
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
                      <p className="session-value">{getText(developer.email)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No developers assigned yet.</p>
              )}
            </InfoCard>

            <InfoCard>
              <h2>Chefs de projet</h2>
              {chefs.length > 0 ? (
                <div className="session-list">
                  {chefs.map((chef) => (
                    <div key={chef.id}>
                      <p className="session-label">{getText(chef.name)}</p>
                      <p className="session-value">{getText(chef.email)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No chefs de projet assigned yet.</p>
              )}
            </InfoCard>

            <InfoCard wide>
              <div className="page-toolbar">
                <div>
                  <h2>Projects</h2>
                  <p>Manage projects assigned to this manager.</p>
                </div>
                <Link to={`/managers/${id}/projects/create`} className="primary-button action-link">
                  Create project
                </Link>
              </div>

              {projects.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Project name</th>
                        <th>Chef de projet</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td>{getText(project.name)}</td>
                          <td>
                            {getText(
                              project.chef_de_projet?.name ?? project.chef_de_projet_id,
                              'Not assigned',
                            )}
                          </td>
                          <td>{getText(project.status)}</td>
                          <td>{getText(project.deadline, 'N/A')}</td>
                          <td>
                            <div className="table-actions">
                              <Link to={`/managers/${id}/projects/${project.id}`} className="table-link">
                                View
                              </Link>
                              <Link
                                to={`/managers/${id}/projects/${project.id}/assign`}
                                className="table-link"
                              >
                                Assign
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="feedback-message">No projects yet. Create one to get started.</p>
              )}
            </InfoCard>

            <InfoCard wide>
              <Link to={`/managers/${id}/edit`} className="primary-button action-link">
                Edit manager
              </Link>
            </InfoCard>
          </>
        ) : null}
      </section>
    </>
  )
}

export default ManagerDetailsPage

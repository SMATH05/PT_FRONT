import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getProjects } from '../../services/projectService.js'
import {
  getApiErrorMessage,
  getCollection,
  getText,
} from '../../utils/apiResponse.js'

function SlaProjectsListPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProjects() {
      try {
        const payload = await getProjects()

        if (!active) {
          return
        }

        setProjects(getCollection(payload))
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load projects for SLA.'))
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
  }, [])

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">SLA</p>
        <h1>Project-scoped SLA records.</h1>
        <p className="lead">
          Each record is attached to a project, so this page starts from projects and opens their SLA detail view.
        </p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <div className="page-toolbar">
            <div>
              <h2>Project SLA list</h2>
              <p>Open an SLA record or create one for a project that does not have it yet.</p>
            </div>
            <Link to="/sla-projects/create" className="primary-button action-link">
              Create SLA
            </Link>
          </div>

          {loading ? <p className="feedback-message">Loading projects...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading && !error ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Manager</th>
                    <th>Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{getText(project.name)}</td>
                      <td>{getText(project.manager?.name ?? project.manager_id)}</td>
                      <td>{getText(project.sla_project?.priority, 'No SLA')}</td>
                      <td>
                        <Link
                          to={`/sla-projects/${project.id}`}
                          className="table-link"
                        >
                          Open SLA
                        </Link>
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

export default SlaProjectsListPage

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getDeveloper } from '../../services/developerService.js'
import { useRoleAccess } from '../../auth/useRoleAccess.js'
import {
  getApiErrorMessage,
  getCollection,
  getEntity,
  getText,
} from '../../utils/apiResponse.js'

function DeveloperDetailsPage() {
  const { canManagePeople } = useRoleAccess()
  const { id } = useParams()
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDeveloper() {
      try {
        const payload = await getDeveloper(id)

        if (!active) {
          return
        }

        setDeveloper(getEntity(payload))
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load developer.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDeveloper()

    return () => {
      active = false
    }
  }, [id])

  const projects = getCollection(developer?.projects)
  const tasks = getCollection(developer?.tasks)

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Developers</p>
        <h1>{developer?.name ? developer.name : `Developer #${id}`}</h1>
        <p className="lead">View manager, projects, and task assignments for this developer.</p>
      </PageSection>

      <section className="info-grid">
        {loading ? <p className="feedback-message">Loading developer...</p> : null}
        {error ? <p className="feedback-message feedback-error">{error}</p> : null}

        {!loading && developer ? (
          <>
            <InfoCard>
              <h2>Developer profile</h2>
              <div className="session-list">
                <div>
                  <p className="session-label">Name</p>
                  <p className="session-value">{getText(developer.name)}</p>
                </div>
                <div>
                  <p className="session-label">Email</p>
                  <p className="session-value">{getText(developer.email)}</p>
                </div>
                <div>
                  <p className="session-label">Manager</p>
                  <p className="session-value">
                    {getText(developer.manager?.name, 'No manager assigned')}
                  </p>
                </div>
              </div>
            </InfoCard>

            <InfoCard>
              <h2>Projects</h2>
              {projects.length > 0 ? (
                <div className="session-list">
                  {projects.map((project) => (
                    <div key={project.id}>
                      <p className="session-label">{getText(project.name)}</p>
                      <p className="session-value">
                        {getText(project.position, 'Developer')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No project assignments yet.</p>
              )}
            </InfoCard>

            <InfoCard>
              <h2>Tasks</h2>
              {tasks.length > 0 ? (
                <div className="session-list">
                  {tasks.map((task) => (
                    <div key={task.id}>
                      <p className="session-label">{getText(task.title, `Task #${task.id}`)}</p>
                      <p className="session-value">
                        {getText(task.role, 'Developer')} / {getText(task.status)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No task assignments yet.</p>
              )}
            </InfoCard>

            {canManagePeople ? (
              <InfoCard wide>
                <Link
                  to={`/developers/${id}/edit`}
                  className="primary-button action-link"
                >
                  Edit developer
                </Link>
              </InfoCard>
            ) : null}
          </>
        ) : null}
      </section>
    </>
  )
}

export default DeveloperDetailsPage

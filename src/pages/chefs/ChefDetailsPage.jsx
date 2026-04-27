import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { useRoleAccess } from '../../auth/useRoleAccess.js'
import { getChefDeProjet } from '../../services/chefDeProjetService.js'
import { getApiErrorMessage, getCollection, getEntity, getText } from '../../utils/apiResponse.js'

function ChefDetailsPage() {
  const { canManagePeople } = useRoleAccess()
  const { id } = useParams()
  const [chef, setChef] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadChef() {
      try {
        const payload = await getChefDeProjet(id)

        if (!active) {
          return
        }

        setChef(getEntity(payload))
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load chef de projet.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadChef()

    return () => {
      active = false
    }
  }, [id])

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Chefs de projet</p>
        <h1>{chef?.name ? chef.name : `Chef de projet #${id}`}</h1>
        <p className="lead">This page now loads chef de projet details from the API.</p>
      </PageSection>

      <section className="info-grid">
        {loading ? <p className="feedback-message">Loading chef...</p> : null}
        {error ? <p className="feedback-message feedback-error">{error}</p> : null}

        {!loading && chef ? (
          <>
            <InfoCard>
              <h2>Lead information</h2>
              <div className="session-list">
                <div>
                  <p className="session-label">Name</p>
                  <p className="session-value">{getText(chef.name)}</p>
                </div>
                <div>
                  <p className="session-label">Email</p>
                  <p className="session-value">{getText(chef.email)}</p>
                </div>
                <div>
                  <p className="session-label">Manager</p>
                  <p className="session-value">{getText(chef.manager?.name, 'No manager assigned')}</p>
                </div>
                <div>
                  <p className="session-label">Projects</p>
                  <p className="session-value">{getText(chef.projects_count, '0')}</p>
                </div>
                <div>
                  <p className="session-label">Recent tasks</p>
                  <p className="session-value">{getText(chef.tasks_count, '0')}</p>
                </div>
              </div>
            </InfoCard>

            <InfoCard>
              <h2>Projects supervised</h2>
              {getCollection(chef.projects).length > 0 ? (
                <div className="session-list">
                  {getCollection(chef.projects).map((project) => (
                    <div key={project.id}>
                      <p className="session-label">{getText(project.name)}</p>
                      <p className="session-value">
                        Deadline: {getText(project.deadline, 'No deadline')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No supervised projects yet.</p>
              )}
            </InfoCard>

            <InfoCard>
              <h2>Recent tasks</h2>
              {getCollection(chef.recent_tasks).length > 0 ? (
                <div className="session-list">
                  {getCollection(chef.recent_tasks).map((task) => (
                    <div key={task.id}>
                      <p className="session-label">{getText(task.title, `Task #${task.id}`)}</p>
                      <p className="session-value">{getText(task.status)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No recent tasks yet.</p>
              )}
            </InfoCard>

            {canManagePeople ? (
              <InfoCard wide>
                <Link to={`/chefs/${id}/edit`} className="primary-button action-link">
                  Edit chef de projet
                </Link>
              </InfoCard>
            ) : null}
          </>
        ) : null}
      </section>
    </>
  )
}

export default ChefDetailsPage

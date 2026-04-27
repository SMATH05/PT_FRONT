import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getManagers } from '../../services/managerService.js'
import {
  getApiErrorMessage,
  getCollection,
  getCount,
  getText,
} from '../../utils/apiResponse.js'

function ManagersListPage() {
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadManagers() {
      try {
        const payload = await getManagers()

        if (!active) {
          return
        }

        setManagers(getCollection(payload))
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load managers.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadManagers()

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Managers</p>
        <h1>Manage the project managers.</h1>
        <p className="lead">This list now loads manager data from the API.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <div className="page-toolbar">
            <div>
              <h2>Managers list</h2>
              <p>Show all managers and the projects they supervise.</p>
            </div>
            <Link to="/managers/create" className="primary-button action-link">
              Create manager
            </Link>
          </div>

          {loading ? <p className="feedback-message">Loading managers...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading && !error ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Projects</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={manager.id}>
                      <td>{getText(manager.name)}</td>
                      <td>{getText(manager.email)}</td>
                      <td>{getCount(manager.projects ?? manager.projects_count)}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/managers/${manager.id}`} className="table-link">
                            View
                          </Link>
                          <Link
                            to={`/managers/${manager.id}/edit`}
                            className="table-link"
                          >
                            Edit
                          </Link>
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

export default ManagersListPage

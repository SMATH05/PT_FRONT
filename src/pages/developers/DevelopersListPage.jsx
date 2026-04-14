import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getDevelopers } from '../../services/developerService.js'
import {
  getApiErrorMessage,
  getCollection,
  getText,
} from '../../utils/apiResponse.js'

function DevelopersListPage() {
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDevelopers() {
      try {
        const payload = await getDevelopers()

        if (!active) {
          return
        }

        setDevelopers(getCollection(payload))
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load developers.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDevelopers()

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Developers</p>
        <h1>Manage project developers.</h1>
        <p className="lead">Show developers and the manager currently responsible for them.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <div className="page-toolbar">
            <div>
              <h2>Developers list</h2>
              <p>Use this page before assigning developers to projects and tasks.</p>
            </div>
            <Link to="/developers/create" className="primary-button action-link">
              Create developer
            </Link>
          </div>

          {loading ? <p className="feedback-message">Loading developers...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading && !error ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Manager</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {developers.map((developer) => (
                    <tr key={developer.id}>
                      <td>{getText(developer.name)}</td>
                      <td>{getText(developer.email)}</td>
                      <td>{getText(developer.manager?.name, 'No manager assigned')}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/developers/${developer.id}`} className="table-link">
                            View
                          </Link>
                          <Link
                            to={`/developers/${developer.id}/edit`}
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

export default DevelopersListPage

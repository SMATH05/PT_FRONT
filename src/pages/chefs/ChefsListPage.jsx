import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getChefsDeProjet } from '../../services/chefDeProjetService.js'
import { useRoleAccess } from '../../auth/useRoleAccess.js'
import { getApiErrorMessage, getCollection, getText } from '../../utils/apiResponse.js'

function ChefsListPage() {
  const { canManagePeople } = useRoleAccess()
  const [chefs, setChefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadChefs() {
      try {
        const payload = await getChefsDeProjet()

        if (!active) {
          return
        }

        setChefs(getCollection(payload))
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load chefs de projet.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadChefs()

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Chefs de projet</p>
        <h1>Manage project leads.</h1>
        <p className="lead">This list now loads from the `chefs-de-projet` API.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <div className="page-toolbar">
            <div>
              <h2>Project leads</h2>
              <p>List the chefs de projet responsible for project delivery.</p>
            </div>
            {canManagePeople ? (
              <Link to="/chefs/create" className="primary-button action-link">
                Create chef de projet
              </Link>
            ) : null}
          </div>

          {loading ? <p className="feedback-message">Loading chefs...</p> : null}
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
                  {chefs.map((chef) => (
                    <tr key={chef.id}>
                      <td>{getText(chef.name)}</td>
                      <td>{getText(chef.email)}</td>
                      <td>{getText(chef.manager?.name, 'No manager assigned')}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/chefs/${chef.id}`} className="table-link">
                            View
                          </Link>
                          {canManagePeople ? (
                            <Link to={`/chefs/${chef.id}/edit`} className="table-link">
                              Edit
                            </Link>
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

export default ChefsListPage

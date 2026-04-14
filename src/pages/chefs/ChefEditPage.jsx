import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import {
  getChefDeProjet,
  updateChefDeProjet,
} from '../../services/chefDeProjetService.js'
import { getManagers } from '../../services/managerService.js'
import { getApiErrorMessage, getCollection, getEntity } from '../../utils/apiResponse.js'

function ChefEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', manager_id: '' })
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadChef() {
      try {
        const [chefPayload, managersPayload] = await Promise.all([
          getChefDeProjet(id),
          getManagers(),
        ])
        const chef = getEntity(chefPayload)

        if (!active || !chef) {
          return
        }

        setManagers(getCollection(managersPayload))
        setForm({
          name: chef.name ?? '',
          email: chef.email ?? '',
          manager_id: chef.manager?.id ? String(chef.manager.id) : '',
        })
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

  function handleChange(event) {
    const { name, value } = event.target
    setError('')
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      manager_id: form.manager_id ? Number.parseInt(form.manager_id, 10) : null,
    }

    try {
      setSaving(true)
      setError('')
      await updateChefDeProjet(id, payload)
      navigate(`/chefs/${id}`)
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to update chef de projet.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Chefs de projet</p>
        <h1>Edit chef de projet #{id}</h1>
        <p className="lead">This form now loads and updates the API resource.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          {loading ? <p className="feedback-message">Loading chef...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading ? (
            <form className="resource-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Name</span>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                <span>Manager</span>
                <select
                  name="manager_id"
                  value={form.manager_id}
                  onChange={handleChange}
                >
                  <option value="">No manager assigned</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Updating...' : 'Update chef de projet'}
                </button>
              </div>
            </form>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default ChefEditPage

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { createChefDeProjet } from '../../services/chefDeProjetService.js'
import { getManagers } from '../../services/managerService.js'
import {
  getApiErrorMessage,
  getCollection,
  getEntity,
} from '../../utils/apiResponse.js'

function ChefCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', manager_id: '' })
  const [managers, setManagers] = useState([])
  const [loadingManagers, setLoadingManagers] = useState(true)
  const [saving, setSaving] = useState(false)
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
          setLoadingManagers(false)
        }
      }
    }

    loadManagers()

    return () => {
      active = false
    }
  }, [])

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

      const response = await createChefDeProjet(payload)
      const chef = getEntity(response)

      navigate(`/chefs/${chef?.id ?? ''}`)
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to create chef de projet.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Chefs de projet</p>
        <h1>Create a project lead.</h1>
        <p className="lead">This form now submits to the API.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}
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
                disabled={loadingManagers}
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
                {saving ? 'Saving...' : 'Save chef de projet'}
              </button>
            </div>
          </form>
        </InfoCard>
      </section>
    </>
  )
}

export default ChefCreatePage

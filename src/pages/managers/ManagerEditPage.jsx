import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getManager, updateManager } from '../../services/managerService.js'
import { getApiErrorMessage, getEntity } from '../../utils/apiResponse.js'

function ManagerEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadManager() {
      try {
        const payload = await getManager(id)
        const manager = getEntity(payload)

        if (!active || !manager) {
          return
        }

        setForm({
          name: manager.name ?? '',
          email: manager.email ?? '',
        })
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

    loadManager()

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

    try {
      setSaving(true)
      await updateManager(id, {
        name: form.name.trim(),
        email: form.email.trim(),
      })
      navigate(`/managers/${id}`)
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to update manager.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Managers</p>
        <h1>Edit manager #{id}</h1>
        <p className="lead">Update the manager with the backend-supported fields only.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          {loading ? <p className="feedback-message">Loading manager...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading ? (
            <form className="resource-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Full name</span>
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
              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Updating...' : 'Update manager'}
                </button>
              </div>
            </form>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default ManagerEditPage

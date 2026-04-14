import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { createManager } from '../../services/managerService.js'
import { getApiErrorMessage, getEntity } from '../../utils/apiResponse.js'

function ManagerCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setError('')
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      const response = await createManager({
        name: form.name.trim(),
        email: form.email.trim(),
      })
      const manager = getEntity(response)
      navigate(`/managers/${manager?.id ?? ''}`)
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to create manager.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Managers</p>
        <h1>Create a manager.</h1>
        <p className="lead">This form now submits only the fields your backend accepts.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}
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
                {saving ? 'Saving...' : 'Save manager'}
              </button>
            </div>
          </form>
        </InfoCard>
      </section>
    </>
  )
}

export default ManagerCreatePage

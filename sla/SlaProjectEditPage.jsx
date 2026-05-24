import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import {
  getProjectSla,
  updateProjectSla,
} from '../../services/projectService.js'
import { getApiErrorMessage, getEntity } from '../../utils/apiResponse.js'

function SlaProjectEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    max_response_time: '',
    max_resolution_time: '',
    priority: 'medium',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSla() {
      try {
        const payload = await getProjectSla(id)
        const sla = getEntity(payload)

        if (!active || !sla) {
          return
        }

        setForm({
          name: sla.name ?? '',
          max_response_time: String(sla.max_response_time ?? ''),
          max_resolution_time: String(sla.max_resolution_time ?? ''),
          priority: sla.priority ?? 'medium',
        })
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load project SLA.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSla()

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
      await updateProjectSla(id, {
        name: form.name.trim() || null,
        max_response_time: Number.parseInt(form.max_response_time, 10),
        max_resolution_time: Number.parseInt(form.max_resolution_time, 10),
        priority: form.priority,
      })
      navigate(`/sla-projects/${id}`)
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to update project SLA.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">SLA</p>
        <h1>Edit project SLA #{id}</h1>
        <p className="lead">Update the SLA using the exact backend schema.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          {loading ? <p className="feedback-message">Loading SLA...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading ? (
            <form className="resource-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>SLA name</span>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Max response time (hours)</span>
                <input
                  name="max_response_time"
                  type="number"
                  min="1"
                  value={form.max_response_time}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                <span>Max resolution time (days)</span>
                <input
                  name="max_resolution_time"
                  type="number"
                  min="1"
                  value={form.max_resolution_time}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                <span>Priority</span>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Updating...' : 'Update SLA'}
                </button>
              </div>
            </form>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default SlaProjectEditPage

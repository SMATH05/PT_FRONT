import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getProjects, updateProjectSla } from '../../services/projectService.js'
import {
  getApiErrorMessage,
  getCollection,
} from '../../utils/apiResponse.js'

function SlaProjectCreatePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({
    project_id: '',
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

    async function loadProjects() {
      try {
        const payload = await getProjects()

        if (active) {
          setProjects(getCollection(payload))
        }
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load projects.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProjects()

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

    if (!form.project_id) {
      setError('Project is required.')
      return
    }

    try {
      setSaving(true)
      await updateProjectSla(form.project_id, {
        name: form.name.trim() || null,
        max_response_time: Number.parseInt(form.max_response_time, 10),
        max_resolution_time: Number.parseInt(form.max_resolution_time, 10),
        priority: form.priority,
      })
      navigate(`/sla-projects/${form.project_id}`)
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to save project SLA.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">SLA</p>
        <h1>Create or update a project SLA.</h1>
        <p className="lead">
          This page uses the real project SLA endpoint and the real backend field names.
        </p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          {loading ? <p className="feedback-message">Loading projects...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading ? (
            <form className="resource-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Project *</span>
                <select
                  name="project_id"
                  value={form.project_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
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
                  {saving ? 'Saving...' : 'Save SLA'}
                </button>
              </div>
            </form>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default SlaProjectCreatePage

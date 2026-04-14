import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getChefsDeProjet } from '../../services/chefDeProjetService.js'
import { getManagers } from '../../services/managerService.js'
import { getProject, updateProject } from '../../services/projectService.js'
import {
  getApiErrorMessage,
  getCollection,
  getEntity,
} from '../../utils/apiResponse.js'

function normalizeDateInput(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

function ProjectEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    client: '',
    description: '',
    start_date: '',
    end_date: '',
    deadline: '',
    status: 'pending',
    manager_id: '',
    chef_de_projet_id: '',
  })
  const [managers, setManagers] = useState([])
  const [chefs, setChefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProject() {
      try {
        setLoading(true)
        const [projectPayload, managersPayload, chefsPayload] = await Promise.all([
          getProject(id),
          getManagers(),
          getChefsDeProjet(),
        ])
        const project = getEntity(projectPayload)

        if (!active || !project) {
          return
        }

        setManagers(getCollection(managersPayload))
        setChefs(getCollection(chefsPayload))
        setForm({
          name: project.name ?? '',
          client: project.client ?? '',
          description: project.description ?? '',
          start_date: normalizeDateInput(project.start_date),
          end_date: normalizeDateInput(project.end_date),
          deadline: normalizeDateInput(project.deadline),
          status: project.status ?? 'pending',
          manager_id: project.manager_id ? String(project.manager_id) : '',
          chef_de_projet_id: project.chef_de_projet_id
            ? String(project.chef_de_projet_id)
            : '',
        })
        setError('')
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load project.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProject()

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
      client: form.client.trim(),
      description: form.description.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      deadline: form.deadline || null,
      status: form.status || 'pending',
      manager_id: Number.parseInt(form.manager_id, 10),
      chef_de_projet_id: form.chef_de_projet_id
        ? Number.parseInt(form.chef_de_projet_id, 10)
        : null,
    }

    try {
      setSaving(true)
      setError('')
      await updateProject(id, payload)
      navigate(`/projects/${id}`)
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to update project.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Projects</p>
        <h1>Edit project #{id}</h1>
        <p className="lead">Update project data with the same fields the backend expects.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <h2>Update project</h2>
          {loading ? <p className="feedback-message">Loading project...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading ? (
            <form className="resource-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Name *</span>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field">
                <span>Client *</span>
                <input
                  name="client"
                  type="text"
                  value={form.client}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field">
                <span>Description</span>
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>Start date</span>
                <input
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>End date</span>
                <input
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>Deadline</span>
                <input
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>Status</span>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>

              <label className="form-field">
                <span>Manager</span>
                <select
                  name="manager_id"
                  value={form.manager_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Chef de projet</span>
                <select
                  name="chef_de_projet_id"
                  value={form.chef_de_projet_id}
                  onChange={handleChange}
                >
                  <option value="">No chef assigned</option>
                  {chefs.map((chef) => (
                    <option key={chef.id} value={chef.id}>
                      {chef.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Updating...' : 'Update project'}
                </button>
              </div>
            </form>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default ProjectEditPage

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import {
  createManagerProject,
  getManagerChefs,
  getManagers,
} from '../../services/managerService.js'
import {
  getApiErrorMessage,
  getCollection,
} from '../../utils/apiResponse.js'

const initialForm = {
  name: '',
  client: '',
  description: '',
  start_date: '',
  deadline: '',
  status: 'pending',
  chef_de_projet_id: '',
}

function ProjectCreatePage() {
  const navigate = useNavigate()
  const { managerId } = useParams()
  const [managers, setManagers] = useState([])
  const [chefs, setChefs] = useState([])
  const [selectedManager, setSelectedManager] = useState(managerId || '')
  const [form, setForm] = useState(initialForm)
  const [loadingManagers, setLoadingManagers] = useState(false)
  const [loadingChefs, setLoadingChefs] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const resolvedManagerId = managerId || selectedManager

  useEffect(() => {
    let active = true

    async function loadManagers() {
      if (managerId) {
        return
      }

      try {
        setLoadingManagers(true)
        const payload = await getManagers()

        if (active) {
          setManagers(getCollection(payload))
        }
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load managers.'))
          setManagers([])
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
  }, [managerId])

  useEffect(() => {
    let active = true

    async function loadChefs() {
      if (!resolvedManagerId) {
        setChefs([])
        return
      }

      try {
        setLoadingChefs(true)
        const payload = await getManagerChefs(resolvedManagerId)

        if (!active) {
          return
        }

        const nextChefs = getCollection(payload)
        setChefs(nextChefs)
        setForm((current) =>
          nextChefs.some((chef) => String(chef.id) === current.chef_de_projet_id)
            ? current
            : { ...current, chef_de_projet_id: '' },
        )
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load chefs de projet.'))
          setChefs([])
        }
      } finally {
        if (active) {
          setLoadingChefs(false)
        }
      }
    }

    loadChefs()

    return () => {
      active = false
    }
  }, [resolvedManagerId])

  function handleChange(event) {
    const { name, value } = event.target
    setError('')
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleManagerChange(event) {
    setError('')
    setSelectedManager(event.target.value)
    setForm((current) => ({ ...current, chef_de_projet_id: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const mgrId = resolvedManagerId

    if (!mgrId) {
      setError('Manager is required.')
      return
    }

    const payload = {
      name: form.name.trim(),
      client: form.client.trim(),
      description: form.description.trim() || null,
      start_date: form.start_date || null,
      deadline: form.deadline || null,
      status: form.status || 'pending',
      chef_de_projet_id: form.chef_de_projet_id
        ? Number.parseInt(form.chef_de_projet_id, 10)
        : null,
    }

    try {
      setSaving(true)
      setError('')

      const response = await createManagerProject(mgrId, payload)
      const projectId = response?.id ?? response?.data?.id

      if (projectId) {
        navigate(`/managers/${mgrId}/projects/${projectId}/assign`)
        return
      }

      throw new Error('No project ID returned')
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to create project.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Projects</p>
        <h1>Create a new project.</h1>
        <p className="lead">
          Create the project first, then continue to the assignment page for chefs
          de projet and developers.
        </p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <h2>Project details</h2>
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          <form className="resource-form" onSubmit={handleSubmit}>
            {!managerId ? (
              <label className="form-field">
                <span>Manager *</span>
                <select
                  value={selectedManager}
                  onChange={handleManagerChange}
                  disabled={loadingManagers}
                  required
                >
                  <option value="">Select a manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} {manager.email ? `(${manager.email})` : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="form-field">
              <span>Project name *</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter project name"
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
                placeholder="Enter client name"
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
                placeholder="Add project details"
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
              <span>Chef de projet</span>
              <select
                name="chef_de_projet_id"
                value={form.chef_de_projet_id}
                onChange={handleChange}
                disabled={!resolvedManagerId || loadingChefs}
              >
                <option value="">Assign later</option>
                {chefs.map((chef) => (
                  <option key={chef.id} value={chef.id}>
                    {chef.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Creating...' : 'Next: Assign Team'}
              </button>
              <button
                type="button"
                className="ghost-button project-ghost-button"
                onClick={() => navigate(managerId ? `/managers/${managerId}` : '/projects')}
              >
                Cancel
              </button>
            </div>
          </form>
        </InfoCard>
      </section>
    </>
  )
}

export default ProjectCreatePage

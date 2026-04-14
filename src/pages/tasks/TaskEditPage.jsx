import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getChefsDeProjet } from '../../services/chefDeProjetService.js'
import { getProjects, getProjectDevelopers } from '../../services/projectService.js'
import {
  bulkAssignTaskDevelopers,
  getTask,
  getTaskDevelopers,
  removeAllTaskDevelopers,
  updateTask,
} from '../../services/taskService.js'
import {
  getApiErrorMessage,
  getCollection,
  getEntity,
} from '../../utils/apiResponse.js'

function TaskEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    project_id: '',
    chef_de_projet_id: '',
    status: 'pending',
  })
  const [projects, setProjects] = useState([])
  const [chefs, setChefs] = useState([])
  const [availableDevelopers, setAvailableDevelopers] = useState([])
  const [developerAssignments, setDeveloperAssignments] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingDevelopers, setLoadingDevelopers] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadTaskData() {
      try {
        const [taskPayload, projectsPayload, chefsPayload, taskDevelopersPayload] =
          await Promise.all([
            getTask(id),
            getProjects(),
            getChefsDeProjet(),
            getTaskDevelopers(id).catch(() => []),
          ])

        const task = getEntity(taskPayload)

        if (!active || !task) {
          return
        }

        setProjects(getCollection(projectsPayload))
        setChefs(getCollection(chefsPayload))
        setForm({
          title: task.title ?? '',
          description: task.description ?? task.goal ?? '',
          project_id: task.project_id ? String(task.project_id) : '',
          chef_de_projet_id: task.chef_de_projet_id ? String(task.chef_de_projet_id) : '',
          status: task.status ?? 'pending',
        })
        setDeveloperAssignments(
          Object.fromEntries(
            getCollection(taskDevelopersPayload).map((developer) => [
              String(developer.id),
              developer.pivot?.role ?? 'developer',
            ]),
          ),
        )
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load task.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadTaskData()

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    let active = true

    async function loadProjectDevelopers() {
      if (!form.project_id) {
        setAvailableDevelopers([])
        setDeveloperAssignments({})
        return
      }

      try {
        setLoadingDevelopers(true)
        const payload = await getProjectDevelopers(form.project_id)

        if (!active) {
          return
        }

        const nextDevelopers = getCollection(payload)
        setAvailableDevelopers(nextDevelopers)
        setDeveloperAssignments((current) =>
          Object.fromEntries(
            Object.entries(current).filter(([developerId]) =>
              nextDevelopers.some((developer) => String(developer.id) === developerId),
            ),
          ),
        )
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load project developers.'))
          setAvailableDevelopers([])
        }
      } finally {
        if (active) {
          setLoadingDevelopers(false)
        }
      }
    }

    loadProjectDevelopers()

    return () => {
      active = false
    }
  }, [form.project_id])

  function handleChange(event) {
    const { name, value } = event.target
    setError('')
    setForm((current) => ({ ...current, [name]: value }))
  }

  function toggleDeveloper(developerId) {
    const key = String(developerId)
    setDeveloperAssignments((current) => {
      if (current[key]) {
        const next = { ...current }
        delete next[key]
        return next
      }

      return {
        ...current,
        [key]: 'developer',
      }
    })
  }

  function handleDeveloperRoleChange(developerId, role) {
    const key = String(developerId)
    setDeveloperAssignments((current) => ({
      ...current,
      [key]: role,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      project_id: Number.parseInt(form.project_id, 10),
      chef_de_projet_id: form.chef_de_projet_id
        ? Number.parseInt(form.chef_de_projet_id, 10)
        : null,
      status: form.status,
    }

    try {
      setSaving(true)
      setError('')
      await updateTask(id, payload)
      await removeAllTaskDevelopers(id)

      const selectedDevelopers = Object.entries(developerAssignments).map(
        ([developerId, role]) => ({
          developer_id: Number.parseInt(developerId, 10),
          role,
        }),
      )

      if (selectedDevelopers.length > 0) {
        await bulkAssignTaskDevelopers(id, {
          developers: selectedDevelopers,
        })
      }

      navigate(`/tasks/${id}`)
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'Unable to update task.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Tasks</p>
        <h1>Edit task #{id}</h1>
        <p className="lead">Update task data and keep developer assignment in sync with the backend.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          {loading ? <p className="feedback-message">Loading task...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading ? (
            <form className="resource-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Title *</span>
                <input
                  name="title"
                  type="text"
                  value={form.title}
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

              <label className="form-field">
                <span>Status</span>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                  <option value="validated">Validated</option>
                </select>
              </label>

              <div>
                <h2>Assign developers</h2>
                {loadingDevelopers ? (
                  <p className="feedback-message">Loading project developers...</p>
                ) : null}
                {!loadingDevelopers && form.project_id && availableDevelopers.length === 0 ? (
                  <p className="feedback-message">
                    No developers are assigned to this project yet.
                  </p>
                ) : null}

                <div className="developers-grid">
                  {availableDevelopers.map((developer) => {
                    const isSelected = Boolean(developerAssignments[String(developer.id)])

                    return (
                      <div
                        key={developer.id}
                        className={`selection-card ${isSelected ? 'selection-card-active' : ''}`}
                      >
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDeveloper(developer.id)}
                          />
                          <span>{developer.name}</span>
                        </label>

                        {isSelected ? (
                          <select
                            className="form-field"
                            value={developerAssignments[String(developer.id)]}
                            onChange={(event) =>
                              handleDeveloperRoleChange(developer.id, event.target.value)
                            }
                          >
                            <option value="developer">Developer</option>
                            <option value="owner">Owner</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="tester">Tester</option>
                          </select>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Updating...' : 'Update task'}
                </button>
              </div>
            </form>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default TaskEditPage

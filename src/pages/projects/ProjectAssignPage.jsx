import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import {
  getAssignmentData,
  getManagerProjectDetails,
  saveAssignments,
} from '../../services/managerService.js'
import { getCollection, getEntity } from '../../utils/apiResponse.js'

function normalizeId(value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return String(value)
}

function getTaskLabel(task) {
  return task.title ?? task.name ?? `Task #${task.id}`
}

function matchesSearch(entity, query) {
  if (!query) {
    return true
  }

  const normalizedQuery = query.trim().toLowerCase()
  return [entity.name, entity.email].some((value) =>
    value?.toLowerCase().includes(normalizedQuery),
  )
}

function ProjectAssignPage() {
  const navigate = useNavigate()
  const { managerId, projectId } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chefs, setChefs] = useState([])
  const [developers, setDevelopers] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedChef, setSelectedChef] = useState('')
  const [selectedDevelopers, setSelectedDevelopers] = useState([])
  const [taskAssignments, setTaskAssignments] = useState({})
  const [chefSearch, setChefSearch] = useState('')
  const [developerSearch, setDeveloperSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const [assignmentPayload, projectPayload] = await Promise.all([
          getAssignmentData(managerId, projectId),
          getManagerProjectDetails(managerId, projectId),
        ])

        if (!active) {
          return
        }

        const assignmentData = getEntity(assignmentPayload) ?? assignmentPayload ?? {}
        const projectDetails = getEntity(projectPayload) ?? projectPayload ?? {}
        const projectEntity = assignmentData.project ?? projectDetails
        const existingDevelopers = getCollection(
          projectEntity.project_developers ?? projectEntity.developers,
        )

        setProject(projectEntity)
        setChefs(getCollection(assignmentData.available_chefs_de_projet))
        setDevelopers(getCollection(assignmentData.available_developers))
        setTasks(getCollection(projectDetails.tasks ?? projectEntity.tasks ?? []))
        setSelectedChef(normalizeId(projectEntity.chef_de_projet_id))
        setSelectedDevelopers(
          existingDevelopers
            .map((developer) => normalizeId(developer.id ?? developer.developer_id))
            .filter(Boolean),
        )
      } catch (loadError) {
        if (active) {
          setError(loadError.response?.data?.message ?? 'Unable to load assignment data.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [managerId, projectId])

  function toggleDeveloper(developerId) {
    const normalizedId = normalizeId(developerId)

    setSelectedDevelopers((current) =>
      current.includes(normalizedId)
        ? current.filter((id) => id !== normalizedId)
        : [...current, normalizedId],
    )
  }

  function setTaskDeveloper(taskId, developerId, role = 'owner') {
    setTaskAssignments((current) => ({
      ...current,
      [taskId]: {
        developer_id: normalizeId(developerId),
        role,
      },
    }))
  }

  const filteredChefs = chefs.filter((chef) => matchesSearch(chef, chefSearch))
  const filteredDevelopers = developers.filter((developer) =>
    matchesSearch(developer, developerSearch),
  )

  async function handleSave() {
    if (!selectedChef && selectedDevelopers.length === 0) {
      setError('Please select at least a chef or developers.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        chef_de_projet_id: selectedChef ? Number.parseInt(selectedChef, 10) : null,
        project_developers: selectedDevelopers.map((developerId) => ({
          developer_id: Number.parseInt(developerId, 10),
          position: 'developer',
        })),
        task_assignments: tasks
          .filter(
            (task) =>
              taskAssignments[task.id]?.developer_id &&
              selectedDevelopers.includes(taskAssignments[task.id].developer_id),
          )
          .map((task) => ({
            task_id: task.id,
            developers: [
              {
                developer_id: Number.parseInt(taskAssignments[task.id].developer_id, 10),
                role: taskAssignments[task.id].role,
              },
            ],
          })),
      }

      await saveAssignments(managerId, projectId, payload)
      navigate(`/managers/${managerId}/projects/${projectId}`)
    } catch (saveError) {
      setError(saveError.response?.data?.message ?? 'Unable to save assignments.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageSection className="hero-panel">
        <p className="feedback-message">Loading assignment data...</p>
      </PageSection>
    )
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Projects / Assignments</p>
        <h1>Assign team to "{project?.name}"</h1>
        <p className="lead">
          Pick existing people from the list, search if needed, then save the project team.
        </p>
      </PageSection>

      <section className="info-grid">
        {error ? (
          <InfoCard wide>
            <p className="feedback-message feedback-error">{error}</p>
          </InfoCard>
        ) : null}

        <InfoCard wide>
          <h2>Chef de projet</h2>
          <div className="search-section">
            <input
              type="text"
              placeholder="Search chef by name or email..."
              value={chefSearch}
              onChange={(event) => setChefSearch(event.target.value)}
              className="form-field"
              style={{ marginBottom: '1rem' }}
            />
          </div>

          <div className="developers-grid">
            <button
              type="button"
              className={`selection-card ${selectedChef === '' ? 'selection-card-active' : ''}`}
              onClick={() => setSelectedChef('')}
            >
              <strong>No chef assigned</strong>
              <small>Keep assignment empty for now.</small>
            </button>

            {filteredChefs.map((chef) => (
              <button
                key={chef.id}
                type="button"
                className={`selection-card ${
                  selectedChef === normalizeId(chef.id) ? 'selection-card-active' : ''
                }`}
                onClick={() => setSelectedChef(normalizeId(chef.id))}
              >
                <strong>{chef.name}</strong>
                <small>{chef.email || 'No email'}</small>
              </button>
            ))}
          </div>
        </InfoCard>

        <InfoCard wide>
          <h2>Developers</h2>
          <div className="search-section">
            <input
              type="text"
              placeholder="Search developers by name or email..."
              value={developerSearch}
              onChange={(event) => setDeveloperSearch(event.target.value)}
              className="form-field"
              style={{ marginBottom: '1rem' }}
            />
          </div>

          <div className="developers-grid">
            {filteredDevelopers.map((developer) => (
              <label key={developer.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDevelopers.includes(normalizeId(developer.id))}
                  onChange={() => toggleDeveloper(developer.id)}
                />
                <span>
                  {developer.name}
                  <br />
                  <small>{developer.email || 'No email'}</small>
                </span>
              </label>
            ))}
          </div>
        </InfoCard>

        {tasks.length > 0 ? (
          <InfoCard wide>
            <h2>Assign Tasks to Developers</h2>
            <div className="tasks-section">
              {tasks.map((task) => (
                <div key={task.id} className="task-assignment-row">
                  <div className="task-info">
                    <strong>{getTaskLabel(task)}</strong>
                    {task.description ? <p>{task.description}</p> : null}
                  </div>

                  <select
                    value={taskAssignments[task.id]?.developer_id || ''}
                    onChange={(event) => setTaskDeveloper(task.id, event.target.value)}
                    className="form-field"
                  >
                    <option value="">-- Unassigned --</option>
                    {selectedDevelopers.map((developerId) => {
                      const developer = developers.find(
                        (entry) => normalizeId(entry.id) === developerId,
                      )

                      return developer ? (
                        <option key={developer.id} value={developer.id}>
                          {developer.name}
                        </option>
                      ) : null
                    })}
                  </select>
                </div>
              ))}
            </div>
          </InfoCard>
        ) : null}

        <InfoCard wide>
          <div className="form-actions">
            <button className="primary-button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Assignments'}
            </button>
            <button
              className="ghost-button project-ghost-button"
              onClick={() => navigate(`/managers/${managerId}/projects/${projectId}`)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </InfoCard>
      </section>

      <style>{`
        .developers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }

        .selection-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
          width: 100%;
          padding: 0.9rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: #fff;
          text-align: left;
          cursor: pointer;
        }

        .selection-card-active {
          border-color: #1976d2;
          background: #e3f2fd;
        }

        .selection-card small {
          color: #666;
        }

        .checkbox-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
        }

        .checkbox-item input[type='checkbox'] {
          margin-top: 0.25rem;
          cursor: pointer;
        }

        .checkbox-item small {
          color: #666;
          display: block;
        }

        .tasks-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1rem 0;
        }

        .task-assignment-row {
          display: grid;
          grid-template-columns: 1fr 250px;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }

        .task-info p {
          margin: 0.25rem 0 0 0;
          font-size: 0.9rem;
          color: #666;
        }

        .form-field {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
          width: 100%;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
      `}</style>
    </>
  )
}

export default ProjectAssignPage

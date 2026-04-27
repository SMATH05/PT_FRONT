import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { useRoleAccess } from '../../auth/useRoleAccess.js'
import {
  getTask,
  getTaskDevelopers,
  getTaskSla,
} from '../../services/taskService.js'
import {
  getApiErrorMessage,
  getCollection,
  getEntity,
  getText,
} from '../../utils/apiResponse.js'

function TaskDetailsPage() {
  const { canManageTasks } = useRoleAccess()
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [developers, setDevelopers] = useState([])
  const [sla, setSla] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadTask() {
      try {
        const [taskPayload, developersPayload, slaPayload] = await Promise.all([
          getTask(id),
          getTaskDevelopers(id).catch(() => []),
          getTaskSla(id).catch(() => null),
        ])

        if (!active) {
          return
        }

        setTask(getEntity(taskPayload))
        setDevelopers(getCollection(developersPayload))
        setSla(getEntity(slaPayload))
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

    loadTask()

    return () => {
      active = false
    }
  }, [id])

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Tasks</p>
        <h1>{task?.title ? task.title : `Task #${id}`}</h1>
        <p className="lead">View the task, its chef de projet, assigned developers, and task SLA.</p>
      </PageSection>

      <section className="info-grid">
        {loading ? <p className="feedback-message">Loading task...</p> : null}
        {error ? <p className="feedback-message feedback-error">{error}</p> : null}

        {!loading && task ? (
          <>
            <InfoCard>
              <h2>Task details</h2>
              <div className="session-list">
                <div>
                  <p className="session-label">Title</p>
                  <p className="session-value">{getText(task.title ?? task.name)}</p>
                </div>
                <div>
                  <p className="session-label">Description</p>
                  <p className="session-value">
                    {getText(task.description ?? task.goal, 'No description')}
                  </p>
                </div>
                <div>
                  <p className="session-label">Status</p>
                  <p className="session-value">{getText(task.status)}</p>
                </div>
                <div>
                  <p className="session-label">Project</p>
                  <p className="session-value">
                    {getText(task.project?.name ?? task.project_id)}
                  </p>
                </div>
                <div>
                  <p className="session-label">Chef de projet</p>
                  <p className="session-value">
                    {getText(task.chef_de_projet?.name ?? task.chef_de_projet_id, 'Not assigned')}
                  </p>
                </div>
              </div>
            </InfoCard>

            <InfoCard>
              <h2>Assigned developers</h2>
              {developers.length > 0 ? (
                <div className="session-list">
                  {developers.map((developer) => (
                    <div key={developer.id}>
                      <p className="session-label">{getText(developer.name)}</p>
                      <p className="session-value">
                        {getText(developer.pivot?.role, 'Developer')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="feedback-message">No developers assigned yet.</p>
              )}
            </InfoCard>

            <InfoCard>
              <h2>SLA</h2>
              {sla ? (
                <div className="session-list">
                  <div>
                    <p className="session-label">Priority</p>
                    <p className="session-value">{getText(sla.priority)}</p>
                  </div>
                  <div>
                    <p className="session-label">Response time</p>
                    <p className="session-value">{getText(sla.max_response_time)}</p>
                  </div>
                  <div>
                    <p className="session-label">Resolution time</p>
                    <p className="session-value">{getText(sla.max_resolution_time)}</p>
                  </div>
                </div>
              ) : (
                <p className="feedback-message">No task SLA configured yet.</p>
              )}
            </InfoCard>

            {canManageTasks ? (
              <InfoCard wide>
                <Link to={`/tasks/${id}/edit`} className="primary-button action-link">
                  Edit task
                </Link>
              </InfoCard>
            ) : null}
          </>
        ) : null}
      </section>
    </>
  )
}

export default TaskDetailsPage

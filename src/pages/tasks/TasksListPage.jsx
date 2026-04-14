import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { getTasks } from '../../services/taskService.js'
import {
  getApiErrorMessage,
  getCollection,
  getText,
} from '../../utils/apiResponse.js'

function TasksListPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadTasks() {
      try {
        const payload = await getTasks()

        if (!active) {
          return
        }

        setTasks(getCollection(payload))
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load tasks.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadTasks()

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Tasks</p>
        <h1>Track project tasks.</h1>
        <p className="lead">Manage task status, project ownership, chef assignment, and developers.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <div className="page-toolbar">
            <div>
              <h2>Tasks list</h2>
              <p>Each task can be linked to a project, a chef de projet, and several developers.</p>
            </div>
            <Link to="/tasks/create" className="primary-button action-link">
              Create task
            </Link>
          </div>

          {loading ? <p className="feedback-message">Loading tasks...</p> : null}
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}

          {!loading && !error ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Chef de projet</th>
                    <th>Status</th>
                    <th>Developers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{getText(task.title ?? task.name)}</td>
                      <td>{getText(task.project?.name ?? task.project_id)}</td>
                      <td>
                        {getText(
                          task.chef_de_projet?.name ?? task.chef_de_projet_id,
                          'Not assigned',
                        )}
                      </td>
                      <td>{getText(task.status)}</td>
                      <td>{getCollection(task.developers).length}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/tasks/${task.id}`} className="table-link">
                            View
                          </Link>
                          <Link to={`/tasks/${task.id}/edit`} className="table-link">
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default TasksListPage

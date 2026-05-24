import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import { useRoleAccess } from '../../auth/useRoleAccess.js'
import { getProject, getProjectSla } from '../../services/projectService.js'
import {
  getApiErrorMessage,
  getEntity,
  getText,
} from '../../utils/apiResponse.js'

function SlaProjectDetailsPage() {
  const { canManageSla } = useRoleAccess()
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [sla, setSla] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSla() {
      try {
        const [projectPayload, slaPayload] = await Promise.all([
          getProject(id).catch(() => null),
          getProjectSla(id).catch(() => null),
        ])

        if (!active) {
          return
        }

        setProject(getEntity(projectPayload))
        setSla(getEntity(slaPayload))
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

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">SLA</p>
        <h1>{project?.name ? `${project.name} SLA` : `Project SLA #${id}`}</h1>
        <p className="lead">Review the SLA record attached to this project.</p>
      </PageSection>

      <section className="info-grid">
        {loading ? <p className="feedback-message">Loading SLA...</p> : null}
        {error ? <p className="feedback-message feedback-error">{error}</p> : null}

        {!loading ? (
          <>
            <InfoCard>
              <h2>SLA details</h2>
              {sla ? (
                <div className="session-list">
                  <div>
                    <p className="session-label">Name</p>
                    <p className="session-value">{getText(sla.name)}</p>
                  </div>
                  <div>
                    <p className="session-label">Priority</p>
                    <p className="session-value">{getText(sla.priority)}</p>
                  </div>
                  <div>
                    <p className="session-label">Response time</p>
                    <p className="session-value">{getText(sla.max_response_time)} hours</p>
                  </div>
                  <div>
                    <p className="session-label">Resolution time</p>
                    <p className="session-value">{getText(sla.max_resolution_time)} days</p>
                  </div>
                </div>
              ) : (
                <p className="feedback-message">No SLA configured for this project yet.</p>
              )}
            </InfoCard>

            <InfoCard wide>
              <div className="form-actions">
                {canManageSla ? (
                  <Link
                    to={`/sla-projects/${id}/edit`}
                    className="primary-button action-link"
                  >
                    {sla ? 'Edit SLA' : 'Create SLA'}
                  </Link>
                ) : null}
                <Link
                  to={`/projects/${id}`}
                  className="ghost-button action-link"
                >
                  Back to project
                </Link>
              </div>
            </InfoCard>
          </>
        ) : null}
      </section>
    </>
  )
}

export default SlaProjectDetailsPage

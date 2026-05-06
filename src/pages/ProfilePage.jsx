import PageSection from '../components/common/PageSection.jsx'
import InfoCard from '../components/ui/InfoCard.jsx'
import { useAuth } from '../auth/useAuth.js'
import { useRoleAccess } from '../auth/useRoleAccess.js'
import { formatLabel } from '../utils/formatters.js'

function ProfilePage() {
  const { authenticated, profile } = useAuth()
  const { actorIds, roles } = useRoleAccess()

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Profile</p>
        <h1>Your account overview.</h1>
        <p className="lead">
          This page is ready for personal details, preferences, security
          settings, and account actions.
        </p>
      </PageSection>

      <section className="info-grid">
        <InfoCard>
          <h2>Identity</h2>
          {authenticated ? (
            <div className="session-list">
              <div>
                <p className="session-label">Full name</p>
                <p className="session-value">{profile.name}</p>
              </div>
              <div>
                <p className="session-label">Username</p>
                <p className="session-value">{profile.username}</p>
              </div>
              <div>
                <p className="session-label">Email</p>
                <p className="session-value">{profile.email}</p>
              </div>
              <div>
                <p className="session-label">Roles</p>
                <p className="session-value">{roles.map(formatLabel).join(' / ') || 'No role detected yet'}</p>
              </div>
            </div>
          ) : (
            <p>Connect with Keycloak to see profile information here.</p>
          )}
        </InfoCard>

        <InfoCard>
          <h2>Actor resolution</h2>
          {authenticated ? (
            <div className="session-list">
              <div>
                <p className="session-label">Manager ID</p>
                <p className="session-value">{actorIds.manager ?? 'Not linked'}</p>
              </div>
              <div>
                <p className="session-label">Chef de projet ID</p>
                <p className="session-value">{actorIds.chef_de_projet ?? 'Not linked'}</p>
              </div>
              <div>
                <p className="session-label">Developer ID</p>
                <p className="session-value">{actorIds.developer ?? 'Not linked'}</p>
              </div>
            </div>
          ) : (
            <p>Sign in to inspect how the backend linked your user to manager, chef, or developer records.</p>
          )}
        </InfoCard>
      </section>
    </>
  )
}

export default ProfilePage

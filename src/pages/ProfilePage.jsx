import PageSection from '../components/common/PageSection.jsx'
import InfoCard from '../components/ui/InfoCard.jsx'
import { useAuth } from '../auth/useAuth.js'

function ProfilePage() {
  const { authenticated, profile } = useAuth()

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
            </div>
          ) : (
            <p>Connect with Keycloak to see profile information here.</p>
          )}
        </InfoCard>

        <InfoCard>
          <h2>Next additions</h2>
          <ul className="detail-list">
            <li>Password and security panel</li>
            <li>Editable account preferences</li>
            <li>User avatar and organization details</li>
          </ul>
        </InfoCard>
      </section>
    </>
  )
}

export default ProfilePage

import PageSection from '../components/common/PageSection.jsx'
import InfoCard from '../components/ui/InfoCard.jsx'
import StatusCard from '../components/ui/StatusCard.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../auth/useAuth.js'

function HomePage() {
  const {
    authenticated,
    error,
    initialized,
    keycloakReady,
    login,
    logout,
    profile,
    token,
  } = useAuth()

  const statusTone = error
    ? 'danger'
    : authenticated
      ? 'success'
      : keycloakReady
        ? 'warning'
        : 'neutral'

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Accueil</p>
        <h1>Authentication is now wired into your frontend.</h1>
        <p className="lead">
          This app reads your Keycloak settings from Vite environment variables,
          checks for an existing session on load, and lets users sign in or out
          without changing the code again.
        </p>

        <StatusCard tone={statusTone} title="Session status">
          <strong>
            {!keycloakReady && 'Missing Keycloak configuration'}
            {keycloakReady && !initialized && 'Initializing Keycloak...'}
            {keycloakReady && initialized && authenticated && 'Authenticated'}
            {keycloakReady && initialized && !authenticated && 'Signed out'}
          </strong>
          {error ? <p>{error}</p> : null}
        </StatusCard>

        <div className="actions">
          <Button
            onClick={login}
            disabled={!keycloakReady || !initialized || authenticated}
          >
            Sign in with Keycloak
          </Button>
          <Button
            variant="ghost"
            onClick={logout}
            disabled={!authenticated}
          >
            Sign out
          </Button>
        </div>
      </PageSection>

      <section className="info-grid">
        <InfoCard>
          <h2>Required env vars</h2>
          <ul className="detail-list">
            <li>
              <code>VITE_KEYCLOAK_URL</code>
            </li>
            <li>
              <code>VITE_KEYCLOAK_REALM</code>
            </li>
            <li>
              <code>VITE_KEYCLOAK_CLIENT_ID</code>
            </li>
          </ul>
          <p>
            Add them to <code>.env</code> using the sample from{' '}
            <code>.env.example</code>.
          </p>
        </InfoCard>

        <InfoCard>
          <h2>User details</h2>
          {authenticated ? (
            <div className="session-list">
              <div>
                <p className="session-label">Name</p>
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
            <p>Sign in to see the current user profile from your token.</p>
          )}
        </InfoCard>

        <InfoCard wide>
          <h2>Access token preview</h2>
          {authenticated && token ? (
            <pre className="token-preview">{token}</pre>
          ) : (
            <p>Your bearer token will appear here after login.</p>
          )}
        </InfoCard>
      </section>
    </>
  )
}

export default HomePage

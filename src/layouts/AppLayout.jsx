import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { APP_NAME } from '../constants/appConstants.js'
import { useAuth } from '../auth/useAuth.js'
import { useRoleAccess } from '../auth/useRoleAccess.js'
import Button from '../components/ui/Button.jsx'
import { formatLabel } from '../utils/formatters.js'

const ROLE_MENUS = {
  manager: [
    { label: 'Projects', to: '/projects' },
    { label: 'Managers', to: '/managers' },
    { label: 'Chefs', to: '/chefs' },
    { label: 'Developers', to: '/developers' },
    { label: 'Tasks', to: '/tasks' },
    { label: 'SLA', to: '/sla-projects' },
  ],
  developer: [
    { label: 'Projects', to: '/projects' },
    { label: 'Tasks', to: '/tasks' },
    { label: 'Profile', to: '/profile' },
  ],
  chef_de_projet: [
    { label: 'Projects', to: '/projects' },
    { label: 'Chefs', to: '/chefs' },
    { label: 'Developers', to: '/developers' },
    { label: 'Tasks', to: '/tasks' },
    { label: 'SLA', to: '/sla-projects' },
  ],
}

function getWorkspaceTitle(roles) {
  if (roles.includes('manager')) {
    return 'Manage delivery, staffing, and project health'
  }

  if (roles.includes('chef_de_projet')) {
    return 'Coordinate supervised delivery and team execution'
  }

  if (roles.includes('developer')) {
    return 'Track assigned work, projects, and delivery context'
  }

  return 'Organize delivery, people, and project visibility'
}

function AppLayout() {
  const {
    authenticated,
    initialized,
    keycloakReady,
    login,
    logout,
    profile,
  } = useAuth()
  const { actorIds, currentRole, roles } = useRoleAccess()
  const location = useLocation()

  const primaryRole = currentRole ? formatLabel(currentRole) : 'Guest'
  const roleLabels = roles.map(formatLabel)
  const isGuestLanding = !authenticated && location.pathname === '/'
  const securedMenuItems = authenticated
    ? [...roles]
        .flatMap((role) => ROLE_MENUS[role] ?? [])
        .filter(
          (item, index, items) =>
            items.findIndex((candidate) => candidate.to === item.to) === index,
        )
    : []
  const developerShortcut = authenticated && actorIds.developer
    ? { label: 'My developer card', to: `/developers/${actorIds.developer}` }
    : null

  const menuItems = [
    { label: 'Dashboard', to: '/', end: true },
    ...securedMenuItems,
    ...(developerShortcut ? [developerShortcut] : []),
    { label: 'Appearance', to: '/more' },
  ]

  if (isGuestLanding) {
    return (
      <div className="landing-shell">
        <div className="app-aurora app-aurora-one" />
        <div className="app-aurora app-aurora-two" />

        <header className="landing-topbar">
          <Link to="/" className="landing-brand">
            <span className="landing-brand-mark">PT</span>
            <div className="landing-brand-copy">
              <strong>{APP_NAME}</strong>
              <span>Project delivery workspace</span>
            </div>
          </Link>

          <nav className="landing-topnav" aria-label="Landing navigation">
            <a href="#capabilities" className="landing-toplink">Capabilities</a>
            <a href="#workflow" className="landing-toplink">Workflow</a>
            <a href="#workspace-zone" className="landing-toplink">Workspace</a>
          </nav>

          <div className="landing-topbar-actions">
            <span className="landing-session-pill">
              {!keycloakReady
                ? 'Keycloak config missing'
                : initialized
                  ? 'Ready to connect'
                  : 'Checking session...'}
            </span>
            <Button
              onClick={login}
              disabled={!keycloakReady || !initialized}
            >
              Entrer
            </Button>
          </div>
        </header>

        <main className="landing-main">
          <Outlet />
        </main>

        <footer className="landing-footer">
          <p>Connecte PT_FRONT a PT_BACK pour piloter projets, equipes, taches, SLA et fichiers dans un seul espace.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-aurora app-aurora-one" />
      <div className="app-aurora app-aurora-two" />

      <aside className="app-sidebar">
        <div className="app-brand-card">
          <p className="app-brand-kicker">Repository Workspace</p>
          <h2 className="app-brand-title">{APP_NAME}</h2>
          <p className="app-brand-copy">
            A cleaner command center for projects, tasks, team coordination, and delivery follow-up.
          </p>
        </div>

        <nav className="app-nav" aria-label="Primary">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `app-nav-item${isActive ? ' active' : ''}`
              }
            >
              <span className="app-nav-bullet" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-card">
          <span className="app-sidebar-label">Access</span>
          <strong className="app-sidebar-value">{primaryRole}</strong>
          {authenticated && roleLabels.length > 0 ? (
            <div className="app-role-list">
              {roleLabels.map((role) => (
                <span key={role} className="app-role-pill">
                  {role}
                </span>
              ))}
            </div>
          ) : null}
          <p className="app-sidebar-copy">
            {authenticated
              ? `${roles.length} active role${roles.length === 1 ? '' : 's'} detected from Keycloak and backend sync.`
              : 'Sign in to unlock project analytics, assignments, and protected operations.'}
          </p>

          {authenticated ? (
            <div className="app-sidebar-meta">
              <span>{profile.username}</span>
              <span>{profile.email}</span>
              {actorIds.developer ? <span>Developer ID #{actorIds.developer}</span> : null}
            </div>
          ) : (
            <Button
              onClick={login}
              disabled={!keycloakReady || !initialized}
            >
              Login
            </Button>
          )}
        </div>
      </aside>

      <div className="app-stage">
        <header className="app-header">
          <div className="app-header-copy">
            <p className="app-header-kicker">Operations workspace</p>
            <h1 className="app-header-title">{getWorkspaceTitle(roles)}</h1>
          </div>

          {authenticated ? (
            <div className="app-header-actions">
              <div className="app-user-panel">
                <div className="app-user-avatar" aria-hidden="true">
                  {String(profile.name ?? 'U').slice(0, 1).toUpperCase()}
                </div>
                <div className="app-user-copy">
                  <span className="app-user-greeting">Connected</span>
                  <strong className="app-user-name">{profile.name}</strong>
                  <span className="app-user-role">
                    {roleLabels.join(' / ') || 'No role'}
                  </span>
                </div>
              </div>

              <div className="app-header-links">
                <Link to="/more" className="header-link-chip">
                  Themes
                </Link>
                <Link to="/profile" className="header-link-chip">
                  Profile
                </Link>
                {actorIds.developer ? (
                  <Link
                    to={`/developers/${actorIds.developer}`}
                    className="header-link-chip"
                  >
                    My developer card
                  </Link>
                ) : null}
              </div>

              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="app-header-actions">
              <div className="app-login-state">
                <span className="app-login-label">
                  {!keycloakReady
                    ? 'Keycloak config missing'
                    : initialized
                      ? 'Not connected'
                      : 'Checking session...'}
                </span>
              </div>
              <Button
                onClick={login}
                disabled={!keycloakReady || !initialized}
              >
                Login
              </Button>
            </div>
          )}
        </header>

        <main className="app-main">
          <Outlet />
        </main>

        <footer className="app-footer">
          <p>Aligned with your existing backend routes, Keycloak session flow, and scoped project/task logic.</p>
        </footer>
      </div>
    </div>
  )
}

export default AppLayout

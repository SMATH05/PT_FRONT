import { NavLink, Outlet } from 'react-router-dom'
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

function AppLayout() {
  const {
    authenticated,
    initialized,
    keycloakReady,
    login,
    logout,
    profile,
  } = useAuth()
  const { currentRole, roles } = useRoleAccess()

  const primaryRole = currentRole ? formatLabel(currentRole) : 'Guest'
  const securedMenuItems = authenticated
    ? [...roles]
        .flatMap((role) => ROLE_MENUS[role] ?? [])
        .filter(
          (item, index, items) =>
            items.findIndex((candidate) => candidate.to === item.to) === index,
        )
    : []

  const menuItems = [
    { label: 'Dashboard', to: '/', end: true },
    ...securedMenuItems,
    { label: 'More', to: '/more' },
  ]

  return (
    <div className="app-shell">
      <div className="app-aurora app-aurora-one" />
      <div className="app-aurora app-aurora-two" />

      <aside className="app-sidebar">
        <div className="app-brand-card">
          <p className="app-brand-kicker">Project Command</p>
          <h2 className="app-brand-title">{APP_NAME}</h2>
          <p className="app-brand-copy">
            A unified workspace for projects, tasks, people, and SLA operations.
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
          <span className="app-sidebar-label">Access tier</span>
          <strong className="app-sidebar-value">{primaryRole}</strong>
          <p className="app-sidebar-copy">
            {authenticated
              ? `${roles.length} active role${roles.length === 1 ? '' : 's'} mapped from your backend access.`
              : 'Sign in to unlock project analytics, assignments, and protected operations.'}
          </p>

          {authenticated ? (
            <div className="app-sidebar-meta">
              <span>{profile.username}</span>
              <span>{profile.email}</span>
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
            <p className="app-header-kicker">Operations dashboard</p>
            <h1 className="app-header-title">Design-led workspace for delivery teams</h1>
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
                    {roles.map(formatLabel).join(' / ') || 'No role'}
                  </span>
                </div>
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
          <p>Aligned with your existing backend routes, auth flow, and task management logic.</p>
        </footer>
      </div>
    </div>
  )
}

export default AppLayout

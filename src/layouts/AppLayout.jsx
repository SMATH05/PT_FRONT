import { APP_NAME } from '../constants/appConstants.js'
import { useAuth } from '../auth/useAuth.js'
import Button from '../components/ui/Button.jsx'
import { NavLink, Outlet } from 'react-router-dom'

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
  const menuItems = [
    { label: 'Accueil', to: '/', end: true },
    ...[...(profile.roles ?? [])]
      .flatMap((role) => ROLE_MENUS[role] ?? [])
      .filter(
        (item, index, items) =>
          items.findIndex((candidate) => candidate.to === item.to) === index,
      ),
    { label: 'More', to: '/more' },
  ]

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <p className="app-brand-kicker">Frontend Structure</p>
          <h2 className="app-brand-title">{APP_NAME}</h2>
        </div>

        {authenticated ? (
          <div className="app-header-actions">
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
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="app-user-panel">
              <div className="app-user-copy">
                <span className="app-user-greeting">Connected</span>
                <strong className="app-user-name">{profile.name}</strong>
                <span className="app-user-role">
                  {(profile.roles ?? []).join(', ') || 'no role'}
                </span>
              </div>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
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
        <p>Application shell ready for pages, routes, and protected content.</p>
      </footer>
    </div>
  )
}

export default AppLayout

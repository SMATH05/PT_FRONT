import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../constants/appConstants.js'
import { useAuth } from '../auth/useAuth.js'
import { useRoleAccess } from '../auth/useRoleAccess.js'
import Button from '../components/ui/Button.jsx'
import FloatingAssistant from '../components/ui/FloatingAssistant.jsx'
import CommandPalette from '../components/ui/CommandPalette.jsx'
import '../components/ui/CommandPalette.css'
import '../components/ui/HeaderSearch.css'
import { formatLabel } from '../utils/formatters.js'
import { 
  Home, 
  Layout, 
  Users, 
  UserCheck, 
  Briefcase, 
  CheckSquare, 
  ShieldCheck, 
  Settings,
  Bell,
  LogOut,
  User,
  Search,
  Command,
  Moon,
  Sun
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../theme/useTheme.js'

const ROLE_MENUS = {
  manager: [
    { label: 'Projects', to: '/projects', icon: Briefcase },
    { label: 'Managers', to: '/managers', icon: ShieldCheck },
    { label: 'Chefs', to: '/chefs', icon: UserCheck },
    { label: 'Developers', to: '/developers', icon: Users },
    { label: 'Tasks', to: '/tasks', icon: CheckSquare },
    { label: 'SLA', to: '/sla-projects', icon: ShieldCheck },
  ],
  developer: [
    { label: 'Projects', to: '/projects', icon: Briefcase },
    { label: 'Tasks', to: '/tasks', icon: CheckSquare },
    { label: 'Profile', to: '/profile', icon: User },
  ],
  chef_de_projet: [
    { label: 'Projects', to: '/projects', icon: Briefcase },
    { label: 'Chefs', to: '/chefs', icon: UserCheck },
    { label: 'Developers', to: '/developers', icon: Users },
    { label: 'Tasks', to: '/tasks', icon: CheckSquare },
    { label: 'SLA', to: '/sla-projects', icon: ShieldCheck },
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
  const navigate = useNavigate()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [profileTooltipOpen, setProfileTooltipOpen] = useState(false)
  const tooltipHideTimer = React.useRef(null)
  const { appearance, setTheme } = useTheme()

  const showTooltip = () => {
    clearTimeout(tooltipHideTimer.current)
    setProfileTooltipOpen(true)
  }
  const hideTooltip = () => {
    tooltipHideTimer.current = setTimeout(() => setProfileTooltipOpen(false), 120)
  }

  const primaryRole = currentRole ? formatLabel(currentRole) : 'Guest'
  const roleLabels = roles.map(formatLabel)
  const isGuestLanding = !authenticated && location.pathname === '/'
  const isLoginPage = location.pathname === '/login'
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
    { label: 'Dashboard', to: '/', end: true, icon: Layout },
    ...securedMenuItems,
    ...(developerShortcut ? [{ ...developerShortcut, icon: User }] : []),
    { label: 'Appearance', to: '/more', icon: Settings },
  ]

  if (isLoginPage) {
    return <Outlet />
  }

  if (isGuestLanding) {
    return (
      <div className="landing-shell">
        <div className="app-aurora app-aurora-one" />
        <div className="app-aurora app-aurora-two" />

        <header className="landing-topbar">
          <Link to="/" className="landing-brand">
            <img src="/draco_logo_v2.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div className="landing-brand-copy">
              <strong>{APP_NAME}</strong>
              <span>Workspace & AI Assistant</span>
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
                ? 'System unavailable'
                : initialized
                  ? 'Service Ready'
                  : 'Starting session...'}
            </span>
            <Button
              onClick={() => navigate('/login')}
              disabled={!keycloakReady || !initialized}
            >
              Entrer
            </Button>

          </div>
        </header>

        <main className="landing-main">
          <Outlet />
        </main>


        <FloatingAssistant />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-aurora app-aurora-one" />
      <div className="app-aurora app-aurora-two" />

      <aside className="app-sidebar">
        <div className="app-brand-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <img src="/draco_logo_v2.png" alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
            <h2 className="app-brand-title" style={{ margin: 0, fontSize: '1.8rem' }}>{APP_NAME}</h2>
          </div>
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
              {item.icon && <item.icon size={18} strokeWidth={2} className="app-nav-icon" />}
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
              ? `${roles.length} active role${roles.length === 1 ? '' : 's'} detected from workspace sync.`
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

          <div className="app-header-shortcuts">
            <button 
              className="header-search-trigger"
              onClick={() => setIsCommandOpen(true)}
              title="Open Command Palette (Ctrl+K)"
            >
              <Search size={18} />
              <span>Search or Jump to...</span>
              <kbd>Ctrl K</kbd>
            </button>
          </div>

          {authenticated ? (
            <div className="app-header-actions">
              <div className="app-header-links">
                <button
                  className="header-icon-btn"
                  onClick={() => setTheme(appearance.theme === 'noir' ? 'cloud' : 'noir')}
                  title="Toggle Theme"
                >
                  {appearance.theme === 'noir' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link to="/more" className="header-icon-btn" title="Appearance Settings">
                  <Settings size={18} />
                </Link>
                <Link to="/notifications" className="header-icon-btn" title="Announcements">
                  <Bell size={18} />
                </Link>
                <button onClick={logout} className="header-icon-btn text-danger" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>

              <div
                className="app-user-panel-wrapper"
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
              >
                <Link to="/profile" className="app-user-panel">
                  <div className="app-user-avatar" aria-hidden="true">
                    {String(profile.name ?? 'U').slice(0, 1).toUpperCase()}
                  </div>
                </Link>
                <Link
                  to="/profile"
                  className={`app-user-tooltip${profileTooltipOpen ? ' app-user-tooltip--visible' : ''}`}
                  onMouseEnter={showTooltip}
                  onMouseLeave={hideTooltip}
                >
                  <span className="app-user-tooltip-name">{profile.name}</span>
                  <span className="app-user-tooltip-role">{roleLabels.join(' / ') || 'No role'}</span>
                  <span className="app-user-tooltip-hint">Voir le profil →</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="app-header-actions">
              <div className="app-login-state">
                <span className="app-login-label">
                  {!keycloakReady
                    ? 'System unavailable'
                    : initialized
                      ? 'Guest Mode'
                      : 'Verifying session...'}
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
          <p>Aligned with your existing backend routes, DRACO secure auth flow, and scoped project/task logic.</p>
        </footer>
      </div>
      <FloatingAssistant />
      <CommandPalette isOpen={isCommandOpen} onClose={setIsCommandOpen} />
    </div>
  )
}

export default AppLayout

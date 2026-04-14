import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

function ProtectedRoute() {
  const { authenticated, initialized, keycloakReady } = useAuth()
  const location = useLocation()

  if (!keycloakReady) {
    return (
      <div className="route-feedback">
        <p>Keycloak configuration is missing.</p>
      </div>
    )
  }

  if (!initialized) {
    return (
      <div className="route-feedback">
        <p>Checking your session...</p>
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute

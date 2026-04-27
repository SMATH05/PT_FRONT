import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useRoleAccess } from '../auth/useRoleAccess.js'
import { hasAnyRole } from '../auth/roles.js'

function RequireRole({ allowedRoles = [] }) {
  const { roles } = useRoleAccess()
  const location = useLocation()

  if (!hasAnyRole(roles, allowedRoles)) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default RequireRole

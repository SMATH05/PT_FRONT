export const APP_ROLES = {
  MANAGER: 'manager',
  DEVELOPER: 'developer',
  CHEF_DE_PROJET: 'chef_de_projet',
}

export const APP_ROLE_VALUES = Object.values(APP_ROLES)

export function normalizeRole(role) {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

export function hasRole(roles, role) {
  const normalizedRole = normalizeRole(role)
  return (roles ?? []).map(normalizeRole).includes(normalizedRole)
}

export function hasAnyRole(roles, allowedRoles) {
  return (allowedRoles ?? []).some((role) => hasRole(roles, role))
}

export function filterAppRoles(roles) {
  return [...new Set(
    (roles ?? [])
      .map(normalizeRole)
      .filter((role) => APP_ROLE_VALUES.includes(role)),
  )]
}

export function getPrimaryAppRole(roles) {
  if (hasRole(roles, APP_ROLES.MANAGER)) {
    return APP_ROLES.MANAGER
  }

  if (hasRole(roles, APP_ROLES.CHEF_DE_PROJET)) {
    return APP_ROLES.CHEF_DE_PROJET
  }

  if (hasRole(roles, APP_ROLES.DEVELOPER)) {
    return APP_ROLES.DEVELOPER
  }

  return ''
}

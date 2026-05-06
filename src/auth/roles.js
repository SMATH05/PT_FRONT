export const APP_ROLES = {
  MANAGER: 'manager',
  DEVELOPER: 'developer',
  CHEF_DE_PROJET: 'chef_de_projet',
}

export const APP_ROLE_VALUES = Object.values(APP_ROLES)

const ROLE_ALIASES = {
  chef: APP_ROLES.CHEF_DE_PROJET,
  chef_de_projets: APP_ROLES.CHEF_DE_PROJET,
  chef_projet: APP_ROLES.CHEF_DE_PROJET,
  chefprojet: APP_ROLES.CHEF_DE_PROJET,
  dev: APP_ROLES.DEVELOPER,
  developper: APP_ROLES.DEVELOPER,
  developpeur: APP_ROLES.DEVELOPER,
  developer_role: APP_ROLES.DEVELOPER,
  devloper: APP_ROLES.DEVELOPER,
  project_manager: APP_ROLES.MANAGER,
}

export function normalizeRole(role) {
  const normalizedRole = String(role ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_')

  return ROLE_ALIASES[normalizedRole] ?? normalizedRole
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

export function inferRolesFromActorIds(actorIds) {
  const inferredRoles = []

  if (actorIds?.manager) {
    inferredRoles.push(APP_ROLES.MANAGER)
  }

  if (actorIds?.chef_de_projet) {
    inferredRoles.push(APP_ROLES.CHEF_DE_PROJET)
  }

  if (actorIds?.developer) {
    inferredRoles.push(APP_ROLES.DEVELOPER)
  }

  return inferredRoles
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

import { useMemo } from 'react'
import { useAuth } from './useAuth.js'
import { APP_ROLES, getPrimaryAppRole, hasAnyRole, hasRole } from './roles.js'

export function useRoleAccess() {
  const { profile } = useAuth()

  return useMemo(() => {
    const roles = profile.roles ?? []
    const actorIds = profile.actorIds ?? {}
    const actorResolutionReady = Object.values(actorIds).some((value) => value !== null)
    const isManager =
      hasRole(roles, APP_ROLES.MANAGER) &&
      (!actorResolutionReady || actorIds.manager !== null)
    const isDeveloper =
      hasRole(roles, APP_ROLES.DEVELOPER) &&
      (!actorResolutionReady || actorIds.developer !== null)
    const isChef =
      hasRole(roles, APP_ROLES.CHEF_DE_PROJET) &&
      (!actorResolutionReady || actorIds.chef_de_projet !== null)
    const availableRoles = [
      isManager ? APP_ROLES.MANAGER : '',
      isChef ? APP_ROLES.CHEF_DE_PROJET : '',
      isDeveloper ? APP_ROLES.DEVELOPER : '',
    ].filter(Boolean)

    return {
      actorIds,
      currentRole: getPrimaryAppRole(availableRoles),
      isManager,
      isDeveloper,
      isChef,
      roles: availableRoles,
      canViewProjects: hasAnyRole(availableRoles, [APP_ROLES.MANAGER, APP_ROLES.CHEF_DE_PROJET, APP_ROLES.DEVELOPER]),
      canViewTasks: hasAnyRole(availableRoles, [APP_ROLES.MANAGER, APP_ROLES.CHEF_DE_PROJET, APP_ROLES.DEVELOPER]),
      canViewPeople: hasAnyRole(availableRoles, [APP_ROLES.MANAGER, APP_ROLES.CHEF_DE_PROJET]),
      canViewSla: hasAnyRole(availableRoles, [APP_ROLES.MANAGER, APP_ROLES.CHEF_DE_PROJET]),
      canManageProjects: isManager,
      canManagePeople: isManager,
      canManageTasks: isManager,
      canManageSla: isManager,
    }
  }, [profile.actorIds, profile.roles])
}

import { useEffect, useMemo, useState } from 'react'
import { setAxiosClientToken } from '../api/axiosClient.js'
import { checkAuth } from '../services/authService.js'
import { AuthContext } from './AuthContext.js'
import {
  getKeycloakClient,
  hasKeycloakConfig,
  initKeycloak,
} from './keycloak.js'
import { filterAppRoles, normalizeRole } from './roles.js'

function extractRoles(tokenParsed) {
  const realmRoles = tokenParsed?.realm_access?.roles ?? []
  const resourceRoles = Object.values(tokenParsed?.resource_access ?? {})
    .flatMap((resource) => resource?.roles ?? [])

  return [...new Set([...realmRoles, ...resourceRoles].map(normalizeRole).filter(Boolean))]
}

function normalizeActorIds(actorIds) {
  return {
    chef_de_projet: Number.isInteger(actorIds?.chef_de_projet)
      ? actorIds.chef_de_projet
      : null,
    developer: Number.isInteger(actorIds?.developer) ? actorIds.developer : null,
    manager: Number.isInteger(actorIds?.manager) ? actorIds.manager : null,
  }
}

function buildProfile(tokenParsed, user = null) {
  return {
    actorIds: normalizeActorIds(user?.actor_ids),
    email: user?.email ?? tokenParsed?.email ?? 'Unavailable',
    name:
      user?.name ??
      tokenParsed?.name ??
      user?.given_name ??
      tokenParsed?.given_name ??
      user?.username ??
      tokenParsed?.preferred_username ??
      'Unavailable',
    roles: filterAppRoles(user?.roles ?? extractRoles(tokenParsed)),
    username: user?.username ?? tokenParsed?.preferred_username ?? 'Unavailable',
  }
}

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(!hasKeycloakConfig)
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState(
    hasKeycloakConfig
      ? ''
      : 'Add your Keycloak URL, realm, and client ID in a .env file to enable authentication.',
  )
  const [token, setToken] = useState('')
  const [profile, setProfile] = useState(buildProfile())


  useEffect(() => {
    let active = true

    if (!hasKeycloakConfig) {
      return undefined
    }

    initKeycloak()
      .then(({ authenticated: isAuthenticated, client }) => {
        if (!active || !client) {
          return
        }
        setInitialized(true)
        setAuthenticated(isAuthenticated)
        setToken(client.token ?? '')
        setProfile(buildProfile(client.tokenParsed))

        client.onAuthSuccess = () => {
          setAuthenticated(true)
          setToken(client.token ?? '')
          setProfile(buildProfile(client.tokenParsed))
          setError('')
        }

        client.onAuthLogout = () => {
          setAuthenticated(false)
          setToken('')
          setProfile(buildProfile())
        }

        client.onAuthRefreshSuccess = () => {
          setToken(client.token ?? '')
          setProfile(buildProfile(client.tokenParsed))
        }

        client.onTokenExpired = async () => {
          try {
            await client.updateToken(30)
            setToken(client.token ?? '')
          } catch {
            setAuthenticated(false)
            setToken('')
            setError('Your session expired. Please sign in again.')
          }
        }
      })
      .catch((initError) => {
        if (!active) {
          return
        }

        setInitialized(true)
        setAuthenticated(false)
        setError(
          initError instanceof Error
            ? initError.message
            : 'Keycloak initialization failed.',
        )
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (token) {
      setAxiosClientToken(token)
      return
    }

    setAxiosClientToken('')
  }, [token])

  useEffect(() => {
    let active = true

    if (!authenticated || !token) {
      return undefined
    }

    async function syncBackendProfile() {
      try {
        const payload = await checkAuth()

        if (!active) {
          return
        }

        setProfile(buildProfile(getKeycloakClient()?.tokenParsed, payload?.user))
      } catch {
        if (!active) {
          return
        }

        setProfile((currentProfile) => ({
          ...buildProfile(getKeycloakClient()?.tokenParsed),
          actorIds: currentProfile.actorIds,
        }))
      }
    }

    syncBackendProfile()

    return () => {
      active = false
    }
  }, [authenticated, token])

  useEffect(() => {
    const client = getKeycloakClient()

    if (!client || !authenticated) {
      return undefined
    }

    const refreshTimer = window.setInterval(async () => {
      try {
        const refreshed = await client.updateToken(60)

        if (refreshed) {
          setToken(client.token ?? '')
          setProfile(buildProfile(client.tokenParsed))
        }
      } catch {
        setAuthenticated(false)
        setToken('')
        setError('Unable to refresh the session. Please sign in again.')
      }
    }, 30000)

    return () => window.clearInterval(refreshTimer)
  }, [authenticated])

  const value = useMemo(
    () => ({
      authenticated,
      error,
      initialized,
      keycloakReady: hasKeycloakConfig,
      login: () => getKeycloakClient()?.login(),
      logout: () =>
        getKeycloakClient()?.logout({
          redirectUri: window.location.origin,
        }),
      profile,
      token,
    }),
    [authenticated, error, initialized, profile, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

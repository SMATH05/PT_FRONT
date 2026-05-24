import { useEffect, useMemo, useState } from 'react'
import { setAxiosClientToken } from '../api/axiosClient.js'
import { checkAuth } from '../services/authService.js'
import { AuthContext } from './AuthContext.js'
import {
  getKeycloakClient,
  hasKeycloakConfig,
  initKeycloak,
} from './keycloak.js'
import { filterAppRoles, inferRolesFromActorIds, normalizeRole } from './roles.js'

function extractRoles(tokenParsed) {
  const realmRoles = tokenParsed?.realm_access?.roles ?? []
  const resourceRoles = Object.values(tokenParsed?.resource_access ?? {})
    .flatMap((resource) => resource?.roles ?? [])

  return [...new Set([...realmRoles, ...resourceRoles].map(normalizeRole).filter(Boolean))]
}

function normalizeActorId(value) {
  if (Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number.parseInt(value, 10)

    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue
    }
  }

  return null
}

function pickActorId(actorIds, keys) {
  for (const key of keys) {
    const actorId = normalizeActorId(actorIds?.[key])

    if (actorId !== null) {
      return actorId
    }
  }

  return null
}

function normalizeActorIds(actorIds) {
  return {
    chef_de_projet: pickActorId(actorIds, [
      'chef_de_projet',
      'chef_de_projet_id',
      'chefDeProjet',
      'chefDeProjetId',
      'chef',
    ]),
    developer: pickActorId(actorIds, [
      'developer',
      'developer_id',
      'developerId',
      'dev',
      'dev_id',
    ]),
    manager: pickActorId(actorIds, [
      'manager',
      'manager_id',
      'managerId',
    ]),
  }
}

function buildProfile(tokenParsed, user = null) {
  const actorIds = normalizeActorIds(user?.actor_ids ?? user?.actorIds ?? user)
  const tokenRoles = extractRoles(tokenParsed)
  const userRoles = Array.isArray(user?.roles) ? user.roles : []
  const fallbackRoles = user?.role ? [user.role] : []
  const inferredRoles = inferRolesFromActorIds(actorIds)

  return {
    actorIds,
    email: user?.email ?? tokenParsed?.email ?? 'Unavailable',
    name:
      user?.name ??
      tokenParsed?.name ??
      user?.given_name ??
      tokenParsed?.given_name ??
      user?.username ??
      tokenParsed?.preferred_username ??
      'Unavailable',
    roles: filterAppRoles([
      ...userRoles,
      ...fallbackRoles,
      ...tokenRoles,
      ...inferredRoles,
    ]),
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

    const savedToken = localStorage.getItem('draco_token');
    const savedRefreshToken = localStorage.getItem('draco_refresh_token');

    initKeycloak({ token: savedToken, refreshToken: savedRefreshToken })
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
          // Save tokens on success
          localStorage.setItem('draco_token', client.token ?? '');
          localStorage.setItem('draco_refresh_token', client.refreshToken ?? '');
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
      manualRegister: async (firstName, lastName, email, password, role) => {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, password, role }),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Erreur lors de la création du compte.')
        }
        return response.json()
      },
      manualLogin: async (username, password) => {
        const client = getKeycloakClient()
        if (!client) return

        const params = new URLSearchParams()
        params.append('grant_type', 'password')
        params.append('client_id', client.clientId)
        params.append('username', username)
        params.append('password', password)
        params.append('scope', 'openid')

        const response = await fetch(`/auth-proxy/realms/${client.realm}/protocol/openid-connect/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error_description || 'Identifiants invalides ou configuration Keycloak incorrecte.')
        }

        const data = await response.json()
        
        // Update client tokens manually to avoid "initialized once" error
        client.token = data.access_token
        client.refreshToken = data.refresh_token
        client.idToken = data.id_token
        
        // Persist for refresh
        localStorage.setItem('draco_token', data.access_token);
        localStorage.setItem('draco_refresh_token', data.refresh_token);

        // Some versions of keycloak-js use this to parse tokens
        if (typeof client.setToken === 'function') {
          client.setToken(data.access_token, data.refresh_token, data.id_token)
        }

        setAuthenticated(true)
        setToken(data.access_token)
        setProfile(buildProfile(client.tokenParsed))
      },
      logout: () => {
        localStorage.removeItem('draco_token')
        localStorage.removeItem('draco_refresh_token')
        getKeycloakClient()?.logout({
          redirectUri: window.location.origin,
        })
      },
      profile,
      token,
    }),
    [authenticated, error, initialized, profile, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

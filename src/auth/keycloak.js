import Keycloak from 'keycloak-js'

const keycloakConfig = {
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  url: import.meta.env.VITE_KEYCLOAK_URL,
}

export const hasKeycloakConfig = Object.values(keycloakConfig).every(Boolean)

let keycloakClient
let initPromise

export function getKeycloakClient() {
  if (!hasKeycloakConfig) {
    return null
  }

  if (!keycloakClient) {
    keycloakClient = new Keycloak(keycloakConfig)
  }

  return keycloakClient
}

export async function initKeycloak() {
  const client = getKeycloakClient()

  if (!client) {
    return { authenticated: false, client: null }
  }

  if (!initPromise) {
    initPromise = client
      .init({
        checkLoginIframe: false,
        onLoad: 'check-sso',
        pkceMethod: 'S256',
      })
      .then((authenticated) => ({ authenticated, client }))
  }

  return initPromise
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  keycloakClientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || '',
  keycloakRealm: import.meta.env.VITE_KEYCLOAK_REALM || '',
  keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL || '',
}

import axios from 'axios'
import { env } from '../config/env.js'
import { getKeycloakClient } from '../auth/keycloak.js'

let currentToken = ''

const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

axiosClient.interceptors.request.use((config) => {
  const nextConfig = { ...config }
  nextConfig.headers = nextConfig.headers ?? {}
  const keycloakToken = getKeycloakClient()?.token
  const token = keycloakToken || currentToken

  if (token) {
    nextConfig.headers.Authorization = `Bearer ${token}`
  } else {
    delete nextConfig.headers.Authorization
  }

  return nextConfig
})

export function setAxiosClientToken(token) {
  currentToken = token ?? ''

  if (token) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete axiosClient.defaults.headers.common.Authorization
}

export default axiosClient

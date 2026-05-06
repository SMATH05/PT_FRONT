import axios from 'axios'
import { env } from '../config/env.js'
import { getKeycloakClient } from '../auth/keycloak.js'

let currentToken = ''
const LOCAL_API_BASE_URLS = [
  'http://127.0.0.1:8000/api',
  'http://localhost:8000/api',
  'http://127.0.0.1:8010/api',
  'http://localhost:8010/api',
]
const FALLBACK_API_BASE_URL = 'http://127.0.0.1:8010/api'

function normalizeBaseUrl(value) {
  return String(value ?? '')
    .trim()
    .replace(/\/+$/, '')
}

function getApiBaseUrlCandidates() {
  const browserFallback8000 =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:8000/api`
      : ''

  const browserFallback8010 =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:8010/api`
      : ''

  return [...new Set(
    [
      env.apiBaseUrl,
      ...LOCAL_API_BASE_URLS,
      FALLBACK_API_BASE_URL,
      browserFallback8000,
      browserFallback8010,
    ]
      .map(normalizeBaseUrl)
      .filter(Boolean),
  )]
}

function getRemainingBaseUrls(currentBaseUrl, attemptedBaseUrls = []) {
  const attempted = new Set(
    [currentBaseUrl, ...attemptedBaseUrls]
      .map(normalizeBaseUrl)
      .filter(Boolean),
  )

  return getApiBaseUrlCandidates().filter((candidate) => !attempted.has(candidate))
}

function isHtmlPayload(payload) {
  if (typeof payload !== 'string') {
    return false
  }

  const normalizedPayload = payload.trim().toLowerCase()
  return (
    normalizedPayload.startsWith('<!doctype html') ||
    normalizedPayload.startsWith('<html')
  )
}

function shouldRetryWithAnotherBaseUrl(error) {
  if (!error?.config) {
    return false
  }

  if (!error.response) {
    return true
  }

  return isHtmlPayload(error.response.data)
}

let activeBaseUrl = getApiBaseUrlCandidates()[0] ?? ''

const axiosClient = axios.create({
  baseURL: activeBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

axiosClient.interceptors.request.use(async (config) => {
  const nextConfig = { ...config }
  nextConfig.baseURL = normalizeBaseUrl(nextConfig.baseURL || activeBaseUrl)
  nextConfig.headers = nextConfig.headers ?? {}
  nextConfig.headers.Accept = nextConfig.headers.Accept ?? 'application/json'

  const keycloakClient = getKeycloakClient()

  if (keycloakClient?.authenticated) {
    try {
      await keycloakClient.updateToken(30)
    } catch {
      // Continue and let the API return an auth error if refresh fails.
    }
  }

  const keycloakToken = keycloakClient?.token
  const token = keycloakToken || currentToken

  if (token) {
    nextConfig.headers.Authorization = `Bearer ${token}`
  } else {
    delete nextConfig.headers.Authorization
  }

  return nextConfig
})

axiosClient.interceptors.response.use(
  (response) => {
    activeBaseUrl = normalizeBaseUrl(response.config?.baseURL || activeBaseUrl)
    return response
  },
  async (error) => {
    if (!shouldRetryWithAnotherBaseUrl(error)) {
      return Promise.reject(error)
    }

    const attemptedBaseUrls = Array.isArray(error.config?._baseUrlAttempts)
      ? error.config._baseUrlAttempts
      : []
    const currentBaseUrl = normalizeBaseUrl(error.config?.baseURL || activeBaseUrl)
    const baseUrlsTried = [...new Set([...attemptedBaseUrls, currentBaseUrl].filter(Boolean))]
    const nextBaseUrl = getRemainingBaseUrls(currentBaseUrl, attemptedBaseUrls)[0]

    if (!nextBaseUrl) {
      error.apiBaseUrlsTried = baseUrlsTried
      return Promise.reject(error)
    }

    activeBaseUrl = nextBaseUrl

    return axiosClient({
      ...error.config,
      _baseUrlAttempts: baseUrlsTried,
      baseURL: nextBaseUrl,
    })
  },
)

export function setAxiosClientToken(token) {
  currentToken = token ?? ''

  if (token) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete axiosClient.defaults.headers.common.Authorization
}

export default axiosClient

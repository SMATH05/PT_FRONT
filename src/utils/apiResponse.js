export function getCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

export function getEntity(payload) {
  if (payload && !Array.isArray(payload) && payload.data && !Array.isArray(payload.data)) {
    return payload.data
  }

  return payload ?? null
}

export function getCount(value) {
  if (Array.isArray(value)) {
    return value.length
  }

  if (typeof value === 'number') {
    return value
  }

  return 0
}

export function getText(value, fallback = 'Unavailable') {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return String(value)
}

export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const responseData = error?.response?.data
  const baseUrlsTried = Array.isArray(error?.apiBaseUrlsTried)
    ? error.apiBaseUrlsTried
    : error?.config?.baseURL
      ? [error.config.baseURL]
      : []

  if (!error?.response && error?.message) {
    const triedLabel = baseUrlsTried.length > 0
      ? ` Tried: ${baseUrlsTried.join(', ')}.`
      : ''

    return `Unable to reach the API.${triedLabel} Start PT_BACK and verify VITE_API_BASE_URL in .env. Common local ports are 8000 and 8010.`
  }

  if (typeof responseData === 'string' && responseData.trim()) {
    const normalizedResponse = responseData.trim().toLowerCase()

    if (
      normalizedResponse.startsWith('<!doctype html') ||
      normalizedResponse.startsWith('<html')
    ) {
      return 'The API returned an HTML page instead of JSON. Verify that PT_BACK is running on the API port configured in .env, usually http://127.0.0.1:8000/api or http://127.0.0.1:8010/api.'
    }

    return responseData
  }

  if (responseData?.message) {
    if (responseData?.error) {
      return `${responseData.message}: ${responseData.error}`
    }

    return responseData.message
  }

  const validationErrors = responseData?.errors

  if (validationErrors && typeof validationErrors === 'object') {
    const firstError = Object.values(validationErrors)
      .flat()
      .find((value) => typeof value === 'string' && value.trim())

    if (firstError) {
      return firstError
    }
  }

  if (error?.message) {
    return error.message
  }

  return fallback
}

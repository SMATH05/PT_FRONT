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

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (responseData?.message) {
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

  return fallback
}

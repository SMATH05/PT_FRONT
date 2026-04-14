import { useState } from 'react'

function useApi(callback) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function execute(...args) {
    try {
      setLoading(true)
      setError(null)
      return await callback(...args)
    } catch (apiError) {
      setError(apiError)
      throw apiError
    } finally {
      setLoading(false)
    }
  }

  return { error, execute, loading }
}

export default useApi

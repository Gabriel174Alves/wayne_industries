import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export function useQuery(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(url, {
        headers: options.token ? { Authorization: `Bearer ${options.token}` } : {}
      })
      setData(response.data)
      options?.onSuccess?.(response.data)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      setError(errorMsg)
      options?.onError?.(err)
    } finally {
      setLoading(false)
    }
  // only depend on url and token to avoid refetch loops when options object identity changes
  }, [url, options?.token])

  useEffect(() => {
    if (options?.enabled !== false) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refetch, options?.enabled])

  return { data, loading, error, refetch }
}

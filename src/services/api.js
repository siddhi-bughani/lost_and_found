import { useEffect, useState } from 'react'

/**
 * Base HTTP client.
 *
 * The backend is being developed separately by teammates. The base URL is
 * read from the VITE_API_BASE_URL environment variable. When it is not set,
 * the app uses mock data (see src/services/items.js).
 *
 * ENDPOINTS BELOW ARE PROVISIONAL and need confirmation from the backend team.
 * They are isolated in this file so they can be adjusted in one place.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const isApiConfigured = () => Boolean(API_BASE_URL)

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is not configured. Add it to your .env file. ' +
        'Falling back to mock data for UI demonstration.'
    )
  }

  const url = `${API_BASE_URL}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw new Error(`Request failed (${res.status}): ${message}`)
  }

  if (res.status === 204) return null
  return res.json()
}

/** GET helper */
export function get(path) {
  return request(path, { method: 'GET' })
}

/** POST helper */
export function post(path, body) {
  return request(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Upload an image file via multipart/form-data.
 * NOTE: endpoint path needs confirmation from the backend team.
 */
export function uploadImage(path, file) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.')
  }
  const formData = new FormData()
  formData.append('image', file)
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
  }).then((res) => {
    if (!res.ok) throw new Error(`Upload failed (${res.status})`)
    return res.json()
  })
}

/**
 * useApi hook — small wrapper to handle loading, error, and success states
 * for any async data fetch.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    Promise.resolve()
      .then(fetcher)
      .then((result) => {
        if (active) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}

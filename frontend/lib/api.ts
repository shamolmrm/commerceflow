/**
 * Axios instance configured with JWT auth, base URL, and request/response interceptors.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Read the access token from redux-persist storage (key: persist:auth)
function getStoredToken(): string | null {
  try {
    const stored = localStorage.getItem('persist:auth')
    if (!stored) return null
    const auth = JSON.parse(stored)
    const raw = auth?.access
    if (!raw) return null
    // redux-persist double-serializes primitive values
    const token = JSON.parse(raw)
    return typeof token === 'string' ? token : null
  } catch {
    return null
  }
}

function getStoredRefresh(): string | null {
  try {
    const stored = localStorage.getItem('persist:auth')
    if (!stored) return null
    const auth = JSON.parse(stored)
    const raw = auth?.refresh
    if (!raw) return null
    const token = JSON.parse(raw)
    return typeof token === 'string' ? token : null
  } catch {
    return null
  }
}

// Attach JWT access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = getStoredToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auto-refresh access token on 401 responses
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getStoredRefresh()
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        })

        const newAccess = data.access
        // Update only the access field in persist:auth, preserving other fields
        const stored = localStorage.getItem('persist:auth')
        const auth = stored ? JSON.parse(stored) : {}
        localStorage.setItem('persist:auth', JSON.stringify({ ...auth, access: JSON.stringify(newAccess) }))

        processQueue(null, newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('persist:auth')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

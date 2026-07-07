import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import {
  setCredentials, logout as logoutAction,
  selectCurrentUser, selectIsAuthenticated, selectIsAdmin
} from '@/store/authSlice'
import { clearCart } from '@/store/cartSlice'
import { clearWishlist } from '@/store/wishlistSlice'
import type { LoginInput, RegisterInput } from '@/lib/validators'

export function useAuth() {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)

  const login = useCallback(async (data: LoginInput) => {
    const response = await api.post('/users/login/', data)
    dispatch(setCredentials({
      user: response.data.user,
      access: response.data.access,
      refresh: response.data.refresh,
    }))
    return response.data
  }, [dispatch])

  const register = useCallback(async (data: RegisterInput) => {
    const response = await api.post('/users/register/', data)
    dispatch(setCredentials({
      user: response.data.user,
      access: response.data.access,
      refresh: response.data.refresh,
    }))
    return response.data
  }, [dispatch])

  const logout = useCallback(async () => {
    try {
      const stored = localStorage.getItem('persist:auth')
      if (stored) {
        const auth = JSON.parse(stored)
        const rawRefresh = auth?.refresh
        const refresh = rawRefresh ? JSON.parse(rawRefresh) : null
        if (refresh) {
          await api.post('/users/logout/', { refresh })
        }
      }
    } catch {}
    dispatch(logoutAction())
    dispatch(clearCart())
    dispatch(clearWishlist())
    router.push('/')
    toast.success('Logged out successfully')
  }, [dispatch, router])

  const requireAuth = useCallback((redirectTo = '/login') => {
    if (!isAuthenticated) {
      router.push(redirectTo)
      return false
    }
    return true
  }, [isAuthenticated, router])

  const requireAdmin = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return false
    }
    if (!isAdmin) {
      router.push('/')
      toast.error('Access denied')
      return false
    }
    return true
  }, [isAuthenticated, isAdmin, router])

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    requireAuth,
    requireAdmin,
  }
}

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types'

interface AuthState {
  user: User | null
  access: string | null
  refresh: string | null
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  access: null,
  refresh: null,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; access: string; refresh: string }>) {
      state.user = action.payload.user
      state.access = action.payload.access
      state.refresh = action.payload.refresh
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    updateTokens(state, action: PayloadAction<{ access: string; refresh?: string }>) {
      state.access = action.payload.access
      if (action.payload.refresh) state.refresh = action.payload.refresh
    },
    logout(state) {
      state.user = null
      state.access = null
      state.refresh = null
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, updateUser, updateTokens, logout, setLoading } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.access
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.user
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.role && ['superadmin', 'manager', 'staff'].includes(state.auth.user.role)

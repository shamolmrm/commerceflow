import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import authReducer from './authSlice'
import cartReducer from './cartSlice'
import wishlistReducer from './wishlistSlice'

// Custom storage — wraps localStorage directly so we never import
// redux-persist/lib/storage, which logs a warning when loaded server-side.
const storage = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return Promise.resolve(null)
    return Promise.resolve(window.localStorage.getItem(key))
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve()
    window.localStorage.setItem(key, value)
    return Promise.resolve()
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve()
    window.localStorage.removeItem(key)
    return Promise.resolve()
  },
}

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'access', 'refresh'],
}

const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['cart'],
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  wishlist: wishlistReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

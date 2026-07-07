'use client'

import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store } from '@/store'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,   // 5 min — don't refetch fresh data
            gcTime: 15 * 60 * 1000,      // 15 min — keep in cache after unmount
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  )

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: 'white' },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  )
}

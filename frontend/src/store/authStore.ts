import { create } from 'zustand'
import authAPI from '@/lib/api/auth.api'
import { User, UserRole } from '@/types/user.types'

// Helper function to set cookie
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  console.log(`Cookie set: ${name}=${value.substring(0, 20)}...`)
}

// Helper function to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string, role?: UserRole) => Promise<void>
  studentLogin: (email: string, pin: string) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => void
}

const useAuthStore = create<AuthState>((set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,
      error: null,

      // Teacher/Admin login
      login: async (email: string, password: string, role?: UserRole) => {
        set({ isLoading: true, error: null })

        try {
          console.log('[AuthStore] 📡 Attempting login API call...')
          console.log('[AuthStore] Email:', email)
          console.log('[AuthStore] Role:', role)

          const response = await authAPI.login({ email, password, role })

          console.log('[AuthStore] ✓ API response received')
          console.log('[AuthStore] Response:', {
            success: response.success,
            hasToken: !!response.access_token,
            tokenLength: response.access_token?.length,
            user: response.user
          })

          console.log('[AuthStore] 💾 Saving to localStorage...')
          // Save token to localStorage
          localStorage.setItem('access_token', response.access_token)
          localStorage.setItem('user', JSON.stringify(response.user))
          console.log('[AuthStore] ✓ Saved to localStorage')

          console.log('[AuthStore] 🍪 Setting cookies...')
          // Also save to cookies for middleware
          setCookie('access_token', response.access_token, 7)
          setCookie('user_role', response.user.role, 7)
          console.log('[AuthStore] ✓ Cookies set commands executed')

          // Verify cookies were set (client-side check)
          setTimeout(() => {
            const allCookies = document.cookie;
            console.log('[AuthStore] 🔍 Verification check:')
            console.log('[AuthStore] All cookies after set:', allCookies);
            console.log('[AuthStore] Expected user_role:', response.user.role);
            console.log('[AuthStore] Cookie includes user_role?', allCookies.includes('user_role'));
            console.log('[AuthStore] Cookie includes access_token?', allCookies.includes('access_token'));
          }, 10);

          console.log('[AuthStore] 📝 Updating auth state...')
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          console.log('[AuthStore] ✓ Auth state updated successfully')
        } catch (error: any) {
          console.error('[AuthStore] ❌ Login failed:', error.response?.data || error.message)
          console.error('[AuthStore] Full error:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Login failed. Please try again.',
          })
          throw error
        }
      },

      // Student PIN login
      studentLogin: async (email: string, pin: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authAPI.studentLogin({ email, pin })

          // Save token to localStorage
          localStorage.setItem('access_token', response.access_token)
          localStorage.setItem('user', JSON.stringify(response.session))

          // Also save to cookies for middleware
          setCookie('access_token', response.access_token, 7)
          setCookie('user_role', response.session.role, 7)

          set({
            user: response.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Invalid email or PIN. Please try again.',
          })
          throw error
        }
      },

      // Logout
      logout: () => {
        authAPI.logout()

        // Delete cookies
        deleteCookie('access_token')
        deleteCookie('user_role')

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Check if user is authenticated (on app load)
      checkAuth: () => {
        const token = localStorage.getItem('access_token')
        const userStr = localStorage.getItem('user')

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            set({
              user,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
              error: null,
            })
          } catch {
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
              error: null,
            })
          }
        } else {
          // No token found, mark as initialized
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
            error: null,
          })
        }
      },
    })
)

export default useAuthStore
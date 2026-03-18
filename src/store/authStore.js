import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
  initialize: async () => {
    console.log('Initializing Auth Store...')
    
    try {
      // Add a timeout to prevent infinite loading if network is down
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase session timeout')), 5000)
      )

      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
      console.log('Auth session retrieved:', session ? 'User logged in' : 'No user')
      set({ user: session?.user ?? null, loading: false })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ user: null, loading: false }) // Stop loading even if it fails
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event)
      set({ user: session?.user ?? null, loading: false })
    })

    return () => subscription.unsubscribe()
  }
}))

export default useAuthStore

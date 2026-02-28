import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        setProfile(null)
        return null
      }

      setProfile(data)
      return data
    } catch (err) {
      console.error('Unexpected error loading profile:', err)
      setProfile(null)
      return null
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await loadProfile(currentUser.id)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await loadProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setLoading(false)
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(email, password, { username, displayName, city } = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        return { error }
      }

      const newUser = data.user
      if (newUser) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUser.id,
            username: username || null,
            display_name: displayName || null,
            avatar_url: null,
            bio: null,
            city: city || null,
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          return { data, error: profileError }
        }

        await loadProfile(newUser.id)
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error during sign up:', err)
      return { error: { message: err.message } }
    }
  }

  async function signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        await loadProfile(data.user.id)
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error during sign in:', err)
      return { error: { message: err.message } }
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        return { error }
      }
      setUser(null)
      setProfile(null)
      return { error: null }
    } catch (err) {
      console.error('Unexpected error during sign out:', err)
      return { error: { message: err.message } }
    }
  }

  async function updateProfile(updates) {
    if (!user) {
      return { error: { message: 'Not authenticated' } }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return { error }
      }

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error updating profile:', err)
      return { error: { message: err.message } }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loadProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

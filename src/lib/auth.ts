import { supabase } from './supabase'

export const signInWithGoogle = async () => {
  // 현재 환경에 따른 리다이렉트 URL 결정
  const redirectTo = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo
    }
  })
  
  if (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
  
  return data
}

export const signInWithGitHub = async () => {
  // 현재 환경에 따른 리다이렉트 URL 결정
  const redirectTo = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo
    }
  })
  
  if (error) {
    console.error('Error signing in with GitHub:', error)
    throw error
  }
  
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
} 
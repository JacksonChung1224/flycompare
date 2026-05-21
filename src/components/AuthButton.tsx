'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogIn, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        router.refresh()
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (loading) {
    return <div className="w-24 h-9 animate-pulse bg-muted rounded-md" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-7 h-7 rounded-full border border-border" 
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User className="w-4 h-4" />
            </div>
          )}
          <span className="text-sm font-medium hidden sm:inline-block">
            {user.user_metadata?.full_name || '使用者'}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 text-xs text-muted-foreground hover:text-foreground">
          <LogOut className="w-3.5 h-3.5 mr-1" />
          登出
        </Button>
      </div>
    )
  }

  return (
    <Button variant="default" size="sm" onClick={handleSignIn} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-8">
      <LogIn className="w-3.5 h-3.5 mr-1.5" />
      Google 登入
    </Button>
  )
}

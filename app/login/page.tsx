'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-navy/80 rounded-xl p-8 shadow-lg border border-teal/30"
      >
        <h1 className="text-2xl font-bold text-white mb-6">Welcome Back</h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 bg-red-950 p-2 rounded">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-3 px-4 py-2 rounded bg-navy/60 text-white border border-teal/30 focus:outline-none focus:border-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 px-4 py-2 rounded bg-navy/60 text-white border border-teal/30 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal hover:bg-teal/80 text-white py-2 rounded font-medium transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-neutral/70 text-sm mt-4 text-center">
          Don't have an account?{' '}
          <a href="/register" className="text-teal hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  )
}
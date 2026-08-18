'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [university, setUniversity] = useState('')
  const [degreeLevel, setDegreeLevel] = useState('MS')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        university,
        degree_level: degreeLevel,
        field_of_study: fieldOfStudy,
        role: 'student',
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-navy/80 rounded-xl p-8 shadow-lg border border-teal/30"
      >
        <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 bg-red-950 p-2 rounded">
            {error}
          </p>
        )}

        <input
  type="text"
  placeholder="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  className="w-full mb-3 px-4 py-2 rounded bg-navy/60 text-white border border-teal/30 focus:outline-none"
/>

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
          minLength={6}
          className="w-full mb-3 px-4 py-2 rounded bg-navy/60 text-white border border-teal/30 focus:outline-none focus:border-indigo-500"
        />

        <input
          type="text"
          placeholder="University"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          required
          className="w-full mb-3 px-4 py-2 rounded bg-navy/60 text-white border border-teal/30 focus:outline-none focus:border-indigo-500"
        />

        <select
          value={degreeLevel}
          onChange={(e) => setDegreeLevel(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded bg-navy/60 text-white border border-teal/30 focus:outline-none focus:border-indigo-500"
        >
          <option value="MS">MS</option>
          <option value="MPhil">MPhil</option>
          <option value="PhD">PhD</option>
        </select>

        <input
          type="text"
          placeholder="Field of Study"
          value={fieldOfStudy}
          onChange={(e) => setFieldOfStudy(e.target.value)}
          required
          className="w-full mb-6 px-4 py-2 rounded bg-navy/60 text-white border border-teal/30 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal hover:bg-teal/80 text-white py-2 rounded font-medium transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-neutral/70 text-sm mt-4 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-teal hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  )
}
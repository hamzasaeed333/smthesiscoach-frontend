'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface UserProfile {
  email: string
  university: string
  degree_level: string
  field_of_study: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('email, university, degree_level, field_of_study')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error(error)
      } else {
        setProfile(data)
      }

      setLoading(false)
    }

    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {profile?.field_of_study} Student
            </h1>
            <p className="text-gray-400 text-sm mt-1">{profile?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Your Profile</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">University</p>
              <p className="text-white">{profile?.university}</p>
            </div>
            <div>
              <p className="text-gray-500">Degree Level</p>
              <p className="text-white">{profile?.degree_level}</p>
            </div>
            <div>
              <p className="text-gray-500">Field of Study</p>
              <p className="text-white">{profile?.field_of_study}</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            Upload Your Thesis Draft
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Upload a chapter or full draft (Word/PDF) to get format compliance
            and writing feedback reports.
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded font-medium transition">
            + Upload Document
          </button>
        </div>

        {/* Chapter Checklist Placeholder */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Chapter Progress
          </h2>
          <p className="text-gray-500 text-sm">
            No chapters uploaded yet. Upload your first document to start
            tracking progress.
          </p>
        </div>
      </div>
    </div>
  )
}
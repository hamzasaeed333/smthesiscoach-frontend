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

interface Document {
  id: string
  file_name: string
  file_path: string
  file_type: string
  created_at: string
}

interface Report {
  word_count: number
  estimated_pages: number
  found_headings: string[]
  missing_headings: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [userId, setUserId] = useState('')

  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [analyzeError, setAnalyzeError] = useState('')
  const [reports, setReports] = useState<Record<string, Report>>({})

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data: profileData } = await supabase
        .from('users')
        .select('email, university, degree_level, field_of_study')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      const { data: docsData } = await supabase
        .from('documents')
        .select('id, file_name, file_path, file_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setDocuments(docsData || [])
      setLoading(false)
    }

    fetchUser()
  }, [router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    setUploading(true)

    const filePath = `${userId}/${Date.now()}_${file.name}`

    const { error: storageError } = await supabase.storage
      .from('thesis-drafts')
      .upload(filePath, file)

    if (storageError) {
      setUploadError(storageError.message)
      setUploading(false)
      return
    }

    const { data: newDoc, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
      })
      .select()
      .single()

    if (dbError) {
      setUploadError(dbError.message)
      setUploading(false)
      return
    }

    setDocuments([newDoc, ...documents])
    setUploading(false)
  }

  const handleAnalyze = async (documentId: string) => {
    setAnalyzeError('')
    setAnalyzingId(documentId)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAnalyzeError(data.error || 'Analysis failed')
        setAnalyzingId(null)
        return
      }

      setReports((prev) => ({ ...prev, [documentId]: data.report }))
    } catch (err: any) {
      setAnalyzeError(err.message || 'Something went wrong')
    }

    setAnalyzingId(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {profile?.field_of_study} Student
            </h1>
            <p className="text-neutral/70 text-sm mt-1">{profile?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-navy/60 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-navy/80 border border-teal/30 rounded-xl p-6 mb-6">
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
        <div className="bg-navy/80 border border-teal/30 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            Upload Your Thesis Draft
          </h2>
          <p className="text-neutral/70 text-sm mb-4">
            Upload a chapter or full draft (Word/PDF) to get format compliance
            and writing feedback reports.
          </p>

          {uploadError && (
            <p className="text-red-400 text-sm mb-3 bg-red-950 p-2 rounded">
              {uploadError}
            </p>
          )}

          <label className="inline-block bg-teal hover:bg-teal/80 text-white px-5 py-2 rounded font-medium transition cursor-pointer">
            {uploading ? 'Uploading...' : '+ Upload Document'}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Documents List */}
        <div className="bg-navy/80 border border-teal/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Your Documents
          </h2>

          {analyzeError && (
            <p className="text-red-400 text-sm mb-3 bg-red-950 p-2 rounded">
              {analyzeError}
            </p>
          )}

          {documents.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No chapters uploaded yet. Upload your first document to start
              tracking progress.
            </p>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => {
                const report = reports[doc.id]
                return (
                  <li
                    key={doc.id}
                    className="bg-navy/60 rounded px-4 py-3 text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white">{doc.file_name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleAnalyze(doc.id)}
                          disabled={analyzingId === doc.id}
                          className="bg-teal hover:bg-teal/80 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50"
                        >
                          {analyzingId === doc.id ? 'Analyzing...' : 'Analyze'}
                        </button>
                      </div>
                    </div>

                    {report && (
                      <div className="mt-3 bg-navy/80 rounded p-3 text-xs space-y-2">
                        <div className="flex gap-6">
                          <p className="text-neutral/70">
                            Word count:{' '}
                            <span className="text-white">{report.word_count}</span>
                          </p>
                          <p className="text-neutral/70">
                            Estimated pages:{' '}
                            <span className="text-white">
                              {report.estimated_pages}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral/70 mb-1">
                            Found sections:{' '}
                            <span className="text-green-400">
                              {report.found_headings.length > 0
                                ? report.found_headings.join(', ')
                                : 'None'}
                            </span>
                          </p>
                          <p className="text-neutral/70">
                            Missing sections:{' '}
                            <span className="text-red-400">
                              {report.missing_headings.length > 0
                                ? report.missing_headings.join(', ')
                                : 'None'}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
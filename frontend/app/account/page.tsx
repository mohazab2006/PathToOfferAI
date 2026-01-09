'use client'

import { useEffect, useState } from 'react'
import { demoApi, jobsApi, resumeApi, settingsApi } from '@/lib/api'
import { Loader, Trash2, FlaskConical, RefreshCcw } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { useConfirm } from '@/components/ui/ConfirmProvider'

export default function AccountPage() {
  const { pushToast } = useToast()
  const { confirm } = useConfirm()
  const [profile, setProfile] = useState({
    name: '',
    city_country: '',
    email: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [actionBusy, setActionBusy] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await settingsApi.getProfile()
      if (response.data) {
        setProfile(response.data)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await settingsApi.updateProfile(profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
      pushToast({ type: 'error', title: 'Save failed', message: 'Could not save your profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Account</h1>
          <p className="text-gray-600 mt-1">Manage your profile information</p>
        </div>

        {/* Data & Demo Controls */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-semibold">Data & Demo</h2>
            {actionBusy && (
              <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Loader className="w-4 h-4 animate-spin" />
                Working…
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Use these tools if demo data gets weird, or you want to start fresh.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <button
              className="btn-primary inline-flex items-center justify-center gap-2"
              disabled={Boolean(actionBusy)}
              onClick={async () => {
                setActionBusy('demo_load')
                try {
                  await demoApi.load()
                  pushToast({ type: 'success', title: 'Demo loaded', message: 'Demo job + demo resume are ready.' })
                } catch (e: any) {
                  pushToast({ type: 'error', title: 'Demo failed', message: e?.response?.data?.detail || 'Failed to load demo.' })
                } finally {
                  setActionBusy(null)
                }
              }}
            >
              <FlaskConical className="w-4 h-4" />
              Load Demo
            </button>

            <button
              className="btn-secondary inline-flex items-center justify-center gap-2"
              disabled={Boolean(actionBusy)}
              onClick={async () => {
                setActionBusy('demo_reset')
                try {
                  await demoApi.reset()
                  pushToast({ type: 'success', title: 'Demo reset', message: 'Demo job + demo resume removed.' })
                } catch (e: any) {
                  pushToast({ type: 'error', title: 'Reset failed', message: e?.response?.data?.detail || 'Failed to reset demo.' })
                } finally {
                  setActionBusy(null)
                }
              }}
            >
              <RefreshCcw className="w-4 h-4" />
              Reset Demo
            </button>

            <button
              className="btn-secondary inline-flex items-center justify-center gap-2"
              disabled={Boolean(actionBusy)}
              onClick={async () => {
                const ok = await confirm({
                  title: 'Clear resumes?',
                  message: 'This will remove all resumes (including demo resume). You can load demo again anytime.',
                  confirmText: 'Clear',
                  tone: 'danger',
                })
                if (!ok) return
                setActionBusy('resume_clear')
                try {
                  await resumeApi.clearAll()
                  pushToast({ type: 'success', title: 'Resumes cleared', message: 'All resumes were removed.' })
                } catch (e: any) {
                  pushToast({ type: 'error', title: 'Clear failed', message: e?.response?.data?.detail || 'Failed to clear resumes.' })
                } finally {
                  setActionBusy(null)
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              Clear Resumes
            </button>

            <button
              className="btn-secondary inline-flex items-center justify-center gap-2"
              disabled={Boolean(actionBusy)}
              onClick={async () => {
                const ok = await confirm({
                  title: 'Delete all jobs?',
                  message: 'This will delete every job (including demo). This cannot be undone.',
                  confirmText: 'Delete all',
                  tone: 'danger',
                })
                if (!ok) return
                setActionBusy('jobs_clear')
                try {
                  const res = await jobsApi.getAll()
                  const jobs = res.data.jobs || []
                  for (const j of jobs) {
                    await jobsApi.delete(j.id)
                  }
                  pushToast({ type: 'success', title: 'Jobs cleared', message: 'All jobs were deleted.' })
                } catch (e: any) {
                  pushToast({ type: 'error', title: 'Delete failed', message: e?.response?.data?.detail || 'Failed to delete jobs.' })
                } finally {
                  setActionBusy(null)
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              Clear Jobs
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-semibold">Profile Information</h2>
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>
            )}
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  City, Country
                </label>
                <input
                  type="text"
                  value={profile.city_country}
                  onChange={(e) => setProfile({ ...profile, city_country: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Online Profiles</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/yourname"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={profile.github_url}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                    placeholder="https://github.com/yourname"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={profile.portfolio_url}
                    onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


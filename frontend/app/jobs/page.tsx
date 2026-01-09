'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ExternalLink, Trash2 } from 'lucide-react'
import { jobsApi } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'

interface Job {
  id: number
  title: string
  company?: string
  status: string
  created_at: string
  tags?: string[]
}

export default function JobsPage() {
  const { pushToast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; jobId: number | null; jobTitle: string }>({
    show: false,
    jobId: null,
    jobTitle: ''
  })

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setErrorMsg(null)
      const response = await jobsApi.getAll()
      setJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Failed to load jobs:', error)
      setErrorMsg('Failed to load jobs. If you just clicked Score/AI actions, give it a few seconds and retry.')
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteJob = async (jobId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const job = jobs.find(j => j.id === jobId)
    setDeleteConfirm({
      show: true,
      jobId,
      jobTitle: job?.title || 'this job'
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.jobId) return
    
    try {
      await jobsApi.delete(deleteConfirm.jobId)
      await loadJobs() // Reload the list
      setDeleteConfirm({ show: false, jobId: null, jobTitle: '' })
    } catch (error) {
      console.error('Failed to delete job:', error)
      pushToast({ type: 'error', title: 'Delete failed', message: 'Could not delete the job. Please try again.' })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, jobId: null, jobTitle: '' })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">Jobs</h1>
              <p className="text-gray-600 mt-1">Manage your job applications</p>
            </div>
            <Link href="/jobs/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Job
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 flex items-center justify-between gap-3">
            <p className="text-sm text-red-700">{errorMsg}</p>
            <button className="btn-secondary text-sm" onClick={() => { setLoading(true); loadJobs() }}>
              Retry
            </button>
          </div>
        )}
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-gray-600 mt-4">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
              {jobs.length === 0 ? 'No jobs yet' : 'No jobs found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {jobs.length === 0
                ? 'Create your first job to get started with resume optimization.'
                : 'Try adjusting your search terms.'}
            </p>
            {jobs.length === 0 && (
              <Link href="/jobs/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create First Job
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="card hover:border-primary-300 transition-all group"
              >
                <Link href={`/jobs/${job.id}`} className="block">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      {job.company && (
                        <p className="text-gray-600 mb-3">{job.company}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                          {job.status}
                        </span>
                        {job.tags && job.tags.includes('demo') && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                            Demo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                      <button
                        onClick={(e) => handleDeleteJob(job.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={cancelDelete}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">Delete Job</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.jobTitle}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


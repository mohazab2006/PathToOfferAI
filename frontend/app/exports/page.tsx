'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Briefcase, FileArchive, Loader } from 'lucide-react'
import { demoApi, jobsApi, exportsApi } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'

interface Job {
  id: number
  title: string
  company?: string
}

export default function ExportsPage() {
  const { pushToast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [jobsLoading, setJobsLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setJobsLoading(true)
      const response = await jobsApi.getAll()
      const jobList = response.data.jobs || []
      setJobs(jobList)
      if (jobList.length > 0 && !selectedJobId) {
        const demo = jobList.find((j: any) => String(j.title || '').includes('[Demo]')) || jobList[0]
        setSelectedJobId(demo.id)
      }
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setJobsLoading(false)
    }
  }

  const handleLoadDemo = async () => {
    setJobsLoading(true)
    try {
      await demoApi.load()
      await loadJobs()
      pushToast({ type: 'success', title: 'Demo loaded', message: 'Demo job is ready for exports.' })
    } catch (error: any) {
      pushToast({ type: 'error', title: 'Demo failed', message: error.response?.data?.detail || 'Failed to load demo.' })
      setJobsLoading(false)
    }
  }

  const handleDownload = async (type: string) => {
    if (!selectedJobId) return
    
    setDownloading(type)
    try {
      let response
      let filename = ''
      
      switch (type) {
        case 'resume':
          response = await exportsApi.exportResume(selectedJobId)
          filename = `resume_${selectedJobId}.pdf`
          break
        case 'cover-letter':
          response = await exportsApi.exportCoverLetter(selectedJobId)
          filename = `cover_letter_${selectedJobId}.pdf`
          break
        case 'interview-pack':
          response = await exportsApi.exportInterviewPack(selectedJobId)
          filename = `interview_pack_${selectedJobId}.pdf`
          break
        case 'package':
          response = await exportsApi.exportPackage(selectedJobId)
          filename = `application_${selectedJobId}.zip`
          break
      }
      
      // Create blob and download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Failed to export:', error)
      pushToast({
        type: 'error',
        title: 'Export failed',
        message: error.response?.data?.detail || `Failed to export ${type}. Make sure required data is available.`,
      })
    } finally {
      setDownloading(null)
    }
  }

  const exportOptions = [
    {
      id: 'resume',
      title: 'Resume PDF',
      description: 'Download your optimized resume as a one-page ATS-safe PDF',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter PDF',
      description: 'Download your tailored cover letter as a professional PDF',
      icon: Briefcase,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'interview-pack',
      title: 'Interview Pack PDF',
      description: 'Download interview preparation materials and questions',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'package',
      title: 'Complete Package (ZIP)',
      description: 'Download all application materials in a single ZIP file',
      icon: FileArchive,
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Exports</h1>
          <p className="text-gray-600 mt-1">Download your resumes, cover letters, and application packs</p>
        </div>

        {/* Job Selection */}
        <div className="card mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Select Job
          </label>
          {jobsLoading ? (
            <div className="flex items-center gap-2 text-gray-600 py-2">
              <Loader className="w-4 h-4 animate-spin" />
              Loading jobs…
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-gray-600">No jobs found. Load the demo to try exports.</p>
              <button onClick={handleLoadDemo} className="btn-primary text-sm">
                Load Demo
              </button>
            </div>
          ) : null}
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select a job...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} {job.company && `at ${job.company}`}
              </option>
            ))}
          </select>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon
            const isDownloading = downloading === option.id
            
            return (
              <div
                key={option.id}
                className="card hover:border-primary-300 transition-all"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${option.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {option.description}
                </p>
                
                <button
                  onClick={() => handleDownload(option.id)}
                  disabled={!selectedJobId || isDownloading}
                  className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin inline mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 inline mr-2" />
                      Download
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All exports are ATS-safe and optimized for applicant tracking systems. 
            Resume and cover letter PDFs are limited to one page for maximum impact.
          </p>
        </div>
      </div>
    </div>
  )
}

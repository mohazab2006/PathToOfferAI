'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Briefcase, TrendingUp, FileCheck, Target, Code, Download, Loader, MessageSquare, Map } from 'lucide-react'
import { jobsApi, analysisApi, resumeApi, coverLetterApi, exportsApi, practiceApi, roadmapApi } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'

interface Job {
  id: number
  title: string
  company?: string
  jd_text?: string
  status: string
  tags?: string[]
}

interface Analysis {
  jd_extract?: any
  score_breakdown?: any
  evidence_map?: any
}

export default function JobWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const jobId = parseInt(params.id as string)
  const { pushToast } = useToast()
  
  const [job, setJob] = useState<Job | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [jdText, setJdText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [scoring, setScoring] = useState(false)

  useEffect(() => {
    loadJob()
    loadAnalysis()
  }, [jobId])

  const loadJob = async () => {
    try {
      const response = await jobsApi.get(jobId)
      setJob(response.data)
      setJdText(response.data.jd_text || '')
    } catch (error) {
      console.error('Failed to load job:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalysis = async () => {
    try {
      const response = await analysisApi.get(jobId)
      setAnalysis(response.data)
    } catch (error) {
      // Analysis might not exist yet
    }
  }

  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) return
    
    setAnalyzing(true)
    try {
      await analysisApi.analyzeJD(jobId, jdText)
      await loadAnalysis()
      // Update job with JD text
      await jobsApi.update(jobId, { jd_text: jdText })
      setJob(prev => prev ? { ...prev, jd_text: jdText } : null)
    } catch (error) {
      console.error('Failed to analyze JD:', error)
      pushToast({ type: 'error', title: 'Analyze failed', message: 'Could not analyze the job description.' })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleScoreResume = async () => {
    if (scoring) return
    setScoring(true)
    try {
      await analysisApi.score(jobId)
      await loadAnalysis()
    } catch (error) {
      console.error('Failed to score resume:', error)
      const anyErr: any = error
      const detail =
        anyErr?.response?.data?.detail ||
        anyErr?.message ||
        'Failed to score resume.'
      pushToast({ type: 'error', title: 'Score failed', message: detail })
    } finally {
      setScoring(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-4">Loading job...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
          <Link href="/jobs" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'gaps', label: 'Gaps', icon: TrendingUp },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'cover-letter', label: 'Cover Letter', icon: Briefcase },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'practice', label: 'Practice', icon: Code },
    { id: 'export', label: 'Export', icon: Download },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">{job.title}</h1>
            {job.company && (
              <p className="text-gray-600 mt-1">{job.company}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            job={job}
            analysis={analysis}
            jdText={jdText}
            setJdText={setJdText}
            onAnalyzeJD={handleAnalyzeJD}
            onScoreResume={handleScoreResume}
            analyzing={analyzing}
            scoring={scoring}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'resume' && (
          <ResumeTab
            jobId={jobId}
            isDemo={Boolean(job?.title?.includes('[Demo]')) || Boolean(job?.tags?.includes?.('demo'))}
            analysis={analysis}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'cover-letter' && (
          <CoverLetterTab jobId={jobId} />
        )}
        {activeTab === 'gaps' && (
          <GapsTab jobId={jobId} analysis={analysis} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'roadmap' && (
          <RoadmapTab jobId={jobId} />
        )}
        {activeTab === 'practice' && (
          <PracticeTab jobId={jobId} />
        )}
        {activeTab === 'export' && (
          <ExportTab jobId={jobId} />
        )}
      </div>
    </div>
  )
}

function OverviewTab({ job, analysis, jdText, setJdText, onAnalyzeJD, onScoreResume, analyzing, scoring, setActiveTab }: any) {
  const handleScoreAndRedirect = async () => {
    await onScoreResume()
    // After scoring, redirect to Gaps tab to see the results
    setActiveTab('gaps')
  }

  return (
    <div className="space-y-6">
      {/* JD Analysis Section */}
      <div className="card">
        <h2 className="font-display text-xl font-semibold mb-4">Job Description Analysis</h2>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={onAnalyzeJD}
            disabled={analyzing || !jdText.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? 'Analyzing...' : 'Analyze JD'}
          </button>
        </div>
      </div>

      {/* JD Extract Results */}
      {analysis?.jd_extract && (
        <div className="card">
          <h2 className="font-display text-xl font-semibold mb-4">Extracted Requirements</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Must-Have Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.jd_extract.must_have_skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.jd_extract.keywords?.slice(0, 15).map((keyword: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATS Score Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-xl font-semibold">ATS Score</h2>
          <button
            onClick={handleScoreAndRedirect}
            disabled={scoring}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scoring ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Scoring…
              </span>
            ) : (
              'Calculate Score'
            )}
          </button>
        </div>
        {scoring && (
          <p className="text-sm text-gray-600 mb-4">
            This can take up to ~2 minutes the first time. You can keep browsing jobs/practice while it runs.
          </p>
        )}
        {analysis?.score_breakdown ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Overall Score</span>
                <span className="text-2xl font-bold text-primary-600">
                  {analysis.score_breakdown.final_score || 0}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-600 to-primary-700 h-3 rounded-full transition-all"
                  style={{ width: `${analysis.score_breakdown.final_score || 0}%` }}
                />
              </div>
            </div>
            {['keyword_coverage', 'alignment', 'evidence_strength', 'bullet_quality'].map((key) => {
              const score = analysis.score_breakdown[key]?.score || 0
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-semibold">{score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {/* Quick action to view gaps */}
            <button
              onClick={() => setActiveTab('gaps')}
              className="btn-primary w-full mt-2"
            >
              View Gaps & Improve Resume →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600">Upload a resume and analyze the JD to see your ATS score.</p>
            <button
              onClick={() => setActiveTab('resume')}
              className="btn-secondary text-sm"
            >
              Go to Resume Tab →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ResumeTab({ jobId, isDemo, analysis, setActiveTab }: { jobId: number; isDemo: boolean; analysis: any; setActiveTab: (tab: string) => void }) {
  const { pushToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [resume, setResume] = useState<any>(null)
  const [resumeLoading, setResumeLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [hasExistingResume, setHasExistingResume] = useState(false)
  const [showExisting, setShowExisting] = useState(false)

  useEffect(() => {
    loadResume()
  }, [isDemo, showExisting])

  useEffect(() => {
    loadVersions()
  }, [jobId])

  // Check if user has an existing resume (for non-demo jobs)
  useEffect(() => {
    if (!isDemo) {
      resumeApi.getLatest().then(() => setHasExistingResume(true)).catch(() => setHasExistingResume(false))
    }
  }, [isDemo])

  const loadResume = async () => {
    try {
      setResumeLoading(true)
      if (isDemo) {
        const response = await resumeApi.getDemo()
        setResume(response.data)
      } else if (showExisting) {
        // User chose to use existing resume
        const response = await resumeApi.getLatest()
        setResume(response.data)
      } else {
        // Non-demo: don't auto-load, wait for upload or user choice
        setResume(null)
      }
    } catch (error) {
      setResume(null)
    } finally {
      setResumeLoading(false)
    }
  }

  const loadVersions = async () => {
    try {
      setVersionsLoading(true)
      const res = await resumeApi.getVersions(jobId)
      setVersions(res.data.resume_versions || [])
    } catch {
      setVersions([])
    } finally {
      setVersionsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await resumeApi.upload(file)
      setShowExisting(true) // Show the uploaded resume
      setHasExistingResume(true)
    } catch (error) {
      console.error('Upload failed:', error)
      pushToast({ type: 'error', title: 'Upload failed', message: 'Could not upload your resume. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const isPdf = !isDemo && (resume?.file_path?.endsWith('.pdf') || false)
  const viewUrl = resume ? (isDemo ? resumeApi.getDemoViewUrl() : resumeApi.getViewUrl()) : null
  const topFixes = analysis?.score_breakdown?.top_fixes || []

  const content = (() => {
    if (resumeLoading) {
      return (
        <div className="text-center py-10">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <Loader className="w-4 h-4 animate-spin" />
            Loading resume…
          </div>
        </div>
      )
    }

    if (resume) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Uploaded Resume</h3>
            <p className="text-sm text-gray-600 mb-4">Resume parsed successfully</p>

            {/* Resume Viewer */}
            {viewUrl && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                {isPdf ? (
                  <iframe
                    src={viewUrl}
                    className="w-full h-[600px] border-0"
                    title="Resume PDF Viewer"
                  />
                ) : (
                  <div className="p-4 bg-white max-h-[600px] overflow-auto">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                      {resume.raw_text || 'No text content available'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resume Improvements */}
          {topFixes.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Resume Improvements</h3>
              <p className="text-sm text-gray-600 mb-3">
                Based on your ATS score, here are the highest-impact edits to make.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {topFixes.slice(0, 5).map((fix: any, idx: number) => (
                  <li key={idx}>
                    <span className="font-medium">{fix.target_location || 'Resume'}:</span>{' '}
                    {typeof fix.constraint_rules === 'string'
                      ? fix.constraint_rules
                      : 'Apply the guidelines shown in the Gaps tab.'}
                  </li>
                ))}
              </ol>
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    onClick={() => setActiveTab('gaps')}
                  >
                    ← View Full Gaps Analysis
                  </button>
                  <button
                    type="button"
                    className="btn-primary text-sm"
                    disabled={optimizing}
                    onClick={async () => {
                      setOptimizing(true)
                      try {
                        await resumeApi.optimize(jobId, 'Optimized')
                        await loadVersions()
                        pushToast({ type: 'success', title: 'Optimized', message: 'Saved an optimized resume version for this job.' })
                      } catch (e: any) {
                        pushToast({ type: 'error', title: 'Optimize failed', message: e?.response?.data?.detail || 'Failed to optimize resume.' })
                      } finally {
                        setOptimizing(false)
                      }
                    }}
                  >
                    {optimizing ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Optimizing…
                      </span>
                    ) : (
                      'Generate Optimized Version'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Version history */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Resume Versions (this job)</h3>
              <button className="btn-secondary text-sm" onClick={loadVersions}>
                Refresh Versions
              </button>
            </div>
            {versionsLoading ? (
              <div className="text-sm text-gray-600 inline-flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : versions.length === 0 ? (
              <p className="text-sm text-gray-600">No optimized versions yet. Generate one to use in exports.</p>
            ) : (
              <>
                <ul className="text-sm text-gray-700 space-y-1">
                  {versions.slice().reverse().slice(0, 5).map((v, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3">
                      <span className="font-medium">{v.label || 'Version'}</span>
                      <span className="text-gray-500">{String(v.created_at || '')}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setActiveTab('export')}
                  className="btn-primary w-full mt-3"
                >
                  Continue to Export →
                </button>
              </>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Exports will use the <span className="font-medium">latest optimized</span> version automatically.
            </p>
          </div>

          {/* Workflow tip */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Tip:</strong> Check the <span className="font-medium">Gaps</span> tab first to see what's missing, 
            then either click "Generate Optimized Version" above or download your resume, edit it manually, and re-upload.
          </div>

          <div className="flex flex-wrap gap-3">
            {!isDemo && (
              <>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="btn-secondary inline-block cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Replace Resume'}
                </label>
              </>
            )}
            {viewUrl && (
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <span>Open in New Tab</span>
              </a>
            )}
            {resume?.raw_text && (
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={() => {
                  const blob = new Blob([resume.raw_text], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'resume.txt'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Download as Text
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="text-center py-12">
        {isDemo ? (
          <>
            <p className="text-gray-700 font-medium">Demo resume not loaded yet.</p>
            <p className="text-gray-600 mt-2 text-sm">Go back to Home and click Start Demo again.</p>
          </>
        ) : (
          <>
            <p className="text-gray-700 font-medium mb-4">No resume loaded for this job yet.</p>
            <div className="flex flex-col items-center gap-3">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="btn-primary inline-block cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </label>
              {hasExistingResume && (
                <button
                  type="button"
                  onClick={() => setShowExisting(true)}
                  className="btn-secondary"
                >
                  Use My Existing Resume
                </button>
              )}
            </div>
            <p className="text-gray-600 mt-4 text-sm">Upload a new resume (PDF or text) or use your previously uploaded one.</p>
          </>
        )}
      </div>
    )
  })()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Resume</h2>
        <button onClick={loadResume} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>
      {isDemo && (
        <p className="text-sm text-gray-600 mb-4">
          You’re viewing the <span className="font-medium">Demo resume</span>. Uploading a resume is disabled in demo mode.
        </p>
      )}
      {content}
    </div>
  )
}

function RoadmapTab({ jobId }: { jobId: number }) {
  const { pushToast } = useToast()
  const [timelineWeeks, setTimelineWeeks] = useState(4)
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState<any>(null)

  const load = async () => {
    try {
      const res = await roadmapApi.get(jobId)
      setRoadmap(res.data.roadmap)
    } catch {
      setRoadmap(null)
    }
  }

  useEffect(() => {
    load()
  }, [jobId])

  const generate = async () => {
    setLoading(true)
    try {
      const res = await roadmapApi.generate(jobId, timelineWeeks)
      setRoadmap(res.data.roadmap)
      pushToast({ type: 'success', title: 'Roadmap ready', message: `Generated a ${timelineWeeks}-week roadmap.` })
    } catch (e: any) {
      pushToast({ type: 'error', title: 'Roadmap failed', message: e?.response?.data?.detail || 'Failed to generate roadmap.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900">Learning Roadmap</h2>
            <p className="text-sm text-gray-600">A week-by-week plan based on your gaps for this job.</p>
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Generating…
              </span>
            ) : (
              'Generate'
            )}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Timeline</span>
          <select
            value={timelineWeeks}
            onChange={(e) => setTimelineWeeks(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            {[4, 6, 8, 12].map((w) => (
              <option key={w} value={w}>
                {w} weeks
              </option>
            ))}
          </select>
          <button className="btn-secondary text-sm" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {roadmap?.weeks?.length ? (
        <div className="space-y-3">
          {roadmap.weeks.map((wk: any) => (
            <div key={wk.week_number} className="card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-gray-900">Week {wk.week_number}</h3>
                <span className="text-sm text-gray-600">{(wk.focus_areas || []).join(', ')}</span>
              </div>
              <div className="mt-3 space-y-2">
                {(wk.tasks || []).map((t: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900">{t.title}</div>
                    {t.description && <div className="text-sm text-gray-700 mt-1">{t.description}</div>}
                    {(t.resources || []).length > 0 && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Resources:</span> {(t.resources || []).join(' · ')}
                      </div>
                    )}
                    {t.estimated_hours && (
                      <div className="text-xs text-gray-500 mt-1">Est. {t.estimated_hours}h</div>
                    )}
                  </div>
                ))}
              </div>
              {(wk.milestones || []).length > 0 && (
                <div className="mt-3 text-sm text-gray-700">
                  <span className="font-medium">Milestones:</span> {(wk.milestones || []).join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10">
          <p className="text-gray-600">No roadmap yet. Click Generate.</p>
        </div>
      )}
    </div>
  )
}

function CoverLetterTab({ jobId }: { jobId: number }) {
  const { pushToast } = useToast()
  const [generating, setGenerating] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await coverLetterApi.generate(jobId)
      setCoverLetter(response.data.cover_letter)
    } catch (error) {
      console.error('Generation failed:', error)
      pushToast({
        type: 'error',
        title: 'Generation failed',
        message: 'Could not generate cover letter. Make sure JD is analyzed and a resume is available.',
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-semibold">Cover Letter</h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Cover Letter'}
        </button>
      </div>
      {coverLetter ? (
        <div className="prose max-w-none">
          <div className="p-6 bg-gray-50 rounded-lg whitespace-pre-wrap font-sans">
            {coverLetter}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Click "Generate Cover Letter" to create a tailored cover letter for this role.</p>
      )}
    </div>
  )
}

function GapsTab({ jobId, analysis, setActiveTab }: { jobId: number; analysis: any; setActiveTab: (tab: string) => void }) {
  const evidenceMap = analysis?.evidence_map
  const scoreBreakdown = analysis?.score_breakdown
  const jdExtract = analysis?.jd_extract

  if (!analysis || !jdExtract) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Analyze the JD and score your resume to see gaps analysis.</p>
        <button
          onClick={() => setActiveTab('overview')}
          className="btn-secondary mt-4"
        >
          ← Go to Overview to Analyze
        </button>
      </div>
    )
  }

  const missing = evidenceMap?.missing || []
  const mustHaveSkills = jdExtract.must_have_skills || []
  const niceToHaveSkills = jdExtract.nice_to_have_skills || []
  const topFixes = scoreBreakdown?.top_fixes || []

  const renderGuidelines = (rules: any) => {
    if (!rules) return null

    // String rules: render as bullet points by splitting on newlines / semicolons
    if (typeof rules === 'string') {
      const parts = rules
        .split(/\r?\n|;/g)
        .map((s) => s.trim())
        .filter(Boolean)
      return (
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          {parts.map((p, idx) => (
            <li key={idx}>{p}</li>
          ))}
        </ul>
      )
    }

    // Array rules: list each entry
    if (Array.isArray(rules)) {
      return (
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          {rules.map((r, idx) => (
            <li key={idx}>{String(r)}</li>
          ))}
        </ul>
      )
    }

    // Object rules: key/value entries
    if (typeof rules === 'object') {
      return (
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          {Object.entries(rules).map(([key, value]) => (
            <li key={key}>
              <span className="font-medium text-gray-700">{key}:</span> {String(value)}
            </li>
          ))}
        </ul>
      )
    }

    return <div className="mt-1">{String(rules)}</div>
  }

  const formatImpact = (impact: any) => {
    if (impact === null || impact === undefined) return null
    const s = String(impact).trim()
    // Avoid "points points" if backend already includes the word.
    if (/point/i.test(s)) return s
    return `${s} points`
  }

  return (
    <div className="space-y-6">
      {/* Missing Must-Have Skills */}
      {missing.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <h2 className="font-display text-xl font-semibold text-gray-900">Missing Must-Have Skills</h2>
          </div>
          <p className="text-gray-700 mb-4">
            These skills are required for this role but are not clearly demonstrated in your resume:
          </p>
          <div className="flex flex-wrap gap-2">
            {missing.map((skill: string, i: number) => (
              <span
                key={i}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Must-Have Skills Coverage */}
      <div className="card">
        <h2 className="font-display text-xl font-semibold mb-4">Must-Have Skills Coverage</h2>
        {mustHaveSkills.length > 0 ? (
          <div className="space-y-3">
            {mustHaveSkills.map((skill: string, i: number) => {
              const hasEvidence = evidenceMap?.evidence?.[skill]?.length > 0
              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    hasEvidence
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{skill}</span>
                    {hasEvidence ? (
                      <span className="text-sm text-green-700 font-medium">✓ Found</span>
                    ) : (
                      <span className="text-sm text-red-700 font-medium">✗ Missing</span>
                    )}
                  </div>
                  {hasEvidence && evidenceMap.evidence[skill] && (
                    <p className="text-xs text-gray-600 mt-1">
                      Found in: {evidenceMap.evidence[skill].map((e: any) => e.section).join(', ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-600">No must-have skills specified in job description.</p>
        )}
      </div>

      {/* Nice-to-Have Skills */}
      {niceToHaveSkills.length > 0 && (
        <div className="card">
          <h2 className="font-display text-xl font-semibold mb-4">Nice-to-Have Skills</h2>
          <p className="text-gray-600 mb-3">These skills would strengthen your application:</p>
          <div className="flex flex-wrap gap-2">
            {niceToHaveSkills.map((skill: string, i: number) => {
              const hasEvidence = evidenceMap?.evidence?.[skill]?.length > 0
              return (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hasEvidence
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  {skill} {hasEvidence && '✓'}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Fixes */}
      {topFixes.length > 0 && (
        <div className="card">
          <h2 className="font-display text-xl font-semibold mb-4">Recommended Fixes</h2>
          <div className="space-y-4">
            {topFixes.map((fix: any, i: number) => (
              <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Fix #{i + 1}</h3>
                  {fix.expected_score_impact && (
                    <span className="text-sm text-blue-700 font-medium">
                      +{formatImpact(fix.expected_score_impact)}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{fix.target_location || 'Resume'}</p>
                {fix.constraint_rules && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Guidelines:</strong>
                    {renderGuidelines(fix.constraint_rules)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {missing.length === 0 && topFixes.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-600">Great job! No major gaps identified. Your resume aligns well with this role.</p>
          <button
            onClick={() => setActiveTab('resume')}
            className="btn-primary mt-4"
          >
            Continue to Resume →
          </button>
        </div>
      )}

      {/* Action button when there are gaps */}
      {(missing.length > 0 || topFixes.length > 0) && (
        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to improve your resume?</h3>
              <p className="text-sm text-gray-600">Go to the Resume tab to generate an optimized version or edit manually.</p>
            </div>
            <button
              onClick={() => setActiveTab('resume')}
              className="btn-primary"
            >
              Fix Resume →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExportTab({ jobId }: { jobId: number }) {
  const { pushToast } = useToast()
  const [downloading, setDownloading] = useState<string | null>(null)

  const downloadBlob = (data: any, filename: string) => {
    const blob = new Blob([data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleDownload = async (type: 'resume' | 'cover-letter' | 'interview-pack' | 'package') => {
    setDownloading(type)
    try {
      if (type === 'resume') {
        const res = await exportsApi.exportResume(jobId)
        downloadBlob(res.data, `resume_${jobId}.pdf`)
      } else if (type === 'cover-letter') {
        const res = await exportsApi.exportCoverLetter(jobId)
        downloadBlob(res.data, `cover_letter_${jobId}.pdf`)
      } else if (type === 'interview-pack') {
        const res = await exportsApi.exportInterviewPack(jobId)
        downloadBlob(res.data, `interview_pack_${jobId}.pdf`)
      } else {
        const res = await exportsApi.exportPackage(jobId)
        downloadBlob(res.data, `application_${jobId}.zip`)
      }
      pushToast({ type: 'success', title: 'Download started', message: 'Your file is downloading.' })
    } catch (e: any) {
      pushToast({
        type: 'error',
        title: 'Export failed',
        message: e?.response?.data?.detail || 'Export failed. Make sure JD is analyzed and resume is available.',
      })
    } finally {
      setDownloading(null)
    }
  }

  const Card = ({
    id,
    title,
    desc,
  }: {
    id: 'resume' | 'cover-letter' | 'interview-pack' | 'package'
    title: string
    desc: string
  }) => (
    <div className="card hover:border-primary-300 transition-all">
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{desc}</p>
      <button
        onClick={() => handleDownload(id)}
        disabled={Boolean(downloading)}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloading === id ? (
          <span className="inline-flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            Downloading…
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </span>
        )}
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-display text-xl font-semibold mb-2">Exports</h2>
        <p className="text-sm text-gray-600">Download PDFs and a complete application package for this job.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card id="resume" title="Resume PDF" desc="ATS-safe, one-page export of your resume." />
        <Card id="cover-letter" title="Cover Letter PDF" desc="Role-specific cover letter export." />
        <Card id="interview-pack" title="Interview Pack PDF" desc="Questions + prep pack for this job." />
        <Card id="package" title="Complete Package (ZIP)" desc="All documents bundled in one ZIP." />
      </div>
    </div>
  )
}

function PracticeTab({ jobId }: { jobId: number }) {
  const { pushToast } = useToast()
  const [mode, setMode] = useState<'behavioural' | 'technical' | 'mock'>('behavioural')
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState<any>(null)
  const [response, setResponse] = useState('')
  const [score, setScore] = useState<any>(null)
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([])

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [problem, setProblem] = useState<any>(null)
  const [code, setCode] = useState('')
  const [review, setReview] = useState<any>(null)

  const handleGenerateQuestion = async () => {
    setLoading(true)
    setQuestion(null)
    setResponse('')
    setScore(null)
    try {
      const res = await practiceApi.generateQuestion(jobId, mode, previousQuestions)
      setQuestion(res.data)
      setPreviousQuestions((prev) => [...prev, res.data.question])
    } catch (e: any) {
      pushToast({
        type: 'error',
        title: 'Generate failed',
        message: e?.response?.data?.detail || 'Failed to generate question. Make sure JD is analyzed.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScoreResponse = async () => {
    if (!question || !response.trim()) return
    setLoading(true)
    try {
      const res = await practiceApi.scoreResponse(jobId, question.question, response)
      setScore(res.data)
    } catch (e: any) {
      pushToast({ type: 'error', title: 'Scoring failed', message: e?.response?.data?.detail || 'Failed to score.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateProblem = async () => {
    setLoading(true)
    setProblem(null)
    setCode('')
    setReview(null)
    try {
      const res = await practiceApi.generateCodingProblem(jobId, difficulty)
      setProblem(res.data)
    } catch (e: any) {
      pushToast({
        type: 'error',
        title: 'Generate failed',
        message: e?.response?.data?.detail || 'Failed to generate problem. Make sure JD is analyzed.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReviewCode = async () => {
    if (!problem || !code.trim()) return
    setLoading(true)
    try {
      const res = await practiceApi.reviewCode(jobId, problem, code, {})
      setReview(res.data)
    } catch (e: any) {
      pushToast({ type: 'error', title: 'Review failed', message: e?.response?.data?.detail || 'Failed to review.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Interview */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900">Interview Practice</h2>
            <p className="text-sm text-gray-600">Generate role-specific questions and get STAR feedback.</p>
          </div>
          <button
            onClick={handleGenerateQuestion}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Generating…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Generate
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {(['behavioural', 'technical', 'mock'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mode === m ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {question ? (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-gray-900 font-medium">{question.question}</p>
              {question.what_interviewer_looks_for && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">Looking for:</span> {question.what_interviewer_looks_for}
                </p>
              )}
            </div>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your STAR response…"
              className="w-full h-44 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleScoreResponse}
                disabled={loading || !response.trim()}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scoring…' : 'Get Feedback'}
              </button>
              {score?.total_score !== undefined && (
                <span className="text-sm text-gray-700">
                  Score: <span className="font-semibold">{score.total_score}/100</span>
                </span>
              )}
            </div>
            {score?.overall_feedback && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                {score.overall_feedback}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-600">Click “Generate” to start.</p>
        )}
      </div>

      {/* Coding */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-gray-900">Coding Practice</h2>
            <p className="text-sm text-gray-600">Original problems tailored to this job + AI review.</p>
          </div>
          <button
            onClick={handleGenerateProblem}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Generating…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generate
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${
                difficulty === d ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {problem ? (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="font-semibold text-gray-900 mb-1">{problem.title}</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{problem.prompt}</div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your solution here…"
              className="w-full h-56 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleReviewCode}
                disabled={loading || !code.trim()}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Reviewing…' : 'Review Code'}
              </button>
              {review?.correctness && (
                <span className="text-sm text-gray-700">
                  Result: <span className="font-semibold">{review.correctness}</span>
                </span>
              )}
            </div>
            {review?.feedback && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                {review.feedback}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-600">Click “Generate” to get a problem.</p>
        )}
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, CheckCircle, AlertCircle, Sparkles, Code, Shuffle, Loader } from 'lucide-react'
import { jobsApi, practiceApi, demoApi } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'

interface Job {
  id: number
  title: string
  company?: string
}

interface Question {
  question: string
  type: string
  what_interviewer_looks_for?: string
  suggested_answer_structure?: string
}

interface Score {
  total_score: number
  situation_clarity?: number
  task_clarity?: number
  action_specificity?: number
  result_impact?: number
  relevance_to_role?: number
  strengths?: string[]
  improvements?: string[]
  overall_feedback?: string
}

export default function PracticePage() {
  const { pushToast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [mode, setMode] = useState<'behavioural' | 'technical' | 'mock'>('behavioural')
  const [question, setQuestion] = useState<Question | null>(null)
  const [response, setResponse] = useState('')
  const [score, setScore] = useState<Score | null>(null)
  const [loading, setLoading] = useState(false)
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([])
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
        // Prefer demo job if present
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
    } catch (error: any) {
      pushToast({ type: 'error', title: 'Demo failed', message: error.response?.data?.detail || 'Failed to load demo.' })
      setJobsLoading(false)
    }
  }

  const handleGenerateQuestion = async () => {
    if (!selectedJobId) return
    
    setLoading(true)
    setQuestion(null)
    setResponse('')
    setScore(null)
    
    try {
      const res = await practiceApi.generateQuestion(selectedJobId, mode, previousQuestions)
      setQuestion(res.data)
      setPreviousQuestions(prev => [...prev, res.data.question])
    } catch (error: any) {
      console.error('Failed to generate question:', error)
      pushToast({
        type: 'error',
        title: 'Generate failed',
        message: error.response?.data?.detail || 'Failed to generate question. Make sure JD is analyzed.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScoreResponse = async () => {
    if (!selectedJobId || !question || !response.trim()) return
    
    setLoading(true)
    try {
      const res = await practiceApi.scoreResponse(selectedJobId, question.question, response)
      setScore(res.data)
    } catch (error: any) {
      console.error('Failed to score response:', error)
      pushToast({ type: 'error', title: 'Scoring failed', message: error.response?.data?.detail || 'Failed to score response.' })
    } finally {
      setLoading(false)
    }
  }

  const modeIcons = {
    behavioural: MessageSquare,
    technical: Code,
    mock: Shuffle,
  }

  const ModeIcon = modeIcons[mode]

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Interview Practice</h1>
          <p className="text-gray-600 mt-1">Practice behavioral and technical interviews with AI feedback</p>
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
              <p className="text-gray-600">No jobs found. Load the demo to start practicing.</p>
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

        {/* Mode Selection */}
        <div className="card mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Question Type
          </label>
          <div className="flex gap-3">
            {(['behavioural', 'technical', 'mock'] as const).map((m) => {
              const Icon = modeIcons[m]
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    mode === m
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="capitalize">{m}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Generate Question */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-semibold">Question</h2>
            <button
              onClick={handleGenerateQuestion}
              disabled={loading || !selectedJobId}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Question'}
            </button>
          </div>

          {question ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-2">{question.question}</p>
                    {question.what_interviewer_looks_for && (
                      <div className="mt-3 pt-3 border-t border-primary-200">
                        <p className="text-sm font-semibold text-gray-700 mb-1">What the interviewer is looking for:</p>
                        <p className="text-sm text-gray-600">{question.what_interviewer_looks_for}</p>
                      </div>
                    )}
                    {question.suggested_answer_structure && (
                      <div className="mt-3 pt-3 border-t border-primary-200">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Suggested structure:</p>
                        <p className="text-sm text-gray-600">{question.suggested_answer_structure}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Response Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Response (STAR format recommended)
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Situation: ...&#10;Task: ...&#10;Action: ...&#10;Result: ..."
                  className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleScoreResponse}
                  disabled={loading || !response.trim()}
                  className="mt-3 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Scoring...' : 'Get Feedback'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Click "Generate Question" to start practicing
            </p>
          )}
        </div>

        {/* Score Results */}
        {score && (
          <div className="card">
            <h2 className="font-display text-xl font-semibold mb-4">Feedback</h2>
            
            {/* Overall Score */}
            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Overall Score</span>
                <span className="text-3xl font-bold text-primary-600">{score.total_score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-600 to-primary-700 h-3 rounded-full transition-all"
                  style={{ width: `${score.total_score}%` }}
                />
              </div>
            </div>

            {/* Rubric Scores */}
            {score.situation_clarity !== undefined && (
              <div className="space-y-3 mb-6">
                {[
                  { key: 'situation_clarity', label: 'Situation Clarity' },
                  { key: 'task_clarity', label: 'Task Clarity' },
                  { key: 'action_specificity', label: 'Action Specificity' },
                  { key: 'result_impact', label: 'Result Impact' },
                  { key: 'relevance_to_role', label: 'Relevance to Role' },
                ].map(({ key, label }) => {
                  const value = score[key as keyof Score] as number | undefined
                  if (value === undefined) return null
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="text-sm font-semibold">{value}/20</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${(value / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Strengths */}
            {score.strengths && score.strengths.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Strengths</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {score.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {score.improvements && score.improvements.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Areas for Improvement</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {score.improvements.map((improvement, i) => (
                    <li key={i}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Feedback */}
            {score.overall_feedback && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Overall Feedback</h3>
                <p className="text-gray-600">{score.overall_feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

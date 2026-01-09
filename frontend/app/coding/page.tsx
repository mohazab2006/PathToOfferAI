'use client'

import { useState, useEffect } from 'react'
import { Code, Play, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Loader } from 'lucide-react'
import { jobsApi, practiceApi, demoApi } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'

interface Job {
  id: number
  title: string
  company?: string
}

interface Problem {
  title: string
  topic: string
  difficulty: string
  prompt: string
  examples?: Array<{ input: string; output: string; explanation?: string }>
  constraints?: string[]
  test_cases?: Array<{ input: string; expected_output: string }>
  hints?: string[]
}

interface Review {
  correctness: string
  edge_cases_handled?: boolean
  time_complexity?: string
  space_complexity?: string
  feedback?: string
  suggestions?: string[]
}

export default function CodingPage() {
  const { pushToast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [problem, setProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState('')
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(false)
  const [showHints, setShowHints] = useState(false)
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
    } catch (error: any) {
      pushToast({ type: 'error', title: 'Demo failed', message: error.response?.data?.detail || 'Failed to load demo.' })
      setJobsLoading(false)
    }
  }

  const handleGenerateProblem = async () => {
    if (!selectedJobId) return
    
    setLoading(true)
    setProblem(null)
    setCode('')
    setReview(null)
    setShowHints(false)
    
    try {
      const res = await practiceApi.generateCodingProblem(selectedJobId, difficulty)
      setProblem(res.data)
    } catch (error: any) {
      console.error('Failed to generate problem:', error)
      pushToast({
        type: 'error',
        title: 'Generate failed',
        message: error.response?.data?.detail || 'Failed to generate problem. Make sure JD is analyzed.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReviewCode = async () => {
    if (!selectedJobId || !problem || !code.trim()) return
    
    setLoading(true)
    try {
      // For now, we'll send empty test_results since we don't have a code runner
      const res = await practiceApi.reviewCode(selectedJobId, problem, code, {})
      setReview(res.data)
    } catch (error: any) {
      console.error('Failed to review code:', error)
      pushToast({ type: 'error', title: 'Review failed', message: error.response?.data?.detail || 'Failed to review code.' })
    } finally {
      setLoading(false)
    }
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    hard: 'bg-red-100 text-red-700 border-red-300',
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Coding Practice</h1>
          <p className="text-gray-600 mt-1">Practice coding problems tailored to your job applications</p>
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

        {/* Difficulty Selection */}
        <div className="card mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Difficulty
          </label>
          <div className="flex gap-3">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all capitalize font-medium ${
                  difficulty === d
                    ? `${difficultyColors[d]} border-current`
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Problem */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-semibold">Problem</h2>
            <button
              onClick={handleGenerateProblem}
              disabled={loading || !selectedJobId}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin inline mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Code className="w-4 h-4 inline mr-2" />
                  Generate Problem
                </>
              )}
            </button>
          </div>

          {problem ? (
            <div className="space-y-4">
              {/* Problem Header */}
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-lg font-semibold text-gray-900">{problem.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[problem.difficulty as keyof typeof difficultyColors] || difficultyColors.medium}`}>
                    {problem.difficulty}
                  </span>
                </div>
                {problem.topic && (
                  <p className="text-sm text-gray-600 mb-3">Topic: {problem.topic}</p>
                )}
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{problem.prompt}</p>
                </div>
              </div>

              {/* Examples */}
              {problem.examples && problem.examples.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Examples</h4>
                  {problem.examples.map((example, i) => (
                    <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Input:</span>
                          <pre className="mt-1 text-gray-900 font-mono bg-white p-2 rounded border">{example.input}</pre>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Output:</span>
                          <pre className="mt-1 text-gray-900 font-mono bg-white p-2 rounded border">{example.output}</pre>
                        </div>
                      </div>
                      {example.explanation && (
                        <p className="mt-2 text-sm text-gray-600">{example.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && problem.constraints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Constraints</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {problem.constraints.map((constraint, i) => (
                      <li key={i}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hints */}
              {problem.hints && problem.hints.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {showHints ? 'Hide' : 'Show'} Hints
                  </button>
                  {showHints && (
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-600">
                      {problem.hints.map((hint, i) => (
                        <li key={i}>{hint}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Code Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Solution
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Write your solution here..."
                  className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <button
                  onClick={handleReviewCode}
                  disabled={loading || !code.trim()}
                  className="mt-3 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin inline mr-2" />
                      Reviewing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 inline mr-2" />
                      Get Code Review
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Click "Generate Problem" to start practicing
            </p>
          )}
        </div>

        {/* Review Results */}
        {review && (
          <div className="card">
            <h2 className="font-display text-xl font-semibold mb-4">Code Review</h2>
            
            {/* Correctness */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                {review.correctness === 'correct' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : review.correctness === 'partial' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold text-gray-900 capitalize">
                  {review.correctness}
                </span>
              </div>
            </div>

            {/* Complexity */}
            {(review.time_complexity || review.space_complexity) && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Complexity Analysis</h3>
                <div className="grid grid-cols-2 gap-3">
                  {review.time_complexity && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Time</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.time_complexity}</p>
                    </div>
                  )}
                  {review.space_complexity && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-700">Space</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.space_complexity}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edge Cases */}
            {review.edge_cases_handled !== undefined && (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  {review.edge_cases_handled ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                  <span className="font-semibold text-gray-900">
                    Edge Cases: {review.edge_cases_handled ? 'Handled' : 'Not Handled'}
                  </span>
                </div>
              </div>
            )}

            {/* Feedback */}
            {review.feedback && (
              <div className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
                <p className="text-gray-700">{review.feedback}</p>
              </div>
            )}

            {/* Suggestions */}
            {review.suggestions && review.suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Suggestions</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {review.suggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

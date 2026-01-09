import axios from 'axios'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s for normal API calls
})

// Longer-timeout client for AI operations (multiple LLM calls can exceed 60s)
const aiApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000, // 3 minutes
})

// Demo API with longer timeout
const demoApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds for demo (should be fast now)
})

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default api

// Jobs API
export const jobsApi = {
  getAll: () => api.get('/jobs'),
  get: (id: number) => api.get(`/jobs/${id}`),
  create: (data: any) => api.post('/jobs', data),
  update: (id: number, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: number) => api.delete(`/jobs/${id}`),
}

// Resume API
export const resumeApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return aiApi.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getLatest: () => api.get('/resume/latest'),
  getDemo: () => api.get('/resume/demo'),
  // Use direct backend URL (not Next rewrite) so it never breaks when dev server hops ports
  getViewUrl: () => `${API_BASE_URL}/resume/view`,
  getDemoViewUrl: () => `${API_BASE_URL}/resume/view-demo`,
  clearAll: () => api.post('/resume/clear'),
  getVersions: (jobId: number) => api.get(`/resume/versions/${jobId}`),
  optimize: (jobId: number, label?: string) => aiApi.post('/resume/optimize', { job_id: jobId, label }),
}

// Analysis API
export const analysisApi = {
  analyzeJD: (jobId: number, jdText: string) =>
    aiApi.post('/analysis/jd', { job_id: jobId, jd_text: jdText }),
  score: (jobId: number) => aiApi.post('/analysis/score', { job_id: jobId }),
  get: (jobId: number) => api.get(`/analysis/${jobId}`),
}

// Cover Letter API
export const coverLetterApi = {
  generate: (jobId: number, tone: string = 'professional') =>
    aiApi.post('/cover-letter/generate', { job_id: jobId, tone }),
}


// Settings API
export const settingsApi = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data: any) => api.put('/settings/profile', data),
}

// Demo API (uses faster client)
export const demoApi = {
  load: () => demoApiClient.post('/demo/load'),
  reset: () => demoApiClient.post('/demo/reset'),
}

// Exports API
export const exportsApi = {
  exportResume: (jobId: number) => api.get(`/exports/resume/${jobId}`, { responseType: 'blob' }),
  exportCoverLetter: (jobId: number) => api.get(`/exports/cover-letter/${jobId}`, { responseType: 'blob' }),
  exportInterviewPack: (jobId: number) => api.get(`/exports/interview-pack/${jobId}`, { responseType: 'blob' }),
  exportPackage: (jobId: number) => api.get(`/exports/package/${jobId}`, { responseType: 'blob' }),
}

// Roadmap API
export const roadmapApi = {
  get: (jobId: number) => api.get(`/roadmap/${jobId}`),
  generate: (jobId: number, timelineWeeks: number) => aiApi.post('/roadmap/generate', { job_id: jobId, timeline_weeks: timelineWeeks }),
}

// Practice API
export const practiceApi = {
  generateQuestion: (jobId: number, mode: string, previousQuestions?: string[]) =>
    api.post('/practice/question', { job_id: jobId, mode, previous_questions: previousQuestions }),
  scoreResponse: (jobId: number, question: string, response: string) =>
    api.post('/practice/score', { job_id: jobId, question, response }),
  getSessions: () => api.get('/practice/sessions'),
  generateCodingProblem: (jobId: number, difficulty: string) =>
    api.post('/practice/coding/problem', { job_id: jobId, difficulty }),
  reviewCode: (jobId: number, problem: any, code: string, testResults: any = {}) =>
    api.post('/practice/coding/review', { job_id: jobId, problem, code, test_results: testResults }),
}


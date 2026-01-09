'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Sparkles, FileText, Briefcase, GraduationCap, Code, Zap, Shield, Target, Map, Play } from 'lucide-react'
import { demoApi } from '@/lib/api'
import { useToast } from '@/components/ui/ToastProvider'

export default function Home() {
  const router = useRouter()
  const [loadingDemo, setLoadingDemo] = useState(false)
  const { pushToast } = useToast()

  const handleStartDemo = async () => {
    setLoadingDemo(true)
    try {
      const response = await demoApi.load()
      console.log('Demo response:', response.data)
      if (response.data && response.data.job_id) {
        router.push(`/jobs/${response.data.job_id}`)
      } else {
        console.error('Invalid response format:', response.data)
        pushToast({ type: 'error', title: 'Demo failed', message: 'Failed to load demo data: invalid response.' })
        setLoadingDemo(false)
      }
    } catch (error: any) {
      console.error('Failed to load demo:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      pushToast({
        type: 'error',
        title: 'Demo failed',
        message: error.response?.data?.detail || error.message || 'Unknown error',
      })
      setLoadingDemo(false)
    }
  }
  const features = [
    {
      icon: Sparkles,
      title: 'AI Pipeline',
      description: 'Multi-stage optimization',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: FileText,
      title: 'ATS-Safe PDFs',
      description: 'Professional exports',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Briefcase,
      title: 'Cover Letters',
      description: 'Tailored to each role',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: GraduationCap,
      title: 'Interview Prep',
      description: 'STAR scoring & practice',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Code,
      title: 'Coding Practice',
      description: 'Original problems',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Map,
      title: 'Learning Roadmap',
      description: 'Personalized prep plans',
      gradient: 'from-teal-500 to-blue-500',
    },
  ]

  const benefits = [
    { icon: Zap, text: 'Fast & Efficient' },
    { icon: Shield, text: '100% Private' },
    { icon: Target, text: 'Role-Specific' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">AI-Powered Career Tool</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Job Descriptions into
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 bg-clip-text text-transparent">
                Submission-Ready Applications
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered resume optimization, cover letter generation, and interview prep.
              <br />
              <span className="text-lg text-gray-500">All running locally on your machine.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleStartDemo}
                disabled={loadingDemo}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingDemo ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading Demo...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Demo</span>
                  </>
                )}
              </button>
              <Link 
                href="/jobs/new" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300"
              >
                Create Your First Job
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon
                return (
                  <div key={i} className="flex items-center gap-2 text-gray-600">
                    <Icon className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">{benefit.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features to help you land your dream job
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon with gradient background */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

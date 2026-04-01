'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Sparkles,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Zap,
  Shield,
  Target,
  Map,
  Play,
} from 'lucide-react'
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
        status: error.response?.status,
      })
      pushToast({
        type: 'error',
        title: 'Demo failed',
        message: error.response?.data?.detail || error.message || 'Unknown error',
      })
      setLoadingDemo(false)
    }
  }

  const features: {
    icon: LucideIcon
    title: string
    description: string
  }[] = [
    { icon: Sparkles, title: 'AI pipeline', description: 'Multi-stage optimization' },
    { icon: FileText, title: 'ATS-safe PDFs', description: 'Professional exports' },
    { icon: Briefcase, title: 'Cover letters', description: 'Tailored to each role' },
    { icon: GraduationCap, title: 'Interview prep', description: 'STAR scoring and practice' },
    { icon: Code, title: 'Coding practice', description: 'Original problems' },
    { icon: Map, title: 'Learning roadmap', description: 'Personalized prep plans' },
  ]

  const benefits = [
    { icon: Zap, text: 'Fast workflow' },
    { icon: Shield, text: 'Your data, your stack' },
    { icon: Target, text: 'Role-specific output' },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-700 mb-8">
              <Sparkles className="w-4 h-4 text-primary-600 shrink-0" aria-hidden />
              Career tooling with clear feedback
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-zinc-900 tracking-tight leading-[1.1] mb-6">
              Turn job descriptions into{' '}
              <span className="text-primary-600">submission-ready applications</span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-3 max-w-2xl mx-auto">
              Resume scoring, tailored cover letters, and interview prep—grounded in the actual posting.
            </p>
            <p className="text-sm sm:text-base text-zinc-500 mb-10 max-w-xl mx-auto">
              Start with a demo job or add a real listing to see your match and gaps in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-12">
              <button
                type="button"
                onClick={handleStartDemo}
                disabled={loadingDemo}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-primary-600 text-white font-semibold shadow-sm border border-primary-700/15 hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingDemo ? (
                  <>
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                    Loading demo…
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 shrink-0" aria-hidden />
                    Start demo
                  </>
                )}
              </button>
              <Link
                href="/jobs/new"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-white text-zinc-800 font-semibold border border-zinc-200 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
              >
                New job
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-600">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary-600 shrink-0" aria-hidden />
                    <span className="font-medium">{benefit.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-2">
            Everything in one flow
          </h2>
          <p className="text-zinc-600 max-w-lg mx-auto text-[15px] leading-relaxed">
            From parsing the JD to exports you can send as-is.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="group rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-zinc-300/90 transition-all duration-150"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg mb-4 bg-primary-100 text-primary-800 ring-1 ring-primary-200/80">
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <h3 className="font-display text-base font-semibold text-zinc-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

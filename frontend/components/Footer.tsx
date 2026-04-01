'use client'

import Link from 'next/link'
import { Sparkles, Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto bg-zinc-900 text-zinc-400 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
                <Sparkles className="w-[18px] h-[18px]" aria-hidden />
              </span>
              <span className="font-display text-lg font-semibold text-white tracking-tight">PathToOffer AI</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md mb-4">
              Tailor your resume, cover letter, and interview prep to each role—so you know exactly how you stack up before you hit submit.
            </p>
            <p className="text-xs text-zinc-500">Your application data stays under your control.</p>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Product</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/jobs" className="text-zinc-400 hover:text-white transition-colors">
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/practice" className="text-zinc-400 hover:text-white transition-colors">
                  Interview practice
                </Link>
              </li>
              <li>
                <Link href="/coding" className="text-zinc-400 hover:text-white transition-colors">
                  Coding practice
                </Link>
              </li>
              <li>
                <Link href="/exports" className="text-zinc-400 hover:text-white transition-colors">
                  Exports
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Account</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/account" className="text-zinc-400 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <span className="text-zinc-500">Privacy</span>
              </li>
              <li>
                <span className="text-zinc-500">Terms</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} PathToOffer AI</p>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:support@pathtooffer.ai"
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

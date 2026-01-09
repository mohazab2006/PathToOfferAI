'use client'

import Link from 'next/link'
import { Sparkles, Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-1.5 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                PathToOffer AI
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Turn job descriptions into submission-ready applications with AI-powered optimization.
              All running locally on your machine.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🔒</span>
              <span>Your data stays on your machine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/practice" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Interview Practice
                </Link>
              </li>
              <li>
                <Link href="/coding" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Coding Practice
                </Link>
              </li>
              <li>
                <Link href="/exports" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Exports
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Profile Settings
                </Link>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Privacy Policy</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} PathToOffer AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:support@pathtooffer.ai" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}



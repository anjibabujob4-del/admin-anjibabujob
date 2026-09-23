'use client'

import Link from 'next/link'
import { BriefcaseBusiness, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function CustomerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-md shadow-sm">
              <BriefcaseBusiness className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-xl font-extrabold text-blue-950 tracking-tight">
              ANJIBABU<span className="text-orange-600">JOB</span>.COM
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/jobs" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            Find Jobs
          </Link>
          <Link href="/admin/login" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            Admin
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-600 hover:text-blue-600 focus:outline-none p-2 -mr-2"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-slate-50"
          >
            Home
          </Link>
          <Link 
            href="/jobs" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-slate-50"
          >
            Find Jobs
          </Link>
          <Link 
            href="/admin/login" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-md hover:bg-slate-50"
          >
            Admin Login
          </Link>
        </div>
      )}
    </header>
  )
}

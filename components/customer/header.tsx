import Link from 'next/link'
import { BriefcaseBusiness } from 'lucide-react'

export default function CustomerHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <BriefcaseBusiness className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-xl font-extrabold text-blue-900 tracking-tight">
              ANJIBABU<span className="text-orange-600">JOB</span>.COM
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/jobs" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
            Find Jobs
          </Link>
        </nav>
      </div>
    </header>
  )
}

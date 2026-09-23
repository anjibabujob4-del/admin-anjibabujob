'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, FileText, Settings, LogOut, Menu, X, Users, Tags } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Applications', href: '/admin/applications', icon: FileText },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="bg-blue-600 p-1.5 rounded-md shadow-sm">
            <Briefcase className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            ADMIN<span className="text-orange-500">PANEL</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-950 hover:text-red-400 text-slate-400 transition-colors font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 shrink-0 border-r border-slate-200">
        <div className="fixed inset-y-0 w-72">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar & Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200 shadow-sm">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-md shadow-sm">
              <Briefcase className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              ADMIN<span className="text-orange-600">PANEL</span>
            </span>
          </Link>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger>
              <div className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 cursor-pointer">
                <Menu className="w-6 h-6" />
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-slate-800">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight,
  Briefcase,
  Search,
  Star,
  Zap,
  Truck,
  Car,
  Milk,
  Package,
  Handshake,
  Hammer,
  Droplets,
  Wrench,
  Bike,
  Home,
  Broom,
  Shield,
  Monitor,
} from 'lucide-react'

// Icon mapping for all 15 categories from poster
const CategoryIconMap: Record<string, any> = {
  'Loading & Unloading': Truck,
  'Drivers': Car,
  'Milk Suppliers': Milk,
  'Distributors': Package,
  'Marketing Executive': Briefcase,
  'Working Partners': Handshake,
  'Iron Staff': Hammer,
  'Washing Staff': Droplets,
  'Technical Staff': Wrench,
  'Delivery Boys': Bike,
  'House Keepers': Home,
  'Cleaning Staff': Broom,
  'Security Guards': Shield,
  'Maintenance Staff': Wrench,
  'Office Staff': Monitor,
}

// 15 Default Categories matching poster
const defaultCategories = [
  { name: 'Loading & Unloading', slug: 'loading-unloading' },
  { name: 'Drivers', slug: 'drivers' },
  { name: 'Milk Suppliers', slug: 'milk-suppliers' },
  { name: 'Distributors', slug: 'distributors' },
  { name: 'Marketing Executive', slug: 'marketing-executive' },
  { name: 'Working Partners', slug: 'working-partners' },
  { name: 'Iron Staff', slug: 'iron-staff' },
  { name: 'Washing Staff', slug: 'washing-staff' },
  { name: 'Technical Staff', slug: 'technical-staff' },
  { name: 'Delivery Boys', slug: 'delivery-boys' },
  { name: 'House Keepers', slug: 'house-keepers' },
  { name: 'Cleaning Staff', slug: 'cleaning-staff' },
  { name: 'Security Guards', slug: 'security-guards' },
  { name: 'Maintenance Staff', slug: 'maintenance-staff' },
  { name: 'Office Staff', slug: 'office-staff' },
]

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch categories from DB
  const { data: dbCategories } = await supabase
    .from('job_categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  // Merge DB categories with default slugs
  const displayCategories =
    dbCategories && dbCategories.length > 0
      ? dbCategories.map((c) => ({
          name: c.name,
          slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        }))
      : defaultCategories

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white overflow-hidden">
        {/* Background Accent Gradients */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400 via-transparent to-transparent" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />

        <div className="container relative mx-auto px-4 py-20 lg:py-28 flex flex-col items-center text-center">
          {/* Priority Pill */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-800/60 border border-yellow-400/30 mb-8 backdrop-blur-md shadow-inner">
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-yellow-300 uppercase">
              Your Needs, Our Priority
            </span>
          </div>

          {/* Poster Tagline & Header */}
          <p className="text-lg md:text-2xl font-light text-blue-200 mb-3 tracking-wide">
            Better Jobs, <span className="font-bold text-yellow-400">Brighter Future</span>
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 leading-none uppercase">
            <span className="block text-yellow-400 drop-shadow-md">WE ARE</span>
            <span className="block text-white drop-shadow-lg">HIRING</span>
          </h1>

          <div className="inline-block bg-orange-600/90 text-white text-base md:text-xl font-bold px-6 py-2 rounded-lg shadow-md mb-8">
            All Types of Workers Needed
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/jobs" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black text-lg h-14 px-8 rounded-xl shadow-xl transition-transform hover:scale-105"
              >
                <Search className="mr-2 w-5 h-5 text-blue-950" />
                Find Jobs
              </Button>
            </Link>
            <Link href="/jobs/cleaning-staff" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold text-lg h-14 px-8 rounded-xl shadow-lg transition-all"
              >
                Cleaning Staff
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-[40px] md:h-[70px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,137.9,132.8,204.4,119.6,243.6,111.8,283.4,85.3,321.39,56.44Z"
              className="fill-slate-50"
            />
          </svg>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mt-3 mb-3">
              Explore All Job Categories
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              Click any category card to see published job openings, salary details, and apply immediately.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {displayCategories.map((cat, idx) => {
              const IconComp = CategoryIconMap[cat.name] || Briefcase

              // Vibrant brand-themed color accents
              const colors = [
                'bg-blue-100 text-blue-800 group-hover:bg-blue-600 group-hover:text-white',
                'bg-amber-100 text-amber-800 group-hover:bg-amber-500 group-hover:text-slate-950',
                'bg-orange-100 text-orange-800 group-hover:bg-orange-500 group-hover:text-white',
                'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white',
                'bg-red-100 text-red-800 group-hover:bg-red-600 group-hover:text-white',
              ]
              const colorClass = colors[idx % colors.length]

              return (
                <Link
                  key={idx}
                  href={`/jobs/${cat.slug}`}
                  className="group block focus:outline-none"
                >
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5 group-hover:border-blue-400 text-center h-full flex flex-col items-center justify-center gap-3">
                    <div
                      className={`p-4 rounded-2xl transition-colors duration-300 shadow-sm ${colorClass}`}
                    >
                      <IconComp className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-700 transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-slate-400 group-hover:text-blue-500 font-medium inline-flex items-center gap-1 transition-colors">
                      View Jobs <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 uppercase tracking-tight">
            Ready to Start Your Career?
          </h2>
          <p className="text-lg md:text-xl text-orange-100 mb-8 max-w-2xl mx-auto font-light">
            Connect directly with verified employers across India. Apply in minutes with zero charges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-slate-100 font-bold text-lg h-14 px-8 rounded-xl shadow-xl"
              >
                Browse All Openings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

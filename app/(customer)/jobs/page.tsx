import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, IndianRupee, Briefcase, Clock, Search, Phone } from 'lucide-react'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  
  // Resolve searchParams promise in Next.js 15
  const params = await searchParams
  const categoryParam = typeof params.category === 'string' ? params.category : ''
  const searchParam = typeof params.q === 'string' ? params.q : ''

  // Build Query
  let query = supabase
    .from('jobs')
    .select(`*, job_categories(name)`)
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })

  if (categoryParam) {
    // We would ideally filter by category ID or do a join filter, but since job_categories(name) is nested:
    // Supabase allows filtering on nested tables like: job_categories!inner(name)
    query = supabase
      .from('jobs')
      .select(`*, job_categories!inner(name)`)
      .eq('status', 'PUBLISHED')
      .eq('job_categories.name', categoryParam)
      .order('created_at', { ascending: false })
  }

  if (searchParam) {
    query = query.ilike('title', `%${searchParam}%`)
  }

  const { data: jobs, error } = await query

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Find Your Next Job</h1>
          <p className="text-gray-600 mt-1">Browse all available opportunities at ANJIBABUJOB.COM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <details className="group" open>
              <summary className="font-semibold text-lg p-4 cursor-pointer lg:cursor-text lg:pointer-events-none list-none flex justify-between items-center bg-slate-50 border-b border-slate-100">
                <span className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Search & Filter
                </span>
                <span className="lg:hidden text-slate-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <CardContent className="p-4 pt-4 lg:p-6 lg:pt-6 bg-white">
                <form className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Keywords</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        name="q" 
                        defaultValue={searchParam}
                        placeholder="Job title..." 
                        className="pl-9 h-10 bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                  {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 mt-2">
                    Apply Filters
                  </Button>
                  {(searchParam || categoryParam) && (
                     <Link href="/jobs" className="block text-center text-sm text-red-500 hover:text-red-700 hover:underline mt-3 transition-colors">
                       Clear All Filters
                     </Link>
                  )}
                </form>
              </CardContent>
            </details>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="lg:col-span-3">
          {error ? (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg">
              Failed to load jobs. Please try again later.
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
              <p className="text-gray-500">We couldn&apos;t find any jobs matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="transition-all hover:shadow-lg border-slate-200/60 hover:border-blue-200 group">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-5 sm:gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start justify-between">
                          <h2 className="text-xl sm:text-2xl font-bold text-blue-950 line-clamp-2 group-hover:text-blue-700 transition-colors">
                            {job.title}
                          </h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">
                            <Briefcase className="w-4 h-4" />
                            {job.job_categories?.name || 'General'}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                            <Clock className="w-4 h-4" />
                            {job.employment_type}
                          </span>
                          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-md font-semibold">
                            <IndianRupee className="w-4 h-4" />
                            ₹{job.salary_min} - ₹{job.salary_max}
                          </span>
                          <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md font-medium">
                            <Phone className="w-4 h-4" />
                            6309981555
                          </span>
                        </div>
                        
                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end justify-between min-w-[140px] gap-4 md:gap-0 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <span className="text-xs font-medium text-slate-400">
                          Posted: {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        <Link href={`/jobs/${job.id}`} className="w-full md:w-auto">
                          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold transition-transform active:scale-95">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

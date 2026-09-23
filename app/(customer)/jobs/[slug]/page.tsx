import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  IndianRupee,
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
  Phone,
} from 'lucide-react'
import type { Metadata } from 'next'

// Dynamic SEO metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  // Check category
  const { data: cat } = await supabase
    .from('job_categories')
    .select('name')
    .or(`slug.eq.${slug},name.ilike.${slug.replace(/-/g, ' ')}`)
    .maybeSingle()

  if (cat) {
    return {
      title: `${cat.name} Jobs | ANJIBABUJOB.COM`,
      description: `Find the latest ${cat.name} job opportunities in Hyderabad and across India. Apply today on ANJIBABUJOB.COM.`,
    }
  }

  // Check job
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  const { data: job } = await supabase
    .from('jobs')
    .select('title, location, job_categories(name)')
    .or(`slug.eq.${slug}${isUuid ? `,id.eq.${slug}` : ''}`)
    .maybeSingle()

  if (job) {
    return {
      title: `${job.title} | ANJIBABUJOB.COM`,
      description: `Apply for ${job.title} in ${job.location || 'Multiple Locations'}. Better Jobs, Brighter Future with ANJIBABUJOB.COM.`,
    }
  }

  return {
    title: 'Jobs | ANJIBABUJOB.COM',
  }
}

export default async function DynamicJobOrCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // -------------------------------------------------------------
  // 1. Check if slug matches a Category
  // -------------------------------------------------------------
  const { data: category } = await supabase
    .from('job_categories')
    .select('*')
    .or(`slug.eq.${slug},name.ilike.${slug.replace(/-/g, ' ')}`)
    .maybeSingle()

  if (category) {
    // Fetch only PUBLISHED jobs for this category
    const { data: categoryJobs } = await supabase
      .from('jobs')
      .select('*, job_categories(name, slug)')
      .eq('category_id', category.id)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })

    const jobsList = categoryJobs || []

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Category Header Hero */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white py-14 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent" />
          <div className="container mx-auto max-w-6xl relative z-10">
            <Link
              href="/jobs"
              className="inline-flex items-center text-sm text-blue-200 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to all categories
            </Link>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Openings
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase mb-3">
              {category.name} <span className="text-yellow-400">JOBS</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl font-light">
              Find the latest {category.name} opportunities. Direct hiring with competitive salary and perks.
            </p>
          </div>
        </section>

        {/* Category Jobs Listing */}
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Available Positions ({jobsList.length})
              </h2>
              <p className="text-slate-500 text-sm">All jobs posted directly by authorized recruiters.</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700">
                View All Categories
              </Button>
            </Link>
          </div>

          {jobsList.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 bg-white shadow-none text-center py-16 px-4">
              <CardContent className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  No {category.name} jobs are currently available.
                </h3>
                <p className="text-slate-600 text-sm">
                  Please check back soon. New opportunities are added regularly across Hyderabad and other regions.
                </p>
                <div className="pt-2">
                  <Link href="/jobs">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
                      VIEW ALL JOBS
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobsList.map((job) => (
                <Card
                  key={job.id}
                  className="group bg-white hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-300 flex flex-col justify-between"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0 font-medium text-xs">
                          {job.job_categories?.name || category.name}
                        </Badge>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Meta info tags */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-semibold text-green-700 truncate">
                        <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          ₹{job.salary_min?.toLocaleString() || '15,000'} - ₹{job.salary_max?.toLocaleString() || '25,000'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.employment_type || 'Full-Time'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.vacancies ? `${job.vacancies} Vacancies` : 'Multiple Openings'}</span>
                      </div>
                    </div>

                    {/* View Job CTA */}
                    <div className="pt-2">
                      <Link href={`/jobs/${job.slug || job.id}`} className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors">
                          VIEW JOB
                          <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // 2. Check if slug matches a Job (by slug or UUID id)
  // -------------------------------------------------------------
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*, job_categories(id, name, slug)')
    .or(`slug.eq.${slug}${isUuid ? `,id.eq.${slug}` : ''}`)
    .maybeSingle()

  if (!job || jobError) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={job.job_categories?.slug ? `/jobs/${job.job_categories.slug}` : '/jobs'}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {job.job_categories?.name || 'Jobs'}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="border-b pb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className="bg-blue-100 text-blue-800 border-0 font-medium">
                      {job.job_categories?.name || 'General'}
                    </Badge>
                    <Badge variant="outline" className="text-slate-600">
                      {job.employment_type}
                    </Badge>
                  </div>

                  <h1 className="text-2xl md:text-4xl font-extrabold text-blue-900 mb-4">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-green-700">
                      <IndianRupee className="w-4 h-4" />
                      ₹{job.salary_min?.toLocaleString() || '15,000'} - ₹{job.salary_max?.toLocaleString() || '25,000'} / month
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      {job.vacancies || 1} Vacancies
                    </span>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-900">Job Description</h2>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Responsibilities */}
                {job.responsibilities && (
                  <div className="space-y-3 pt-4 border-t">
                    <h2 className="text-lg font-bold text-slate-900">Responsibilities</h2>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {job.responsibilities}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements && (
                  <div className="space-y-3 pt-4 border-t">
                    <h2 className="text-lg font-bold text-slate-900">Requirements & Qualifications</h2>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {job.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sticky Sidebar with Apply Button */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Job Summary</h3>
                  <ul className="space-y-3.5 text-sm">
                    <li className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs">Posted Date</p>
                        <p className="font-medium text-slate-900">
                          {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs">Experience</p>
                        <p className="font-medium text-slate-900">
                          {job.experience || 'Fresher / All levels welcome'}
                        </p>
                      </div>
                    </li>

                    {job.application_deadline && (
                      <li className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-slate-500 text-xs">Application Deadline</p>
                          <p className="font-medium text-slate-900">
                            {new Date(job.application_deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    )}

                    <li className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs">Contact HR</p>
                        <p className="font-medium text-slate-900">
                          <a href="tel:6309981555" className="hover:text-blue-600 underline-offset-2 hover:underline">
                            6309981555
                          </a>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <Link href={`/apply/${job.id}`} className="block">
                    <Button
                      size="lg"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-lg h-14 shadow-lg transition-transform hover:scale-[1.02]"
                    >
                      APPLY NOW
                    </Button>
                  </Link>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Fast & simple online application. No fees required.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

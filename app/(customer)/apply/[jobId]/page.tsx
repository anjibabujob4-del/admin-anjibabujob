import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ApplyFormClient from './ApplyFormClient'
import { AlertCircle, Briefcase, MapPin, IndianRupee, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const supabase = await createClient()

  // Get user if logged in (optional - not required)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch candidate profile to pre-fill form if logged in
  const profile = user ? await supabase
    .from('profiles')
    .select('full_name, mobile')
    .eq('id', user.id)
    .single()
    .then(r => r.data) : null

  // Fetch job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*, job_categories(name, slug)')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    notFound()
  }

  if (job.status !== 'PUBLISHED') {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Applications Closed</h1>
        <p className="text-slate-600 mb-6">
          This position is currently not accepting new applications.
        </p>
        <Link href="/jobs">
          <button className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg">
            Browse Other Openings
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href={`/jobs/${job.slug || job.id}`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to job details
        </Link>

        {/* Job Overview Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                {job.job_categories?.name || 'Recruitment'}
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">{job.title}</h1>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Offered Salary</span>
              <span className="text-lg font-bold text-green-700 flex items-center justify-end">
                <IndianRupee className="w-4 h-4" />
                ₹{job.salary_min?.toLocaleString() || '15,000'} - ₹{job.salary_max?.toLocaleString() || '25,000'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              {job.employment_type}
            </span>
          </div>
        </div>

        {/* Application Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50/80 border-b">
            <CardTitle className="text-xl font-bold text-slate-900">
              Submit Your Application
            </CardTitle>
            <CardDescription>
              Complete the details below. Our recruitment team will review your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <ApplyFormClient
              jobId={jobId}
              userProfile={{
                fullName: profile?.full_name || '',
                mobile: profile?.mobile || '',
                email: user?.email || '',
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

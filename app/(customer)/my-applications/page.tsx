import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ChevronRight, Briefcase, Calendar, MapPin } from 'lucide-react'

// Status Badge Color Mapping
const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  SHORTLISTED: 'bg-purple-100 text-purple-800',
  INTERVIEW: 'bg-orange-100 text-orange-800',
  SELECTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-slate-100 text-slate-800',
}

const STAGE_ORDER = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED']

export default async function MyApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch applications for this user (if logged in)
  const { data: applications, error } = user ? await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        location,
        job_categories (name, slug)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) : { data: [], error: null }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-950">My Applications</h1>
          <p className="text-slate-600 mt-1">Track your submitted applications and interview status in real-time.</p>
        </div>
        <Link href="/jobs">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
            Browse More Jobs
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {error ? (
          <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
            Failed to load applications. Please try refreshing the page.
          </div>
        ) : !applications || applications.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 shadow-none bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <div className="bg-blue-100 p-4 rounded-2xl mb-4 text-blue-600">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Applications Yet</h3>
              <p className="text-slate-500 mb-6 text-sm">
                You haven't applied for any jobs yet. Explore all categories to find the job that fits you best.
              </p>
              <Link href="/jobs">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
                  Browse All Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app: any) => {
              const currentIdx = STAGE_ORDER.indexOf(app.status)

              return (
                <Card
                  key={app.id}
                  className="bg-white transition-all hover:shadow-lg hover:border-blue-300 flex flex-col justify-between border-slate-200"
                >
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded font-semibold">
                        {app.application_number}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[app.status]} border-0 font-bold text-xs`}
                      >
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-blue-950 line-clamp-1">
                      {app.jobs?.title || 'Job Application'}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">
                          {app.jobs?.job_categories?.name || 'General Category'}
                        </span>
                      </div>
                      {app.jobs?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{app.jobs.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Step indicator */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                        <span>Submitted</span>
                        <span>Under Review</span>
                        <span>Shortlisted</span>
                        <span>Selected</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 ${
                            app.status === 'REJECTED'
                              ? 'bg-red-500 w-full'
                              : currentIdx >= 4
                              ? 'bg-green-500 w-full'
                              : currentIdx >= 2
                              ? 'bg-purple-500 w-3/4'
                              : currentIdx >= 1
                              ? 'bg-yellow-500 w-1/2'
                              : 'bg-blue-500 w-1/4'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href={`/my-applications/${app.id}`} className="block w-full">
                        <Button
                          variant="outline"
                          className="w-full justify-between hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-semibold text-sm h-10"
                        >
                          VIEW APPLICATION
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  IndianRupee,
  AlertCircle,
  XCircle,
} from 'lucide-react'

// Application progression steps
const STAGES = [
  { key: 'SUBMITTED', label: 'Application Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview Scheduled' },
  { key: 'SELECTED', label: 'Selected' },
]

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  SHORTLISTED: 'bg-purple-100 text-purple-800',
  INTERVIEW: 'bg-orange-100 text-orange-800',
  SELECTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-slate-100 text-slate-800',
}

export default async function CustomerApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>
}) {
  const { applicationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect_to=/my-applications/${applicationId}`)
  }

  // Fetch application details for this authenticated candidate
  const { data: application, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        location,
        salary_min,
        salary_max,
        employment_type,
        job_categories (name, slug)
      )
    `)
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (error || !application) {
    notFound()
  }

  // Fetch candidate answers
  const { data: answers } = await supabase
    .from('application_answers')
    .select('value, application_fields(label)')
    .eq('application_id', applicationId)

  // Fetch candidate uploaded documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('application_id', applicationId)

  // Fetch timeline history
  const { data: history } = await supabase
    .from('application_status_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })

  // Calculate current stage index
  const currentStageIndex = STAGES.findIndex((s) => s.key === application.status)
  const isRejected = application.status === 'REJECTED'

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <Link
          href="/my-applications"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to My Applications
        </Link>

        {/* Top Header Card */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold">
                    {application.application_number}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`${statusColors[application.status]} border-0 font-bold px-3 py-1`}
                  >
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">
                  {application.jobs?.title || 'Job Application'}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Category: {application.jobs?.job_categories?.name || 'General'} • Applied on{' '}
                  {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>

              {application.jobs?.id && (
                <Link href={`/jobs/${application.jobs.id}`}>
                  <Button variant="outline" size="sm" className="border-slate-300">
                    View Job Posting
                  </Button>
                </Link>
              )}
            </div>

            {/* Application Timeline Tracker */}
            <div className="pt-8">
              <h3 className="font-bold text-slate-900 text-base mb-6">Application Status Timeline</h3>

              {isRejected ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
                  <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <p className="font-bold">Application Not Selected</p>
                    <p className="text-sm text-red-700">
                      Thank you for applying. Currently the team has progressed with other candidates for this specific opening.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                  {STAGES.map((stage, idx) => {
                    const isDone = currentStageIndex >= idx
                    const isCurrent = currentStageIndex === idx

                    return (
                      <div
                        key={stage.key}
                        className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                            : isDone
                            ? 'bg-green-50/60 border-green-300'
                            : 'bg-white border-slate-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : isDone
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {stage.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold text-blue-600 mt-1 uppercase">
                            Current Stage
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details & Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submitted Information */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50/80 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-900">
                Submitted Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-sm">
              {answers && answers.length > 0 ? (
                answers.map((a: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start border-b pb-2 last:border-0">
                    <span className="text-slate-500 font-medium">{a.application_fields?.label || 'Detail'}</span>
                    <span className="text-slate-900 font-semibold text-right max-w-[60%]">{a.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No specific questionnaire answers.</p>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50/80 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-900">
                Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {documents && documents.length > 0 ? (
                documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.file_name}</p>
                        <p className="text-[11px] text-slate-500">{(doc.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded">
                      Uploaded
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs italic">No documents attached.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

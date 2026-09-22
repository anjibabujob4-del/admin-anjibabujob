import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import StatusUpdateForm from './StatusUpdateForm'
import DocumentLink from './DocumentLink'
import { User, Briefcase, FileText, History, Calendar, CheckCircle } from 'lucide-react'

// Status Badge Color Mapping
const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  SHORTLISTED: 'bg-purple-100 text-purple-800',
  INTERVIEW: 'bg-orange-100 text-orange-800',
  SELECTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

export default async function AdminApplicationDetailsPage({
  params,
}: {
  params: Promise<{ applicationId: string }>
}) {
  const { applicationId } = await params
  const supabase = await createClient()

  // Fetch application details
  const { data: application, error } = await supabase
    .from('applications')
    .select(`
      *,
      profiles:user_id(full_name, mobile),
      jobs:job_id(title, location)
    `)
    .eq('id', applicationId)
    .single()

  if (error || !application) {
    notFound()
  }

  // Fetch dynamic answers
  const { data: answers } = await supabase
    .from('application_answers')
    .select('value, application_fields(label, type)')
    .eq('application_id', applicationId)

  // Fetch documents
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('application_id', applicationId)

  // Fetch status history
  const { data: history } = await supabase
    .from('application_status_history')
    .select('*, profiles:changed_by(full_name)')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  const candidateName =
    application.profiles?.full_name ||
    (answers as any[])?.find((a) => a.application_fields?.field_name === 'full_name')?.value ||
    'Direct Applicant'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{candidateName}</h1>
            <Badge variant="secondary" className={`${statusColors[application.status]} border-0 font-semibold text-sm px-3 py-1`}>
              {application.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-slate-600 font-mono text-sm">Application ID: {application.application_number}</p>
        </div>
        <Link href="/admin/applications" className="text-sm text-blue-600 hover:underline font-medium">
          &larr; Back to Applications
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Applied Position</p>
                <p className="font-semibold text-slate-900">{application.jobs?.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Location</p>
                <p className="font-semibold text-slate-900">{application.jobs?.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Applied Date</p>
                <p className="font-semibold text-slate-900">{new Date(application.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Application Answers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {answers && answers.length > 0 ? (
                (answers as any[]).map((answer, idx) => (
                  <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                    <p className="text-sm font-medium text-slate-500 mb-1">{answer.application_fields?.label}</p>
                    {answer.application_fields?.type === 'file' ? (
                      <p className="text-sm italic text-slate-400">File uploaded (See Documents section)</p>
                    ) : (
                      <p className="text-slate-900 whitespace-pre-wrap">{answer.value}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No dynamic form answers provided.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents
              </CardTitle>
              <CardDescription>Securely view candidate uploaded documents</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {documents && documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 border rounded-lg bg-white shadow-sm flex items-center justify-between">
                      <div className="truncate pr-4 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                        <p className="text-xs text-slate-500 uppercase">{doc.file_type.split('/')[1] || 'FILE'} • {(doc.size / 1024).toFixed(0)} KB</p>
                      </div>
                      {/* DocumentLink is a Client Component that requests the signed URL securely */}
                      <DocumentLink filePath={doc.file_path} fileName={doc.file_name} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No documents uploaded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Status & Workflow) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-blue-200 shadow-md">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-lg text-blue-900">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <StatusUpdateForm applicationId={application.id} currentStatus={application.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-slate-600" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {history && history.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {history.map((record, idx) => (
                    <div key={record.id} className="relative flex items-start gap-4">
                      <div className="absolute left-0 ml-1.5 md:ml-auto md:right-1/2 md:translate-x-1/2 mt-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white z-10" />
                      <div className="pl-8 md:pl-0 w-full z-20">
                        <p className="text-sm font-bold text-slate-900">{record.new_status.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(record.created_at).toLocaleString()} by {record.profiles?.full_name || 'System'}
                        </p>
                        {record.reason && (
                          <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border mt-2">
                            {record.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No history available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

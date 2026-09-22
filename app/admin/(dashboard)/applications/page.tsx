import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''
  const status = typeof params.status === 'string' ? params.status : ''

  const supabase = await createClient()

  let query = supabase
    .from('applications')
    .select('*, profiles(full_name, mobile), jobs(title), application_answers(value, application_fields(field_name))')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: applications } = await query

  // Map candidate name & phone from profiles OR application_answers
  const mappedApps = (applications || []).map((app: any) => {
    const answers = app.application_answers || []
    const getAnswer = (name: string) =>
      answers.find((a: any) => a.application_fields?.field_name === name)?.value
    const candidateName = app.profiles?.full_name || getAnswer('full_name') || 'Direct Applicant'
    const candidatePhone = app.profiles?.mobile || getAnswer('mobile') || '—'
    return {
      ...app,
      candidateName,
      candidatePhone,
    }
  })

  // Client-side filtering by name/app number for simplicity
  const filteredApps = mappedApps.filter(app => {
    if (!q) return true
    const searchLower = q.toLowerCase()
    return (
      app.application_number.toLowerCase().includes(searchLower) ||
      app.candidateName.toLowerCase().includes(searchLower) ||
      app.candidatePhone.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <form className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                name="q"
                defaultValue={q}
                placeholder="Search candidate or App ID..." 
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                name="status" 
                defaultValue={status}
                className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Button type="submit">Filter</Button>
            </div>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4">App ID</th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Job</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps && filteredApps.length > 0 ? (
                  filteredApps.map((app: any) => (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{app.application_number}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{app.candidateName}</td>
                      <td className="px-6 py-4 text-slate-600">{app.candidatePhone}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{app.jobs?.title || 'Unknown Job'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/applications/${app.id}`}>
                          <Button variant="outline" size="sm" className="h-8">VIEW</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No applications found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

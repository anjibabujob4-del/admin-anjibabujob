import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, FileText, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch basic stats
  const [
    { count: jobsCount },
    { count: appsCount },
    { count: pendingAppsCount },
    { count: selectedAppsCount }
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'SELECTED'),
  ])

  // Fetch recent applications
  const { data: recentApps } = await supabase
    .from('applications')
    .select('*, profiles(full_name), jobs(title)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Jobs</p>
              <h3 className="text-3xl font-bold text-slate-900">{jobsCount || 0}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Applications</p>
              <h3 className="text-3xl font-bold text-slate-900">{appsCount || 0}</h3>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">New Applications</p>
              <h3 className="text-3xl font-bold text-orange-600">{pendingAppsCount || 0}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Selected</p>
              <h3 className="text-3xl font-bold text-green-600">{selectedAppsCount || 0}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Recent Applications</CardTitle>
          <Link href="/admin/applications">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y">
                <tr>
                  <th className="px-4 py-3">App ID</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApps && recentApps.length > 0 ? (
                  recentApps.map((app: any) => (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{app.application_number}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{app.profiles?.full_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-slate-600">{app.jobs?.title || 'Unknown Job'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-semibold bg-slate-100 rounded-full">
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No applications found.
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

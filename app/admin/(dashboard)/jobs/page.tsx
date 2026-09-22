import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, ExternalLink, Play, Pause, Trash2 } from 'lucide-react'
import JobRowActions from './JobRowActions'

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q.trim() : ''
  const status = typeof params.status === 'string' ? params.status : ''
  const category = typeof params.category === 'string' ? params.category : ''

  const supabase = await createClient()

  // Fetch categories for filter dropdown
  const { data: categories } = await supabase
    .from('job_categories')
    .select('id, name')
    .order('name', { ascending: true })

  // Query jobs with application count
  let query = supabase
    .from('jobs')
    .select('*, job_categories(name), applications(count)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }
  if (category) {
    query = query.eq('category_id', category)
  }
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: jobs } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Management</h1>
          <p className="text-slate-500 text-sm">Create, publish, and manage job listings across categories.</p>
        </div>
        <Link href="/admin/jobs/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4 border-b">
          <form className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search jobs by title..."
                className="pl-9"
              />
            </div>

            <select
              name="category"
              defaultValue={category}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <select
                name="status"
                defaultValue={status}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="PAUSED">Paused</option>
                <option value="CLOSED">Closed</option>
              </select>

              <Button type="submit" variant="secondary" className="shrink-0">
                Filter
              </Button>
            </div>
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applications</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job: any) => {
                    const appCount = job.applications?.[0]?.count ?? 0
                    const statusClass =
                      job.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : job.status === 'CLOSED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{job.title}</p>
                          <p className="text-xs text-slate-500">{job.employment_type} • {job.vacancies} vacancies</p>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {job.job_categories?.name || 'General'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{job.location}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className={`${statusClass} border-0 font-medium`}>
                            {job.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/applications?job=${job.id}`}
                            className="inline-flex items-center text-blue-600 hover:underline font-semibold"
                          >
                            {appCount} candidate{appCount === 1 ? '' : 's'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(job.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <JobRowActions job={job} />
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                      <p className="font-medium text-slate-700 mb-1">No jobs found</p>
                      <p className="text-xs mb-4">Click "Create Job" to post your first recruitment opening.</p>
                      <Link href="/admin/jobs/new">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="w-4 h-4 mr-1" />
                          Create Job
                        </Button>
                      </Link>
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

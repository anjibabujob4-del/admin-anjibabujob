import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''

  let query = supabase
    .from('jobs')
    .select(`*, job_categories(name)`)
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: jobs, error } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Jobs Management</h1>
          <p className="text-slate-500 mt-1">Create and manage job postings</p>
        </div>
        <Link href="/admin/jobs/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
          <form className="flex max-w-sm relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              name="q"
              defaultValue={q}
              placeholder="Search jobs..." 
              className="pl-9 h-9 bg-white"
            />
            <Button type="submit" variant="secondary" className="ml-2 h-9 hidden sm:flex">
              Search
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[300px] font-semibold text-slate-700">Job Title</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700 hidden md:table-cell">Location</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 hidden lg:table-cell">Date Posted</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!jobs || jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No jobs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {job.title}
                        <div className="text-xs text-slate-500 md:hidden mt-1">{job.location}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700">
                          {job.job_categories?.name || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 hidden md:table-cell">
                        {job.location}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={job.status === 'PUBLISHED' ? 'default' : 'secondary'}
                          className={job.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 hidden lg:table-cell">
                        {new Date(job.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 p-0 items-center justify-center rounded-md hover:bg-slate-100 text-slate-500">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <Link href={`/jobs/${job.id}`} target="_blank" className="cursor-pointer">
                              <DropdownMenuItem>
                                View Public Page
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <Link href={`/admin/jobs/${job.id}/edit`} className="cursor-pointer">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                Edit Job
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

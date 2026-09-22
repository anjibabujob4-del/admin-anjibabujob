import { createClient } from '@/lib/supabase/server'
import CreateJobForm from './CreateJobForm'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default async function NewJobPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('job_categories')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs" className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-2xl font-bold text-slate-900">Create New Job Posting</CardTitle>
          <CardDescription>
            Post a new recruitment opportunity. Once published, it will be instantly visible to job seekers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <CreateJobForm categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  )
}

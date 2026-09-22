'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink, Play, Pause, Trash2, Loader2 } from 'lucide-react'
import { toggleJobStatus, deleteJob } from '@/app/actions/admin'

export default function JobRowActions({ job }: { job: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggleStatus() {
    const nextStatus = job.status === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED'
    setLoading(true)
    await toggleJobStatus(job.id, nextStatus)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${job.title}"? This cannot be undone.`)) {
      return
    }
    setLoading(true)
    await deleteJob(job.id)
    setLoading(false)
    router.refresh()
  }

  const liveSlug = job.slug || job.id

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* View Live */}
      <Link href={`/jobs/${liveSlug}`} target="_blank">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600" title="View on website">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </Link>

      {/* Toggle Publish / Pause */}
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={handleToggleStatus}
        className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600"
        title={job.status === 'PUBLISHED' ? 'Pause job' : 'Publish job'}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : job.status === 'PUBLISHED' ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={handleDelete}
        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
        title="Delete job"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

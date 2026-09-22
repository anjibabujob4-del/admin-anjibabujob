'use client'

import { useActionState } from 'react'
import { updateApplicationStatus } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

const initialState = {
  error: null as string | null,
  success: false
}

export default function StatusUpdateForm({ applicationId, currentStatus }: { applicationId: string, currentStatus: string }) {
  const [state, formAction, isPending] = useActionState(async (prevState: typeof initialState, formData: FormData) => {
    const res = await updateApplicationStatus(formData)
    if (res?.error) {
      return { error: res.error, success: false }
    }
    return { error: null, success: true }
  }, initialState)

  const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'CLOSED']

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="application_id" value={applicationId} />
      
      {state.error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {state.error}
        </div>
      )}
      
      {state.success && (
        <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">
          Status updated successfully!
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium text-slate-700">New Status</label>
        <select 
          id="status"
          name="status" 
          defaultValue={currentStatus}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="reason" className="text-sm font-medium text-slate-700">Notes / Reason (Optional)</label>
        <textarea 
          id="reason"
          name="reason" 
          placeholder="e.g. Candidate performed well in interview."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700">
        {isPending ? 'Updating...' : 'Update Status'}
      </Button>
    </form>
  )
}

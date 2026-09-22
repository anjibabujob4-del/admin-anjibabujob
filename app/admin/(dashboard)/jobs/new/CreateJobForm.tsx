'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createJob } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function CreateJobForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('status', status)

    try {
      const res = await createJob(formData)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      } else {
        router.push('/admin/jobs')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title" className="text-slate-700 font-semibold">
            Job Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="e.g. Cleaning Staff Required / Heavy Vehicle Driver"
            className="h-11 text-base"
          />
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <Label htmlFor="category_id" className="text-slate-700 font-semibold">
            Category <span className="text-red-500">*</span>
          </Label>
          <select
            id="category_id"
            name="category_id"
            required
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-slate-700 font-semibold">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            name="location"
            required
            placeholder="e.g. Hyderabad / Secunderabad / Multiple Locations"
            className="h-11"
          />
        </div>

        {/* Minimum Salary */}
        <div className="space-y-2">
          <Label htmlFor="salary_min" className="text-slate-700 font-semibold">
            Minimum Salary (₹ / month)
          </Label>
          <Input
            id="salary_min"
            name="salary_min"
            type="number"
            min="0"
            step="500"
            placeholder="e.g. 15000"
            className="h-11"
          />
        </div>

        {/* Maximum Salary */}
        <div className="space-y-2">
          <Label htmlFor="salary_max" className="text-slate-700 font-semibold">
            Maximum Salary (₹ / month)
          </Label>
          <Input
            id="salary_max"
            name="salary_max"
            type="number"
            min="0"
            step="500"
            placeholder="e.g. 20000"
            className="h-11"
          />
        </div>

        {/* Employment Type */}
        <div className="space-y-2">
          <Label htmlFor="employment_type" className="text-slate-700 font-semibold">
            Employment Type
          </Label>
          <select
            id="employment_type"
            name="employment_type"
            defaultValue="Full-Time"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Daily Wage">Daily Wage</option>
          </select>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-slate-700 font-semibold">
            Experience Required
          </Label>
          <Input
            id="experience"
            name="experience"
            placeholder="e.g. Fresher / 0-2 Years / 3+ Years"
            className="h-11"
          />
        </div>

        {/* Number of Vacancies */}
        <div className="space-y-2">
          <Label htmlFor="vacancies" className="text-slate-700 font-semibold">
            Number of Vacancies
          </Label>
          <Input
            id="vacancies"
            name="vacancies"
            type="number"
            min="1"
            defaultValue="5"
            className="h-11"
          />
        </div>

        {/* Application Deadline */}
        <div className="space-y-2">
          <Label htmlFor="application_deadline" className="text-slate-700 font-semibold">
            Application Deadline
          </Label>
          <Input
            id="application_deadline"
            name="application_deadline"
            type="date"
            className="h-11"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-700 font-semibold">
          Job Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="Detailed overview of the job role and what you are looking for..."
          className="resize-y"
        />
      </div>

      {/* Responsibilities */}
      <div className="space-y-2">
        <Label htmlFor="responsibilities" className="text-slate-700 font-semibold">
          Key Responsibilities
        </Label>
        <Textarea
          id="responsibilities"
          name="responsibilities"
          rows={3}
          placeholder="List daily duties and tasks expected from the candidate..."
          className="resize-y"
        />
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <Label htmlFor="requirements" className="text-slate-700 font-semibold">
          Requirements & Skills
        </Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={3}
          placeholder="Qualifications, physical fitness, licenses, or equipment required..."
          className="resize-y"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
        <Button
          type="submit"
          onClick={() => setStatus('PUBLISHED')}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-base shadow-md"
        >
          {loading && status === 'PUBLISHED' ? 'Publishing Job...' : 'PUBLISH JOB'}
        </Button>

        <Button
          type="submit"
          variant="outline"
          onClick={() => setStatus('DRAFT')}
          disabled={loading}
          className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 font-medium h-12 text-base"
        >
          {loading && status === 'DRAFT' ? 'Saving Draft...' : 'SAVE DRAFT'}
        </Button>
      </div>
    </form>
  )
}

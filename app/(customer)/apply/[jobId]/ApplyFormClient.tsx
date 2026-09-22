'use client'

import { useState } from 'react'
import { submitApplication } from '@/app/actions/apply'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, FileText, UploadCloud, UserCheck, ShieldCheck } from 'lucide-react'

export default function ApplyFormClient({
  jobId,
  userProfile,
}: {
  jobId: string
  userProfile?: { fullName?: string; mobile?: string; email?: string }
}) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await submitApplication(jobId, formData)
      if (res?.error) {
        setError(res.error)
        setPending(false)
      }
    } catch (err: any) {
      // If Next.js redirect threw NEXT_REDIRECT, let it proceed
      if (err.message?.includes('NEXT_REDIRECT')) {
        return
      }
      setError(err.message || 'An error occurred while submitting your application.')
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-lg">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-slate-700 font-semibold">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              required
              defaultValue={userProfile?.fullName || ''}
              placeholder="e.g. Ramesh Kumar"
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobile" className="text-slate-700 font-semibold">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              required
              defaultValue={userProfile?.mobile || ''}
              placeholder="e.g. 9876543210"
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={userProfile?.email || ''}
              placeholder="e.g. candidate@example.com"
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dob" className="text-slate-700 font-semibold">
              Date of Birth
            </Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-slate-700 font-semibold">
              Gender
            </Label>
            <select
              id="gender"
              name="gender"
              defaultValue="Male"
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Address Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-lg">Address & Location</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-slate-700 font-semibold">
              Street / Residential Address
            </Label>
            <Textarea
              id="address"
              name="address"
              rows={2}
              placeholder="House No, Street, Landmark..."
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-slate-700 font-semibold">
                City / Town
              </Label>
              <Input id="city" name="city" placeholder="e.g. Hyderabad" className="h-11 bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-slate-700 font-semibold">
                State
              </Label>
              <Input id="state" name="state" defaultValue="Telangana" className="h-11 bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pincode" className="text-slate-700 font-semibold">
                PIN Code
              </Label>
              <Input id="pincode" name="pincode" placeholder="e.g. 500001" className="h-11 bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Professional Experience & Availability */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-lg">Experience & Preferences</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="experience" className="text-slate-700 font-semibold">
              Total Experience
            </Label>
            <Input
              id="experience"
              name="experience"
              placeholder="e.g. Fresher / 2 Years"
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expected_salary" className="text-slate-700 font-semibold">
              Expected Salary (₹ / month)
            </Label>
            <Input
              id="expected_salary"
              name="expected_salary"
              placeholder="e.g. 18000"
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="availability" className="text-slate-700 font-semibold">
              Availability
            </Label>
            <select
              id="availability"
              name="availability"
              defaultValue="Immediate"
              className="flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
            >
              <option value="Immediate">Immediate Joining</option>
              <option value="Within 7 Days">Within 7 Days</option>
              <option value="Within 15 Days">Within 15 Days</option>
              <option value="1 Month">1 Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Document Uploads */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <UploadCloud className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-lg">Documents Upload (Private & Secure)</h3>
        </div>
        <p className="text-xs text-slate-500">
          Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max file size: 5MB each.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <Label htmlFor="doc_resume" className="text-slate-800 font-semibold text-sm">
              Resume / Bio-data
            </Label>
            <Input
              id="doc_resume"
              name="doc_resume"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              className="bg-white cursor-pointer mt-1"
            />
          </div>

          <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <Label htmlFor="doc_photo" className="text-slate-800 font-semibold text-sm">
              Passport Size Photo
            </Label>
            <Input
              id="doc_photo"
              name="doc_photo"
              type="file"
              accept=".jpg,.jpeg,.png"
              className="bg-white cursor-pointer mt-1"
            />
          </div>

          <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <Label htmlFor="doc_id" className="text-slate-800 font-semibold text-sm">
              ID Proof (Aadhaar / Voter ID / Driving License)
            </Label>
            <Input
              id="doc_id"
              name="doc_id"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="bg-white cursor-pointer mt-1"
            />
          </div>

          <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <Label htmlFor="doc_other" className="text-slate-800 font-semibold text-sm">
              Other Document (Certificate / Experience Letter)
            </Label>
            <Input
              id="doc_other"
              name="doc_other"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="bg-white cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>

      {/* Confirmation & Submit */}
      <div className="pt-6 border-t space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            defaultChecked
            className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="text-xs md:text-sm text-slate-600">
            I confirm that all the details provided above are true and complete. I authorize ANJIBABUJOB.COM and prospective employers to contact me regarding this job application.
          </span>
        </label>

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-lg h-14 rounded-xl shadow-lg transition-transform hover:scale-[1.01]"
        >
          {pending ? 'SUBMITTING YOUR APPLICATION...' : 'SUBMIT APPLICATION'}
        </Button>
      </div>
    </form>
  )
}

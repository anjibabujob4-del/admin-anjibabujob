import Link from 'next/link'
import { CheckCircle2, ArrowRight, Briefcase, PhoneCall, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function ApplicationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const appId = typeof params.appId === 'string' ? params.appId : 'ANJ-2026-SUBMITTED'
  const jobTitle = typeof params.jobTitle === 'string' ? decodeURIComponent(params.jobTitle) : 'Job Opening'

  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center py-16 px-4">
      <Card className="max-w-xl w-full border-0 shadow-2xl overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Application Submitted!
          </h1>
          <p className="text-green-100 mt-2 text-sm md:text-base">
            Thank you for applying with ANJIBABUJOB.COM
          </p>
        </div>

        <CardContent className="p-8 space-y-6">
          {/* Reference Box */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Application Reference ID
            </span>
            <div className="text-2xl font-mono font-extrabold text-blue-900 tracking-wider">
              {appId}
            </div>
            <p className="text-xs text-slate-500">
              Please save this ID for your reference.
            </p>
          </div>

          {/* Job applied summary */}
          <div className="space-y-3 text-sm text-slate-700 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 font-semibold text-blue-950">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Position: {jobTitle}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Our team will contact you via phone/WhatsApp shortly.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Direct Recruitment • Zero Registration Charges</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link href="/jobs" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl">
                Browse More Jobs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full font-semibold h-12 rounded-xl border-slate-200">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

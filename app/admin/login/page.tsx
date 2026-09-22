'use client'

import { useActionState } from 'react'
import { adminLogin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ShieldAlert } from 'lucide-react'

const initialState = {
  error: null as string | null,
}

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: typeof initialState, formData: FormData) => {
    const res = await adminLogin(formData)
    if (res?.error) {
      return { error: res.error }
    }
    return { error: null }
  }, initialState)

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-slate-800 text-slate-100">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600/20 rounded-full">
              <ShieldAlert className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">Admin Access</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Secure login for authorized personnel only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-800 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@anjibabujob.com"
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-700 p-4">
          <p className="text-xs text-slate-500 text-center">
            This area is restricted. All access is logged and monitored.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

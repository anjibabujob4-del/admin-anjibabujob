'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

const initialState = {
  error: null as string | null,
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: typeof initialState, formData: FormData) => {
    const res = await signup(formData)
    if (res?.error) {
      return { error: res.error }
    }
    return { error: null }
  }, initialState)

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 my-8">
      <Card className="w-full max-w-md border-0 shadow-xl ring-1 ring-gray-900/5">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-900">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Register to find and apply for the best jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

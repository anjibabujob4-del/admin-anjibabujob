'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '')          // Trim - from end of text
}

async function verifyAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', supabase: null, user: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['SUPER_ADMIN', 'ADMIN', 'RECRUITER'].includes(profile.role)) {
    return { error: 'Insufficient permissions', supabase: null, user: null }
  }

  return { error: null, supabase, user }
}

export async function createJob(formData: FormData) {
  const { error: authError, supabase, user } = await verifyAdminUser()
  if (authError || !supabase || !user) return { error: authError || 'Unauthorized' }

  const title = (formData.get('title') as string)?.trim()
  const categoryId = formData.get('category_id') as string
  const description = (formData.get('description') as string)?.trim()
  const responsibilities = (formData.get('responsibilities') as string)?.trim() || null
  const requirements = (formData.get('requirements') as string)?.trim() || null
  const location = (formData.get('location') as string)?.trim()
  const salaryMin = formData.get('salary_min') ? parseFloat(formData.get('salary_min') as string) : null
  const salaryMax = formData.get('salary_max') ? parseFloat(formData.get('salary_max') as string) : null
  const employmentType = (formData.get('employment_type') as string) || 'Full-Time'
  const experience = (formData.get('experience') as string)?.trim() || null
  const vacancies = formData.get('vacancies') ? parseInt(formData.get('vacancies') as string, 10) : 1
  const deadline = formData.get('application_deadline') ? new Date(formData.get('application_deadline') as string).toISOString() : null
  const status = (formData.get('status') as string) || 'PUBLISHED'

  if (!title || !categoryId || !description || !location) {
    return { error: 'Please fill in all required fields (Title, Category, Location, Description).' }
  }

  const baseSlug = slugify(title)
  const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

  const { data: job, error: insertError } = await supabase
    .from('jobs')
    .insert({
      title,
      slug: uniqueSlug,
      category_id: categoryId,
      description,
      responsibilities,
      requirements,
      location,
      salary_min: salaryMin,
      salary_max: salaryMax,
      employment_type: employmentType,
      experience,
      vacancies,
      application_deadline: deadline,
      status,
      created_by: user.id,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error creating job:', insertError)
    return { error: insertError.message }
  }

  // Also map default application fields to this job so the applicant gets the full application form
  const { data: appFields } = await supabase.from('application_fields').select('id')
  if (appFields && appFields.length > 0) {
    const mappings = appFields.map((f, idx) => ({
      job_id: job.id,
      field_id: f.id,
      required: true,
      display_order: idx + 1,
    }))
    await supabase.from('job_application_fields').insert(mappings)
  }

  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  revalidatePath('/')

  return { success: true, jobId: job.id }
}

export async function updateJob(jobId: string, formData: FormData) {
  const { error: authError, supabase } = await verifyAdminUser()
  if (authError || !supabase) return { error: authError || 'Unauthorized' }

  const title = (formData.get('title') as string)?.trim()
  const categoryId = formData.get('category_id') as string
  const description = (formData.get('description') as string)?.trim()
  const responsibilities = (formData.get('responsibilities') as string)?.trim() || null
  const requirements = (formData.get('requirements') as string)?.trim() || null
  const location = (formData.get('location') as string)?.trim()
  const salaryMin = formData.get('salary_min') ? parseFloat(formData.get('salary_min') as string) : null
  const salaryMax = formData.get('salary_max') ? parseFloat(formData.get('salary_max') as string) : null
  const employmentType = (formData.get('employment_type') as string) || 'Full-Time'
  const experience = (formData.get('experience') as string)?.trim() || null
  const vacancies = formData.get('vacancies') ? parseInt(formData.get('vacancies') as string, 10) : 1
  const deadline = formData.get('application_deadline') ? new Date(formData.get('application_deadline') as string).toISOString() : null
  const status = formData.get('status') as string

  if (!title || !categoryId || !description || !location) {
    return { error: 'Please fill in all required fields.' }
  }

  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      title,
      category_id: categoryId,
      description,
      responsibilities,
      requirements,
      location,
      salary_min: salaryMin,
      salary_max: salaryMax,
      employment_type: employmentType,
      experience,
      vacancies,
      application_deadline: deadline,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  revalidatePath('/')

  return { success: true }
}

export async function deleteJob(jobId: string) {
  const { error: authError, supabase } = await verifyAdminUser()
  if (authError || !supabase) return { error: authError || 'Unauthorized' }

  const { error: deleteError } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  revalidatePath('/')

  return { success: true }
}

export async function toggleJobStatus(jobId: string, newStatus: string) {
  const { error: authError, supabase } = await verifyAdminUser()
  if (authError || !supabase) return { error: authError || 'Unauthorized' }

  const { error: updateError } = await supabase
    .from('jobs')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', jobId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  revalidatePath('/')

  return { success: true }
}

export async function updateApplicationStatus(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['SUPER_ADMIN', 'ADMIN', 'RECRUITER'].includes(profile.role)) {
    return { error: 'Insufficient permissions' }
  }

  const applicationId = formData.get('application_id') as string
  const newStatus = formData.get('status') as string
  const reason = formData.get('reason') as string

  if (!applicationId || !newStatus) {
    return { error: 'Missing required fields' }
  }

  const { data: app } = await supabase
    .from('applications')
    .select('status, user_id')
    .eq('id', applicationId)
    .single()

  if (!app) return { error: 'Application not found' }

  if (app.status === newStatus) {
    return { error: 'Status is already set to this value' }
  }

  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (updateError) return { error: updateError.message }

  await supabase.from('application_status_history').insert({
    application_id: applicationId,
    old_status: app.status,
    new_status: newStatus,
    changed_by: user.id,
    reason: reason || `Status updated by Admin`,
  })

  await supabase.from('notifications').insert({
    user_id: app.user_id,
    title: 'Application Status Updated',
    message: `Your application status has been updated to ${newStatus.replace('_', ' ')}.`
  })

  revalidatePath(`/admin/applications/${applicationId}`)
  revalidatePath('/admin/applications')
  revalidatePath('/my-applications')
  return { success: true }
}

export async function getDocumentUrl(filePath: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER'].includes(profile.role)) {
    return null
  }

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600)

  if (error) {
    console.error('Error generating signed URL:', error)
    return null
  }

  return data.signedUrl
}

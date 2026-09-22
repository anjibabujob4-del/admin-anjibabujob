'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitApplication(jobId: string, formData: FormData) {
  const supabase = await createClient()

  // 1. Check user (optional - candidate doesn't need to be logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user?.id || null

  // 2. Verify job is currently published
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, title, status')
    .eq('id', jobId)
    .single()

  if (jobError || !job || job.status !== 'PUBLISHED') {
    return { error: 'This job is no longer accepting applications.' }
  }

  // 3. Extract core fields
  const fullName = (formData.get('full_name') as string)?.trim()
  const mobile = (formData.get('mobile') as string)?.trim()

  if (!fullName || !mobile) {
    return { error: 'Full Name and Mobile Number are required.' }
  }

  // If user is logged in, update their profile
  if (userId) {
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        mobile: mobile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
  }

  // 4. Generate unique application number (e.g. ANJ-2026-000123)
  const currentYear = new Date().getFullYear()
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  const applicationNumber = `ANJ-${currentYear}-${randomSuffix}`

  // 5. Insert application record
  const { data: application, error: appError } = await supabase
    .from('applications')
    .insert({
      application_number: applicationNumber,
      user_id: userId,
      job_id: jobId,
      status: 'SUBMITTED',
    })
    .select()
    .single()

  if (appError || !application) {
    console.error('Error creating application:', appError)
    return { error: appError?.message || 'Could not save your application. Please check database permissions.' }
  }

  // 6. Create initial status history entry
  try {
    await supabase.from('application_status_history').insert({
      application_id: application.id,
      new_status: 'SUBMITTED',
      changed_by: userId,
      reason: 'Application submitted online by candidate',
    })
  } catch (e) {
    console.error('Status history insert error (non-fatal):', e)
  }

  // 7. Save candidate questionnaire details into application_answers
  const standardFields = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'mobile', label: 'Mobile Number' },
    { key: 'email', label: 'Email' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'address', label: 'Residential Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'pincode', label: 'PIN Code' },
    { key: 'experience', label: 'Total Experience' },
    { key: 'expected_salary', label: 'Expected Salary' },
    { key: 'availability', label: 'Availability' },
  ]

  // Map answers to application_answers if application_fields exists
  try {
    const { data: dbFields } = await supabase.from('application_fields').select('id, field_name')
    const fieldMap = new Map((dbFields || []).map((f) => [f.field_name, f.id]))

    for (const item of standardFields) {
      const val = (formData.get(item.key) as string)?.trim()
      if (val) {
        let fieldId = fieldMap.get(item.key)
        if (!fieldId) {
          // Create field dynamically if not present
          const { data: newField } = await supabase
            .from('application_fields')
            .insert({
              field_name: item.key,
              label: item.label,
              type: 'text',
            })
            .select('id')
            .single()

          if (newField) fieldId = newField.id
        }

        if (fieldId) {
          await supabase.from('application_answers').insert({
            application_id: application.id,
            field_id: fieldId,
            value: val,
          })
        }
      }
    }
  } catch (e) {
    console.error('Application answers error (non-fatal):', e)
  }

  // 8. Handle file uploads (Resume, Photo, ID, Other)
  const docFields = [
    { key: 'doc_resume', label: 'Resume', typeName: 'resume' },
    { key: 'doc_photo', label: 'Photo', typeName: 'photo' },
    { key: 'doc_id', label: 'ID Document', typeName: 'id_proof' },
    { key: 'doc_other', label: 'Other Document', typeName: 'other' },
  ]

  for (const doc of docFields) {
    const file = formData.get(doc.key)
    if (file instanceof File && file.size > 0) {
      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue // Skip oversized files
      }

      const fileExt = file.name.split('.').pop() || 'dat'
      const filePath = `applications/${application.id}/${doc.typeName}_${Date.now()}.${fileExt}`

      try {
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (!uploadError) {
          await supabase.from('documents').insert({
            application_id: application.id,
            user_id: userId,
            file_name: `${doc.label} (${file.name})`,
            file_path: filePath,
            file_type: file.type || 'application/octet-stream',
            size: file.size,
          })
        } else {
          console.warn('Document storage upload notice:', uploadError.message)
        }
      } catch (err) {
        console.warn('Document upload catch notice:', err)
      }
    }
  }

  // 9. Process any additional dynamic fields (e.g. field_UUID)
  const entries = Array.from(formData.entries())
  for (const [key, value] of entries) {
    if (key.startsWith('field_')) {
      const fieldId = key.replace('field_', '')
      if (typeof value === 'string' && value.trim()) {
        try {
          await supabase.from('application_answers').insert({
            application_id: application.id,
            field_id: fieldId,
            value: value.trim(),
          })
        } catch (e) {
          // ignore
        }
      }
    }
  }

  revalidatePath('/my-applications')
  revalidatePath('/admin/applications')

  redirect(`/application-success?appId=${application.application_number}&jobTitle=${encodeURIComponent(job.title)}`)
}

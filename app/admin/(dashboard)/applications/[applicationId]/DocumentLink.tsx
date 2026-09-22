'use client'

import { useState } from 'react'
import { getDocumentUrl } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function DocumentLink({ filePath, fileName }: { filePath: string, fileName: string }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const url = await getDocumentUrl(filePath)
      if (url) {
        window.open(url, '_blank')
      } else {
        alert('Could not generate document URL. Please check permissions.')
      }
    } catch (e) {
      console.error(e)
      alert('Error fetching document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownload} 
      disabled={loading}
      className="shrink-0"
    >
      <Download className="w-4 h-4 mr-2" />
      {loading ? 'Opening...' : 'View'}
    </Button>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { redirect } from 'next/navigation'
import { getTableIdFromCode } from '@/lib/tableMapping'
import TablePage from '@/app/table/[tableId]/page'

/**
 * Wrapper component that converts table code to table ID
 * This prevents guests from manually changing URLs to access other tables
 */
export default function TableCodePage() {
  const params = useParams()
  const tableCode = params.tableCode as string
  const [tableId, setTableId] = useState<number | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!tableCode) {
      setError(true)
      return
    }

    const id = getTableIdFromCode(tableCode)
    if (id === null) {
      setError(true)
      return
    }

    setTableId(id)
  }, [tableCode])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Invalid Table Code</h1>
          <p className="text-muted-foreground mb-4">The table code you provided is invalid or expired.</p>
          <p className="text-sm text-muted-foreground">Please scan a valid QR code to access your table.</p>
        </div>
      </div>
    )
  }

  if (tableId === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Pass the actual table ID to the table page
  return <TablePageWithId tableId={tableId} />
}

// Re-export the table page component but with injected tableId via params
function TablePageWithId({ tableId }: { tableId: number }) {
  // Create a mock params object for the table page
  const mockParams = { tableId: String(tableId) }
  
  // Import and use the actual table page
  const TablePageComponent = require('@/app/table/[tableId]/page').default
  
  return <TablePageComponent />
}

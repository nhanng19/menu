'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllTableCodes } from '@/lib/tableMapping'
import Link from 'next/link'

export default function QRCodesPage() {
  const tableCodes = getAllTableCodes()
  const tableNumbers = Object.keys(tableCodes)
    .map((key) => parseInt(key))
    .sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🍖 Table QR Codes</h1>
          <p className="text-muted-foreground">
            Unique codes for each table. Generate QR codes for printing or display.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tableNumbers.map((tableId) => {
            const code = tableCodes[tableId]
            const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/table/${code}`
            
            return (
              <Card key={tableId}>
                <CardHeader>
                  <CardTitle>Table {tableId}</CardTitle>
                  <CardDescription>Unique access code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Code:</p>
                    <code className="block bg-muted p-3 rounded text-center font-mono text-sm font-bold">
                      {code}
                    </code>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">URL:</p>
                    <code className="block bg-muted p-2 rounded text-center font-mono text-xs overflow-hidden text-ellipsis">
                      /table/{code}
                    </code>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Generate QR Code:</p>
                    <Button
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        // Generate QR code using an external service
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`
                        window.open(qrUrl, '_blank')
                      }}
                    >
                      Generate & Download
                    </Button>
                  </div>

                  <div className="pt-2">
                    <Button asChild className="w-full" size="sm">
                      <Link href={`/table/${code}`}>
                        Visit Table
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/admin">
                Back to Admin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

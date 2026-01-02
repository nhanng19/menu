import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-4">🍖 Korean BBQ Menu</CardTitle>
          <CardDescription>
            Welcome! Please scan your table's QR code to order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">Quick Links:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3, 4].map((table) => (
                <Button key={table} asChild>
                  <Link href={`/table/${table}`}>
                    Table {table}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/kitchen">
                <ChefHat className="h-4 w-4 mr-2" />
                Kitchen Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

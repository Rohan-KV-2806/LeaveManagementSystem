import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

// Dummy user type matching the Fastify backend response
interface User {
  id: number
  name: string
  role: 'employee' | 'manager'
}

export default function Dashboard() {
  // Retrieve user from localStorage (set during login)
  const userString = localStorage.getItem('user')
  const user: User | null = userString ? JSON.parse(userString) : null

  if (!user) {
    return <div>Loading...</div> // Or redirect to login
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Hello, {user.role === 'employee' ? 'emp' : 'man'} {user.name}
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {user.role === 'employee' && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Actions</CardTitle>
              <CardDescription>Manage your leave requests here</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => toast.info('Leave Application Form coming in next step!')}>
                Request Leave
              </Button>
            </CardContent>
          </Card>
        )}

        {user.role === 'manager' && (
          <Card>
            <CardHeader>
              <CardTitle>Management Actions</CardTitle>
              <CardDescription>Review and approve team leaves</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => toast.info('Approvals Table coming in next step!')}>
                View Employee Requests
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
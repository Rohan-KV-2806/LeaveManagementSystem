import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog' // Removed DialogTrigger from import
import { useNavigate } from '@tanstack/react-router'
import LeaveApplicationForm from '../leave/LeaveApplicationForm'
import { toast } from 'sonner'

interface User {
  id: number
  name: string
  role: 'employee' | 'manager'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const userString = localStorage.getItem('user')
  const user: User | null = userString ? JSON.parse(userString) : null

  if (!user) {
    return <div>Loading...</div>
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate({ to: '/' })
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Hello, {user.role === 'employee' ? 'emp' : 'man'} {user.name}
        </h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {user.role === 'employee' && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Actions</CardTitle>
              <CardDescription>Manage your leave requests here</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Removed DialogTrigger, using standard onClick to control state */}
              <Button onClick={() => setIsDialogOpen(true)}>
                Request Leave
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply for Leave</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to submit your leave request.
                    </DialogDescription>
                  </DialogHeader>
                  <LeaveApplicationForm onSubmitSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
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
              <Button onClick={() => navigate({ to: '/approvals' })}>
                View Employee Requests
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
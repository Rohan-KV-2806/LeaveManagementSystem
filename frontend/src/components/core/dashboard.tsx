import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { useNavigate } from '@tanstack/react-router'
import LeaveApplicationForm from '../leave/LeaveApplicationForm'
import { toast } from 'sonner'
import { eachDayOfInterval, parseISO } from 'date-fns'

interface User {
  id: number
  name: string
  role: 'employee' | 'manager'
}

interface LeaveBalance {
  leaveTypeId: number
  name: string
  daysPerYear: number
  used: number
  remaining: number
}

interface CalendarLeave {
  id: number
  startDate: string
  endDate: string
  leaveType: string | null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([])
  const [calendarLeaves, setCalendarLeaves] = useState<CalendarLeave[]>([])
  const [loading, setLoading] = useState(true)

  const userString = localStorage.getItem('user')
  const user: User | null = userString ? JSON.parse(userString) : null

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token')
      try {
        const res = await fetch('http://localhost:3000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to load dashboard')
        const data = await res.json()
        setLeaveBalance(data.leaveBalance || [])
        setCalendarLeaves(data.calendarLeaves || [])
      } catch (error) {
        console.error('Dashboard fetch error:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  // Expand approved leave spans into individual days for the calendar
  const leaveDays: Date[] = []
  for (const span of calendarLeaves) {
    leaveDays.push(...eachDayOfInterval({ start: parseISO(span.startDate), end: parseISO(span.endDate) }))
  }

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
        {user.role === 'employee' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Leave Actions</CardTitle>
                <CardDescription>Manage your leave requests here</CardDescription>
              </CardHeader>
              <CardContent>
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

            <Card>
              <CardHeader>
                <CardTitle>Leave Balance</CardTitle>
                <CardDescription>Your yearly leave quota and remaining days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : leaveBalance.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No leave types available.</p>
                ) : (
                  leaveBalance.map((balance) => (
                    <div key={balance.leaveTypeId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{balance.name}</span>
                        <span className="text-muted-foreground">
                          {balance.remaining} / {balance.daysPerYear} days
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min(100, (balance.remaining / balance.daysPerYear) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {balance.used} used
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Calendar</CardTitle>
                <CardDescription>Your approved leave days this year</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <>
                    <Calendar
                      mode="single"
                      selected={undefined}
                      modifiers={{ leave: leaveDays }}
                      modifiersClassNames={{ leave: 'bg-primary text-primary-foreground rounded-md' }}
                    />
                    <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="inline-block size-2.5 rounded-sm bg-primary" />
                      Approved leave
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
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

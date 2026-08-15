import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { useNavigate } from '@tanstack/react-router'
import LeaveApplicationForm from '../leave/LeaveApplicationForm'
import { toast } from 'sonner'

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

interface LeaveHistoryItem {
  id: number
  startDate: string
  endDate: string
  reason: string
  status: string
  LeaveType: { name: string } | null
  Approval?: { comments: string | null } | null
}

function statusPill(status: string) {
  switch (status) {
    case 'approved':
      return 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 capitalize'
    case 'rejected':
      return 'inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 capitalize'
    default:
      return 'inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 capitalize'
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<LeaveHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [reasonItem, setReasonItem] = useState<LeaveHistoryItem | null>(null)

  const userString = localStorage.getItem('user')
  const user: User | null = userString ? JSON.parse(userString) : null

  useEffect(() => {
    const token = localStorage.getItem('token')

    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to load dashboard')
        const data = await res.json()
        setLeaveBalance(data.leaveBalance || [])
      } catch (error) {
        console.error('Dashboard fetch error:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/leaves/history', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to load history')
        setHistory(await res.json())
      } catch (error) {
        console.error('History fetch error:', error)
        toast.error('Failed to load leave history')
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchDashboard()
    fetchHistory()
  }, [refresh])

  // Only approved and rejected requests are listed below the calendar
  const acceptedRejected = history.filter((item) => item.status === 'approved' || item.status === 'rejected')

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
                    <LeaveApplicationForm onSubmitSuccess={() => { setIsDialogOpen(false); setRefresh((r) => r + 1) }} />
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
                <CardDescription>Your leave schedule</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <Calendar mode="single" selected={undefined} />
                )}

                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">Accepted & Rejected Leaves</h3>
                  {historyLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : acceptedRejected.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No approved or rejected leaves yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {acceptedRejected.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.LeaveType?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.startDate).toLocaleDateString()} – {new Date(item.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.Approval?.comments && (
                              <Button size="sm" variant="outline" onClick={() => setReasonItem(item)}>
                                View Reason
                              </Button>
                            )}
                            <span className={statusPill(item.status)}>{item.status}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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

      <Dialog open={reasonItem !== null} onOpenChange={(open) => { if (!open) setReasonItem(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
            <DialogDescription>
              {reasonItem
                ? `${reasonItem.LeaveType?.name ?? 'Leave'} · ${new Date(reasonItem.startDate).toLocaleDateString()} – ${new Date(reasonItem.endDate).toLocaleDateString()}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">{reasonItem?.Approval?.comments}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}

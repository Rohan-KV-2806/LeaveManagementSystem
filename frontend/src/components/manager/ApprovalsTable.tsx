import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface LeaveRequest {
  id: number
  startDate: string
  endDate: string
  reason: string
  status: string
  User: { name: string; email: string }
  LeaveType: { name: string }
  balance?: { used: number; remaining: number; daysPerYear: number }
}

export default function ApprovalsTable() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchRequests = async () => {
      const token = localStorage.getItem('token')
      try {
        const res = await fetch('http://localhost:3000/api/leaves', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch leave requests')
        const data = await res.json()
        setRequests(data)
      } catch (error) {
        console.error('Failed to fetch requests', error)
        toast.error('Failed to load leave requests')
      } finally {
        setLoading(false)
      }
    }

  const handleAction = async (id: number, action: 'approve' | 'reject', comments?: string) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:3000/api/leaves/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(comments ? { 'Content-Type': 'application/json' } : {})
        },
        body: comments ? JSON.stringify({ comments }) : undefined
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
          )
        )
        toast.success(data.message || `Leave request ${action}d successfully`)
      } else {
        toast.error(data.error || `Failed to ${action} request`)
      }
    } catch (error) {
      console.error(`Failed to ${action} request`, error)
      toast.error(`Failed to ${action} request. Check console for details.`)
    }
  }

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for the rejection')
      return
    }
    await handleAction(rejectingId!, 'reject', rejectReason.trim())
    setRejectingId(null)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all submitted leave requests.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Available Leave</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No leave requests found.</TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.User?.name}</TableCell>
                    <TableCell>{req.LeaveType?.name}</TableCell>
                    <TableCell
                      className={req.balance && req.balance.remaining === 0 ? 'text-destructive font-medium' : ''}
                    >
                      {req.balance ? `${req.balance.remaining} / ${req.balance.daysPerYear} days` : '—'}
                    </TableCell>
                    <TableCell>{new Date(req.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(req.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                    <TableCell className="capitalize">{req.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="destructive" disabled={req.status !== 'pending'} onClick={() => { setRejectReason(''); setRejectingId(req.id) }}>
                        Reject
                      </Button>
                      <Button size="sm" disabled={req.status !== 'pending'} onClick={() => handleAction(req.id, 'approve')}>
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={rejectingId !== null} onOpenChange={(open) => { if (!open) setRejectingId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request. The employee will see it in their leave history.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectingId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
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

interface LeaveRequest {
  id: number
  startDate: string
  endDate: string
  reason: string
  status: string
  User: { name: string; email: string }
  LeaveType: { name: string }
}

export default function ApprovalsTable() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('token')
      try {
        const res = await fetch('http://localhost:3000/api/leaves', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setRequests(data)
      } catch (error) {
        console.error('Failed to fetch requests', error)
      } finally {
        setLoading(false)
      }
    }
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
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No leave requests found.</TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.User?.name}</TableCell>
                    <TableCell>{req.LeaveType?.name}</TableCell>
                    <TableCell>{new Date(req.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(req.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                    <TableCell className="capitalize">{req.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="destructive" disabled>
                        Reject
                      </Button>
                      <Button size="sm" disabled>
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
    </div>
  )
}
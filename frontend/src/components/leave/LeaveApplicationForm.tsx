import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface LeaveType {
  id: number
  name: string
}

export default function LeaveApplicationForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [selectedType, setSelectedType] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTypes = async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/leave-types', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setLeaveTypes(data)
    }
    fetchTypes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !dateRange.from || !dateRange.to || !reason) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveTypeId: parseInt(selectedType),
          // Format dates to YYYY-MM-DD for PostgreSQL DATEONLY
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd'),
          reason: reason
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      
      toast.success('Leave request submitted successfully!')
      setSelectedType('')
      setDateRange({ from: undefined, to: undefined })
      setReason('')
      
      if (onSubmitSuccess) onSubmitSuccess()
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Submission failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="leaveType">Leave Type</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger id="leaveType">
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            {leaveTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateRange.from && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea 
          id="reason" 
          placeholder="Why are you taking leave?" 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  )
}
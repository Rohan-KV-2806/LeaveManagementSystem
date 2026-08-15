const LeaveType = require('../models/LeaveType');
const LeaveRequest = require('../models/LeaveRequest');
const Approval = require('../models/Approval');
const User = require('../models/User');
const { countDays } = require('../utils/days');

class LeaveController {
  // GET /api/leave-types
  async getLeaveTypes(request, reply) {
    try {
      const types = await LeaveType.findAll();
      return reply.send(types);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  // POST /api/leaves
  async submitLeave(request, reply) {
    const { leaveTypeId, startDate, endDate, reason } = request.body;
    const userId = request.user.id;

    try {
      const newRequest = await LeaveRequest.create({
        leaveTypeId,
        startDate,
        endDate,
        reason,
        status: 'pending',
        userId
      });

      return reply.code(201).send({ 
        message: 'Leave request submitted successfully', 
        data: newRequest 
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  // GET /api/leaves (For Manager Approvals)
  async getLeaveRequests(request, reply) {
    try {
      // Fetch all leave requests, including the user who requested it and the leave type
      const requests = await LeaveRequest.findAll({
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: LeaveType, attributes: ['id', 'name', 'daysPerYear'] }
        ],
        order: [['createdAt', 'DESC']] // Show newest first
      });

      // Approved days used per (user, leave type) so managers can see each employee's remaining balance
      const approved = await LeaveRequest.findAll({
        where: { status: 'approved' },
        attributes: ['userId', 'leaveTypeId', 'startDate', 'endDate']
      });
      const usedByKey = {};
      for (const req of approved) {
        const key = `${req.userId}:${req.leaveTypeId}`;
        usedByKey[key] = (usedByKey[key] || 0) + countDays(req.startDate, req.endDate);
      }

      const requestsWithBalance = requests.map((req) => {
        const leaveType = req.LeaveType;
        const daysPerYear = leaveType ? leaveType.daysPerYear : 0;
        const used = usedByKey[`${req.userId}:${req.leaveTypeId}`] || 0;
        return {
          ...req.toJSON(),
          balance: {
            used,
            remaining: Math.max(0, daysPerYear - used),
            daysPerYear
          }
        };
      });

      return reply.send(requestsWithBalance);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
  // GET /api/leaves/history (Current user's leave history)
  async getMyHistory(request, reply) {
    const userId = request.user.id;

    try {
      const requests = await LeaveRequest.findAll({
        where: { userId },
        include: [
          { model: LeaveType, attributes: ['id', 'name'] },
          { model: Approval }
        ],
        order: [['createdAt', 'DESC']]
      });

      return reply.send(requests);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  // PATCH /api/leaves/:id/approve
  async approveLeave(request, reply) {
    const { id } = request.params;
    const { comments } = request.body || {};
    try {
      const leaveRequest = await LeaveRequest.findByPk(id);
      if (!leaveRequest) {
        return reply.code(404).send({ error: 'Leave request not found' });
      }
      if (leaveRequest.status !== 'pending') {
        return reply.code(400).send({ error: 'Leave request is not pending' });
      }
      leaveRequest.status = 'approved';
      await leaveRequest.save();

      await Approval.create({
        leaveRequestId: leaveRequest.id,
        managerId: request.user.id,
        status: 'approved',
        comments: comments || null
      });

      return reply.send({ message: 'Leave request approved', data: leaveRequest });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  // PATCH /api/leaves/:id/reject
  async rejectLeave(request, reply) {
    const { id } = request.params;
    const { comments } = request.body || {};
    try {
      const leaveRequest = await LeaveRequest.findByPk(id);
      if (!leaveRequest) {
        return reply.code(404).send({ error: 'Leave request not found' });
      }
      if (leaveRequest.status !== 'pending') {
        return reply.code(400).send({ error: 'Leave request is not pending' });
      }
      leaveRequest.status = 'rejected';
      await leaveRequest.save();

      await Approval.create({
        leaveRequestId: leaveRequest.id,
        managerId: request.user.id,
        status: 'rejected',
        comments: comments || null
      });

      return reply.send({ message: 'Leave request rejected', data: leaveRequest });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new LeaveController();
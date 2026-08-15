const LeaveType = require('../models/LeaveType');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

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
          { model: LeaveType, attributes: ['id', 'name'] }
        ],
        order: [['createdAt', 'DESC']] // Show newest first
      });

      return reply.send(requests);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new LeaveController();
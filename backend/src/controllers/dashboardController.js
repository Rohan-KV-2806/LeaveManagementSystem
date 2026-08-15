const LeaveType = require('../models/LeaveType');
const LeaveRequest = require('../models/LeaveRequest');
const { countDays } = require('../utils/days');

class DashboardController {
  async getDashboard(request, reply) {
    // request.user is populated by the JWT verify step
    const { id, name, role } = request.user;

    try {
      // Leave balance: yearly quota per leave type minus approved days used
      const [leaveTypes, approvedRequests] = await Promise.all([
        LeaveType.findAll(),
        LeaveRequest.findAll({
          where: { userId: id, status: 'approved' },
          attributes: ['leaveTypeId', 'startDate', 'endDate']
        })
      ]);

      const usedByType = {};
      for (const req of approvedRequests) {
        usedByType[req.leaveTypeId] = (usedByType[req.leaveTypeId] || 0) + countDays(req.startDate, req.endDate);
      }

      const leaveBalance = leaveTypes.map((type) => {
        const used = usedByType[type.id] || 0;
        return {
          leaveTypeId: type.id,
          name: type.name,
          daysPerYear: type.daysPerYear,
          used,
          remaining: Math.max(0, type.daysPerYear - used)
        };
      });

      // Approved leave spans, used by the dashboard calendar
      const calendarLeaves = await LeaveRequest.findAll({
        where: { userId: id, status: 'approved' },
        attributes: ['id', 'startDate', 'endDate'],
        include: [{ model: LeaveType, attributes: ['name'] }]
      });

      return reply.send({
        message: `Hello, ${role === 'employee' ? 'emp' : 'man'} ${name}`,
        userId: id,
        role: role,
        leaveBalance,
        calendarLeaves: calendarLeaves.map((req) => ({
          id: req.id,
          startDate: req.startDate,
          endDate: req.endDate,
          leaveType: req.LeaveType ? req.LeaveType.name : null
        }))
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new DashboardController();

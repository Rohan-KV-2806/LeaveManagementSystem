class DashboardController {
  async getDashboard(request, reply) {
    // request.user is populated by the JWT verify step
    const { id, name, role } = request.user;

    return reply.send({
      message: `Hello, ${role === 'employee' ? 'emp' : 'man'} ${name}`,
      userId: id,
      role: role,
      // Future: leaveBalance, calendarData, etc.
    });
  }
}

module.exports = new DashboardController();
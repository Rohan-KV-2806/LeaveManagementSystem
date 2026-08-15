const DAY_MS = 24 * 60 * 60 * 1000;

// Inclusive number of days between two DATEONLY strings
function countDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / DAY_MS) + 1;
}

module.exports = { countDays };

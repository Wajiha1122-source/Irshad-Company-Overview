const pool = require('../config/db');

class StationaryService {
  async getStationaryByEmployeeId(employeeId) {
    const result = await pool.query(
      'SELECT * FROM employee_stationary WHERE employee_id = $1 ORDER BY id',
      [employeeId]
    );
    return result.rows;
  }

  async createStationary(employeeId, stationaryData) {
    const { stationary_item, quantity, assigned_date, notes } = stationaryData;
    
    const result = await pool.query(
      `INSERT INTO employee_stationary (employee_id, stationary_item, quantity, assigned_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [employeeId, stationary_item, quantity, assigned_date, notes]
    );
    
    return result.rows[0];
  }

  async deleteStationaryByEmployeeId(employeeId) {
    const result = await pool.query(
      `DELETE FROM employee_stationary WHERE employee_id = $1 RETURNING *`,
      [employeeId]
    );
    
    return {
      deletedCount: result.rowCount,
      deletedItems: result.rows
    };
  }

  async deleteStationaryById(stationaryId) {
    const result = await pool.query(
      `DELETE FROM employee_stationary WHERE id = $1 RETURNING *`,
      [stationaryId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Stationary item not found');
    }
    
    return result.rows[0];
  }
}

module.exports = new StationaryService();

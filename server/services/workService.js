const pool = require('../config/db');

class WorkService {
  async getWorkByEmployeeId(employeeId) {
    const result = await pool.query(
      'SELECT * FROM employee_work WHERE employee_id = $1 ORDER BY id',
      [employeeId]
    );
    return result.rows;
  }

  async createWork(employeeId, workData) {
    const { work_type, description } = workData;
    
    const result = await pool.query(
      `INSERT INTO employee_work (employee_id, work_type, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [employeeId, work_type, description]
    );
    
    return result.rows[0];
  }

  async deleteWorkByEmployeeId(employeeId) {
    const result = await pool.query(
      `DELETE FROM employee_work WHERE employee_id = $1 RETURNING *`,
      [employeeId]
    );
    
    return {
      deletedCount: result.rowCount,
      deletedItems: result.rows
    };
  }

  async deleteWorkById(workId) {
    const result = await pool.query(
      `DELETE FROM employee_work WHERE id = $1 RETURNING *`,
      [workId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Work item not found');
    }
    
    return result.rows[0];
  }
}

module.exports = new WorkService();

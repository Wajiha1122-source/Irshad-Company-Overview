const pool = require('../config/db');

class AuthorityService {
  async getAuthorityByEmployeeId(employeeId) {
    const result = await pool.query(
      'SELECT * FROM employee_authority WHERE employee_id = $1 ORDER BY id',
      [employeeId]
    );
    return result.rows;
  }

  async createAuthority(employeeId, authorityData) {
    const { authority_level } = authorityData;
    
    const result = await pool.query(
      `INSERT INTO employee_authority (employee_id, authority_level)
       VALUES ($1, $2)
       RETURNING *`,
      [employeeId, authority_level]
    );
    
    return result.rows[0];
  }

  async deleteAuthorityByEmployeeId(employeeId) {
    const result = await pool.query(
      `DELETE FROM employee_authority WHERE employee_id = $1 RETURNING *`,
      [employeeId]
    );
    
    return {
      deletedCount: result.rowCount,
      deletedItems: result.rows
    };
  }

  async deleteAuthorityById(authorityId) {
    const result = await pool.query(
      `DELETE FROM employee_authority WHERE id = $1 RETURNING *`,
      [authorityId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Authority item not found');
    }
    
    return result.rows[0];
  }
}

module.exports = new AuthorityService();

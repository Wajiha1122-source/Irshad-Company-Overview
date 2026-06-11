const pool = require('../config/db');

class AccountService {
  async getAccountsByEmployeeId(employeeId) {
    const result = await pool.query(
      'SELECT * FROM employee_account_access WHERE employee_id = $1 ORDER BY id',
      [employeeId]
    );
    return result.rows;
  }

  async createAccount(employeeId, accountData) {
    const { account_type, access_level, notes } = accountData;
    
    const result = await pool.query(
      `INSERT INTO employee_account_access (employee_id, account_type, access_level, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [employeeId, account_type, access_level, notes]
    );
    
    return result.rows[0];
  }

  async deleteAccountsByEmployeeId(employeeId) {
    const result = await pool.query(
      `DELETE FROM employee_account_access WHERE employee_id = $1 RETURNING *`,
      [employeeId]
    );
    
    return {
      deletedCount: result.rowCount,
      deletedItems: result.rows
    };
  }

  async deleteAccountById(accountId) {
    const result = await pool.query(
      `DELETE FROM employee_account_access WHERE id = $1 RETURNING *`,
      [accountId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Account access item not found');
    }
    
    return result.rows[0];
  }
}

module.exports = new AccountService();

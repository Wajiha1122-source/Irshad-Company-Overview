const pool = require('../config/db');

const RELATED_TABLES = [
  'employee_work',
  'employee_authority',
  'employee_assets',
  'employee_account_access',
  'employee_stationary'
];

const normalizeEmployee = (data = {}) => ({
  full_name: data.full_name?.trim(),
  picture: data.picture || null,
  designation: data.designation?.trim() || null,
  phone_number: data.phone_number?.trim() || null,
  email: data.email?.trim() || null,
  joining_date: data.joining_date || null,
  office_id: data.office_id || null,
  status: data.status || 'Active'
});

const replaceRelatedData = async (client, employeeId, data) => {
  for (const table of RELATED_TABLES) {
    await client.query(`DELETE FROM ${table} WHERE employee_id = $1`, [employeeId]);
  }

  for (const item of data.work || []) {
    if (!item.work_type?.trim()) continue;
    await client.query(
      `INSERT INTO employee_work (employee_id, work_type, description)
       VALUES ($1, $2, $3)`,
      [employeeId, item.work_type.trim(), item.description?.trim() || null]
    );
  }

  for (const item of data.authority || []) {
    if (!item.authority_level) continue;
    await client.query(
      `INSERT INTO employee_authority (employee_id, authority_level)
       VALUES ($1, $2)`,
      [employeeId, item.authority_level]
    );
  }

  for (const item of data.assets || []) {
    if (!item.device_type?.trim()) continue;
    await client.query(
      `INSERT INTO employee_assets
       (employee_id, device_type, device_name, assigned_date, return_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        employeeId,
        item.device_type.trim(),
        item.device_name?.trim() || null,
        item.assigned_date || null,
        item.return_date || null,
        item.status || 'Assigned',
        item.notes?.trim() || null
      ]
    );
  }

  for (const item of data.account_access || data.accountAccess || []) {
    if (!item.account_type?.trim()) continue;
    await client.query(
      `INSERT INTO employee_account_access
       (employee_id, account_type, access_level, notes)
       VALUES ($1, $2, $3, $4)`,
      [
        employeeId,
        item.account_type.trim(),
        item.access_level || 'View',
        item.notes?.trim() || null
      ]
    );
  }

  for (const item of data.stationary || []) {
    if (!item.stationary_item?.trim()) continue;
    await client.query(
      `INSERT INTO employee_stationary
       (employee_id, stationary_item, quantity, assigned_date, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        employeeId,
        item.stationary_item.trim(),
        Number(item.quantity) || 1,
        item.assigned_date || null,
        item.notes?.trim() || null
      ]
    );
  }
};

class EmployeeService {
  async getAllEmployees({ office_id, status } = {}) {
    const conditions = [];
    const params = [];

    if (office_id) {
      params.push(office_id);
      conditions.push(`e.office_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`e.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT e.*, o.name AS office_name
       FROM employees e
       LEFT JOIN offices o ON e.office_id = o.id
       ${where}
       ORDER BY e.created_at DESC`,
      params
    );
    return result.rows;
  }

  async getEmployeeById(id, client = pool) {
    const result = await client.query(
      `SELECT e.*, o.name AS office_name
       FROM employees e
       LEFT JOIN offices o ON e.office_id = o.id
       WHERE e.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      const error = new Error('Employee not found');
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  }

  async createEmployee(employeeData) {
    const employee = normalizeEmployee(employeeData);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO employees
         (full_name, picture, designation, phone_number, email, joining_date, office_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          employee.full_name,
          employee.picture,
          employee.designation,
          employee.phone_number,
          employee.email,
          employee.joining_date,
          employee.office_id,
          employee.status
        ]
      );
      await replaceRelatedData(client, result.rows[0].id, employeeData);
      await client.query('COMMIT');
      return this.getEmployeeWithRelatedData(result.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateEmployee(id, employeeData) {
    const employee = normalizeEmployee(employeeData);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await client.query(
        `UPDATE employees
         SET full_name = $1, picture = $2, designation = $3, phone_number = $4,
             email = $5, joining_date = $6, office_id = $7, status = $8
         WHERE id = $9
         RETURNING id`,
        [
          employee.full_name,
          employee.picture,
          employee.designation,
          employee.phone_number,
          employee.email,
          employee.joining_date,
          employee.office_id,
          employee.status,
          id
        ]
      );

      if (!result.rows[0]) {
        const error = new Error('Employee not found');
        error.status = 404;
        throw error;
      }

      await replaceRelatedData(client, id, employeeData);
      await client.query('COMMIT');
      return this.getEmployeeWithRelatedData(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteEmployee(id) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE asset_assignments
         SET assigned_employee_id = NULL,
             assignment_date = NULL,
             return_date = NULL,
             status = CASE WHEN status = 'Assigned' THEN 'Available' ELSE status END
         WHERE assigned_employee_id = $1`,
        [id]
      );
      const result = await client.query(
        'DELETE FROM employees WHERE id = $1 RETURNING *',
        [id]
      );

      if (!result.rows[0]) {
        const error = new Error('Employee not found');
        error.status = 404;
        throw error;
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getEmployeeWithRelatedData(id) {
    const employee = await this.getEmployeeById(id);
    const [work, authority, assets, accountAccess, stationary] = await Promise.all([
      pool.query('SELECT * FROM employee_work WHERE employee_id = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM employee_authority WHERE employee_id = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM employee_assets WHERE employee_id = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM employee_account_access WHERE employee_id = $1 ORDER BY id', [id]),
      pool.query('SELECT * FROM employee_stationary WHERE employee_id = $1 ORDER BY id', [id])
    ]);

    return {
      ...employee,
      work: work.rows,
      authority: authority.rows,
      assets: assets.rows,
      account_access: accountAccess.rows,
      stationary: stationary.rows
    };
  }
}

module.exports = new EmployeeService();

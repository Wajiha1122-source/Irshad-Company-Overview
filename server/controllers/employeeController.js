const pool = require('../config/db');

// Get All Employees
const getAllEmployees = async (req, res) => {
  try {
    const { office_id, status } = req.query;
    let query = 'SELECT e.*, o.name as office_name FROM employees e LEFT JOIN offices o ON e.office_id = o.id';
    const params = [];
    const conditions = [];
    
    if (office_id) {
      conditions.push(`e.office_id = $${params.length + 1}`);
      params.push(office_id);
    }
    
    if (status) {
      conditions.push(`e.status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY e.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT e.*, o.name as office_name FROM employees e LEFT JOIN offices o ON e.office_id = o.id WHERE e.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get employee work
    const workResult = await pool.query(
      'SELECT * FROM employee_work WHERE employee_id = $1',
      [id]
    );
    
    // Get employee authority
    const authorityResult = await pool.query(
      'SELECT * FROM employee_authority WHERE employee_id = $1',
      [id]
    );
    
    // Get employee assets
    const assetsResult = await pool.query(
      'SELECT * FROM employee_assets WHERE employee_id = $1',
      [id]
    );
    
    // Get employee account access
    const accessResult = await pool.query(
      'SELECT * FROM employee_account_access WHERE employee_id = $1',
      [id]
    );
    
    // Get employee stationary
    const stationaryResult = await pool.query(
      'SELECT * FROM employee_stationary WHERE employee_id = $1',
      [id]
    );
    
    const employee = result.rows[0];
    employee.work = workResult.rows;
    employee.authority = authorityResult.rows;
    employee.assets = assetsResult.rows;
    employee.account_access = accessResult.rows;
    employee.stationary = stationaryResult.rows;
    
    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Employee
const createEmployee = async (req, res) => {
  try {
    const { full_name, picture, designation, phone_number, email, joining_date, office_id, status } = req.body;
    
    const result = await pool.query(
      'INSERT INTO employees (full_name, picture, designation, phone_number, email, joining_date, office_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [full_name, picture, designation, phone_number, email, joining_date, office_id, status || 'Active']
    );
    
    res.status(201).json({ message: 'Employee created successfully', employee: result.rows[0] });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, picture, designation, phone_number, email, joining_date, office_id, status } = req.body;
    
    const result = await pool.query(
      'UPDATE employees SET full_name = $1, picture = $2, designation = $3, phone_number = $4, email = $5, joining_date = $6, office_id = $7, status = $8 WHERE id = $9 RETURNING *',
      [full_name, picture, designation, phone_number, email, joining_date, office_id, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee updated successfully', employee: result.rows[0] });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Employee Work
const addEmployeeWork = async (req, res) => {
  try {
    const { employee_id, work_type, description } = req.body;
    
    const result = await pool.query(
      'INSERT INTO employee_work (employee_id, work_type, description) VALUES ($1, $2, $3) RETURNING *',
      [employee_id, work_type, description]
    );
    
    res.status(201).json({ message: 'Work added successfully', work: result.rows[0] });
  } catch (error) {
    console.error('Add work error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Employee Authority
const addEmployeeAuthority = async (req, res) => {
  try {
    const { employee_id, authority_level } = req.body;
    
    const result = await pool.query(
      'INSERT INTO employee_authority (employee_id, authority_level) VALUES ($1, $2) RETURNING *',
      [employee_id, authority_level]
    );
    
    res.status(201).json({ message: 'Authority added successfully', authority: result.rows[0] });
  } catch (error) {
    console.error('Add authority error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Employee Asset
const addEmployeeAsset = async (req, res) => {
  try {
    const { employee_id, device_type, device_name, assigned_date, return_date, status, notes } = req.body;
    
    const result = await pool.query(
      'INSERT INTO employee_assets (employee_id, device_type, device_name, assigned_date, return_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [employee_id, device_type, device_name, assigned_date, return_date, status, notes]
    );
    
    res.status(201).json({ message: 'Asset added successfully', asset: result.rows[0] });
  } catch (error) {
    console.error('Add asset error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Employee Account Access
const addEmployeeAccountAccess = async (req, res) => {
  try {
    const { employee_id, account_type, access_level, notes } = req.body;
    
    const result = await pool.query(
      'INSERT INTO employee_account_access (employee_id, account_type, access_level, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [employee_id, account_type, access_level, notes]
    );
    
    res.status(201).json({ message: 'Account access added successfully', access: result.rows[0] });
  } catch (error) {
    console.error('Add account access error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Employee Stationary
const addEmployeeStationary = async (req, res) => {
  try {
    const { employee_id, stationary_item, quantity, assigned_date, notes } = req.body;
    
    const result = await pool.query(
      'INSERT INTO employee_stationary (employee_id, stationary_item, quantity, assigned_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [employee_id, stationary_item, quantity, assigned_date, notes]
    );
    
    res.status(201).json({ message: 'Stationary added successfully', stationary: result.rows[0] });
  } catch (error) {
    console.error('Add stationary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addEmployeeWork,
  addEmployeeAuthority,
  addEmployeeAsset,
  addEmployeeAccountAccess,
  addEmployeeStationary
};

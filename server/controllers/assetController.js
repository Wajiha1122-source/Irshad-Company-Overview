const pool = require('../config/db');

// Get All Asset Assignments
const getAllAssetAssignments = async (req, res) => {
  try {
    const { office_id, status, assigned_employee_id } = req.query;
    let query = `
      SELECT a.*, o.name as office_name, e.full_name as employee_name 
      FROM asset_assignments a 
      LEFT JOIN offices o ON a.office_id = o.id 
      LEFT JOIN employees e ON a.assigned_employee_id = e.id
    `;
    const params = [];
    const conditions = [];
    
    if (office_id) {
      conditions.push(`a.office_id = $${params.length + 1}`);
      params.push(office_id);
    }
    
    if (status) {
      conditions.push(`a.status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (assigned_employee_id) {
      conditions.push(`a.assigned_employee_id = $${params.length + 1}`);
      params.push(assigned_employee_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ assignments: result.rows });
  } catch (error) {
    console.error('Get asset assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Asset Assignment by ID
const getAssetAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT a.*, o.name as office_name, e.full_name as employee_name 
       FROM asset_assignments a 
       LEFT JOIN offices o ON a.office_id = o.id 
       LEFT JOIN employees e ON a.assigned_employee_id = e.id
       WHERE a.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Asset assignment not found' });
    }
    
    res.json({ assignment: result.rows[0] });
  } catch (error) {
    console.error('Get asset assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Asset Assignment
const createAssetAssignment = async (req, res) => {
  try {
    const { asset_code, asset_name, office_id, assigned_employee_id, assignment_date, return_date, status, notes } = req.body;
    
    const result = await pool.query(
      'INSERT INTO asset_assignments (asset_code, asset_name, office_id, assigned_employee_id, assignment_date, return_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [asset_code, asset_name, office_id, assigned_employee_id, assignment_date, return_date, status || 'Available', notes]
    );
    
    res.status(201).json({ message: 'Asset assignment created successfully', assignment: result.rows[0] });
  } catch (error) {
    console.error('Create asset assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Asset Assignment
const updateAssetAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { asset_code, asset_name, office_id, assigned_employee_id, assignment_date, return_date, status, notes } = req.body;
    
    const result = await pool.query(
      'UPDATE asset_assignments SET asset_code = $1, asset_name = $2, office_id = $3, assigned_employee_id = $4, assignment_date = $5, return_date = $6, status = $7, notes = $8 WHERE id = $9 RETURNING *',
      [asset_code, asset_name, office_id, assigned_employee_id, assignment_date, return_date, status, notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Asset assignment not found' });
    }
    
    res.json({ message: 'Asset assignment updated successfully', assignment: result.rows[0] });
  } catch (error) {
    console.error('Update asset assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Asset Assignment
const deleteAssetAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM asset_assignments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Asset assignment not found' });
    }
    
    res.json({ message: 'Asset assignment deleted successfully' });
  } catch (error) {
    console.error('Delete asset assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllAssetAssignments,
  getAssetAssignmentById,
  createAssetAssignment,
  updateAssetAssignment,
  deleteAssetAssignment
};

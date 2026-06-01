const pool = require('../config/db');

// Get All Activity Logs
const getAllActivityLogs = async (req, res) => {
  try {
    const { user_id, module, limit = 50 } = req.query;
    let query = `
      SELECT al.*, u.full_name as user_name 
      FROM activity_logs al 
      LEFT JOIN users u ON al.user_id = u.id
    `;
    const params = [];
    const conditions = [];
    
    if (user_id) {
      conditions.push(`al.user_id = $${params.length + 1}`);
      params.push(user_id);
    }
    
    if (module) {
      conditions.push(`al.module = $${params.length + 1}`);
      params.push(module);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY al.timestamp DESC LIMIT $' + (params.length + 1);
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Activity Log
const createActivityLog = async (req, res) => {
  try {
    const { user_id, action, module, previous_value, new_value } = req.body;
    
    const result = await pool.query(
      'INSERT INTO activity_logs (user_id, action, module, previous_value, new_value) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, action, module, previous_value, new_value]
    );
    
    res.status(201).json({ message: 'Activity log created successfully', log: result.rows[0] });
  } catch (error) {
    console.error('Create activity log error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllActivityLogs,
  createActivityLog
};

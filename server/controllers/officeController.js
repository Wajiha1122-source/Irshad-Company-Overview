const pool = require('../config/db');

// Get All Offices
const getAllOffices = async (req, res) => {
  try {
    console.log('[GET /api/offices] Fetching all offices');
    const result = await pool.query('SELECT * FROM offices ORDER BY id');
    
    res.json({
      success: true,
      message: 'Offices retrieved successfully',
      data: result.rows,
      meta: { count: result.rows.length }
    });
  } catch (error) {
    console.error('[GET /api/offices] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Office by ID
const getOfficeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[GET /api/offices/${id}] Fetching office details`);
    
    const result = await pool.query('SELECT * FROM offices WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Office retrieved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`[GET /api/offices/${req.params.id}] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create Office
const createOffice = async (req, res) => {
  try {
    console.log('[POST /api/offices] Creating new office');
    const { name, location } = req.body;
    
    const result = await pool.query(
      'INSERT INTO offices (name, location) VALUES ($1, $2) RETURNING *',
      [name, location]
    );
    
    res.status(201).json({
      success: true,
      message: 'Office created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[POST /api/offices] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Office
const updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[PUT /api/offices/${id}] Updating office`);
    const { name, location } = req.body;
    
    const result = await pool.query(
      'UPDATE offices SET name = $1, location = $2 WHERE id = $3 RETURNING *',
      [name, location, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Office updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`[PUT /api/offices/${req.params.id}] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete Office
const deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DELETE /api/offices/${id}] Deleting office`);
    
    const result = await pool.query('DELETE FROM offices WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Office deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(`[DELETE /api/offices/${req.params.id}] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice
};

const pool = require('../config/db');

// Get All Offices
const getAllOffices = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offices ORDER BY id');
    res.json({ offices: result.rows });
  } catch (error) {
    console.error('Get offices error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Office by ID
const getOfficeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM offices WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Office not found' });
    }
    
    res.json({ office: result.rows[0] });
  } catch (error) {
    console.error('Get office error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Office
const createOffice = async (req, res) => {
  try {
    const { name, location } = req.body;
    
    const result = await pool.query(
      'INSERT INTO offices (name, location) VALUES ($1, $2) RETURNING *',
      [name, location]
    );
    
    res.status(201).json({ message: 'Office created successfully', office: result.rows[0] });
  } catch (error) {
    console.error('Create office error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Office
const updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    
    const result = await pool.query(
      'UPDATE offices SET name = $1, location = $2 WHERE id = $3 RETURNING *',
      [name, location, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Office not found' });
    }
    
    res.json({ message: 'Office updated successfully', office: result.rows[0] });
  } catch (error) {
    console.error('Update office error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Office
const deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM offices WHERE id = $3 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Office not found' });
    }
    
    res.json({ message: 'Office deleted successfully' });
  } catch (error) {
    console.error('Delete office error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice
};

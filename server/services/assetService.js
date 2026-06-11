const pool = require('../config/db');

class AssetService {
  async getAssetsByEmployeeId(employeeId) {
    const result = await pool.query(
      'SELECT * FROM employee_assets WHERE employee_id = $1 ORDER BY id',
      [employeeId]
    );
    return result.rows;
  }

  async createAsset(employeeId, assetData) {
    const { device_type, device_name, assigned_date, return_date, status, notes } = assetData;
    
    const result = await pool.query(
      `INSERT INTO employee_assets (employee_id, device_type, device_name, assigned_date, return_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [employeeId, device_type, device_name, assigned_date, return_date, status, notes]
    );
    
    return result.rows[0];
  }

  async deleteAssetsByEmployeeId(employeeId) {
    const result = await pool.query(
      `DELETE FROM employee_assets WHERE employee_id = $1 RETURNING *`,
      [employeeId]
    );
    
    return {
      deletedCount: result.rowCount,
      deletedItems: result.rows
    };
  }

  async deleteAssetById(assetId) {
    const result = await pool.query(
      `DELETE FROM employee_assets WHERE id = $1 RETURNING *`,
      [assetId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Asset item not found');
    }
    
    return result.rows[0];
  }
}

module.exports = new AssetService();

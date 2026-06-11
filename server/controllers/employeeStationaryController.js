const stationaryService = require('../services/stationaryService');

const getStationary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[GET /employees/${employeeId}/stationary] Fetching stationary items`);
    
    const stationary = await stationaryService.getStationaryByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: 'Stationary items retrieved successfully',
      data: stationary,
      meta: { count: stationary.length }
    });
  } catch (error) {
    console.error(`[GET /employees/${req.params.employeeId}/stationary] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const addStationary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[POST /employees/${employeeId}/stationary] Adding stationary item`);
    
    const stationary = await stationaryService.createStationary(employeeId, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Stationary item created successfully',
      data: stationary
    });
  } catch (error) {
    console.error(`[POST /employees/${req.params.employeeId}/stationary] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAllStationary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/stationary] Deleting all stationary items`);
    
    const result = await stationaryService.deleteStationaryByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} stationary item(s)`,
      data: result.deletedItems,
      meta: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/stationary] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteStationaryItem = async (req, res) => {
  try {
    const { employeeId, stationaryId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/stationary/${stationaryId}] Deleting stationary item`);
    
    const stationary = await stationaryService.deleteStationaryById(stationaryId);
    
    res.json({
      success: true,
      message: 'Stationary item deleted successfully',
      data: stationary
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/stationary/${req.params.stationaryId}] Error:`, error.message);
    
    if (error.message === 'Stationary item not found') {
      res.status(404).json({
        success: false,
        message: 'Stationary item not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
};

module.exports = {
  getStationary,
  addStationary,
  deleteAllStationary,
  deleteStationaryItem
};

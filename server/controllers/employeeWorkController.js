const workService = require('../services/workService');

const getWork = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[GET /employees/${employeeId}/work] Fetching work items`);
    
    const work = await workService.getWorkByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: 'Work items retrieved successfully',
      data: work,
      meta: { count: work.length }
    });
  } catch (error) {
    console.error(`[GET /employees/${req.params.employeeId}/work] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const addWork = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[POST /employees/${employeeId}/work] Adding work item`);
    
    const work = await workService.createWork(employeeId, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Work item created successfully',
      data: work
    });
  } catch (error) {
    console.error(`[POST /employees/${req.params.employeeId}/work] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAllWork = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/work] Deleting all work items`);
    
    const result = await workService.deleteWorkByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} work item(s)`,
      data: result.deletedItems,
      meta: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/work] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteWorkItem = async (req, res) => {
  try {
    const { employeeId, workId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/work/${workId}] Deleting work item`);
    
    const work = await workService.deleteWorkById(workId);
    
    res.json({
      success: true,
      message: 'Work item deleted successfully',
      data: work
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/work/${req.params.workId}] Error:`, error.message);
    
    if (error.message === 'Work item not found') {
      res.status(404).json({
        success: false,
        message: 'Work item not found'
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
  getWork,
  addWork,
  deleteAllWork,
  deleteWorkItem
};

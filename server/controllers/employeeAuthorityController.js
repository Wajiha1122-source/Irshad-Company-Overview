const authorityService = require('../services/authorityService');

const getAuthority = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[GET /employees/${employeeId}/authority] Fetching authority items`);
    
    const authority = await authorityService.getAuthorityByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: 'Authority items retrieved successfully',
      data: authority,
      meta: { count: authority.length }
    });
  } catch (error) {
    console.error(`[GET /employees/${req.params.employeeId}/authority] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const addAuthority = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[POST /employees/${employeeId}/authority] Adding authority item`);
    
    const authority = await authorityService.createAuthority(employeeId, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Authority item created successfully',
      data: authority
    });
  } catch (error) {
    console.error(`[POST /employees/${req.params.employeeId}/authority] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAllAuthority = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/authority] Deleting all authority items`);
    
    const result = await authorityService.deleteAuthorityByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} authority item(s)`,
      data: result.deletedItems,
      meta: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/authority] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAuthorityItem = async (req, res) => {
  try {
    const { employeeId, authorityId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/authority/${authorityId}] Deleting authority item`);
    
    const authority = await authorityService.deleteAuthorityById(authorityId);
    
    res.json({
      success: true,
      message: 'Authority item deleted successfully',
      data: authority
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/authority/${req.params.authorityId}] Error:`, error.message);
    
    if (error.message === 'Authority item not found') {
      res.status(404).json({
        success: false,
        message: 'Authority item not found'
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
  getAuthority,
  addAuthority,
  deleteAllAuthority,
  deleteAuthorityItem
};

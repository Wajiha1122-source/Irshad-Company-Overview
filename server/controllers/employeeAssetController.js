const assetService = require('../services/assetService');

const getAssets = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[GET /employees/${employeeId}/assets] Fetching asset items`);
    
    const assets = await assetService.getAssetsByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: 'Asset items retrieved successfully',
      data: assets,
      meta: { count: assets.length }
    });
  } catch (error) {
    console.error(`[GET /employees/${req.params.employeeId}/assets] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const addAsset = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[POST /employees/${employeeId}/assets] Adding asset item`);
    
    const asset = await assetService.createAsset(employeeId, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Asset item created successfully',
      data: asset
    });
  } catch (error) {
    console.error(`[POST /employees/${req.params.employeeId}/assets] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAllAssets = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/assets] Deleting all asset items`);
    
    const result = await assetService.deleteAssetsByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} asset item(s)`,
      data: result.deletedItems,
      meta: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/assets] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAssetItem = async (req, res) => {
  try {
    const { employeeId, assetId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/assets/${assetId}] Deleting asset item`);
    
    const asset = await assetService.deleteAssetById(assetId);
    
    res.json({
      success: true,
      message: 'Asset item deleted successfully',
      data: asset
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/assets/${req.params.assetId}] Error:`, error.message);
    
    if (error.message === 'Asset item not found') {
      res.status(404).json({
        success: false,
        message: 'Asset item not found'
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
  getAssets,
  addAsset,
  deleteAllAssets,
  deleteAssetItem
};

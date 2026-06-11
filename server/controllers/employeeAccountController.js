const accountService = require('../services/accountService');

const getAccounts = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[GET /employees/${employeeId}/account-access] Fetching account access items`);
    
    const accounts = await accountService.getAccountsByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: 'Account access items retrieved successfully',
      data: accounts,
      meta: { count: accounts.length }
    });
  } catch (error) {
    console.error(`[GET /employees/${req.params.employeeId}/account-access] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const addAccount = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[POST /employees/${employeeId}/account-access] Adding account access item`);
    
    const account = await accountService.createAccount(employeeId, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Account access item created successfully',
      data: account
    });
  } catch (error) {
    console.error(`[POST /employees/${req.params.employeeId}/account-access] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAllAccounts = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/account-access] Deleting all account access items`);
    
    const result = await accountService.deleteAccountsByEmployeeId(employeeId);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} account access item(s)`,
      data: result.deletedItems,
      meta: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/account-access] Error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteAccountItem = async (req, res) => {
  try {
    const { employeeId, accountId } = req.params;
    console.log(`[DELETE /employees/${employeeId}/account-access/${accountId}] Deleting account access item`);
    
    const account = await accountService.deleteAccountById(accountId);
    
    res.json({
      success: true,
      message: 'Account access item deleted successfully',
      data: account
    });
  } catch (error) {
    console.error(`[DELETE /employees/${req.params.employeeId}/account-access/${req.params.accountId}] Error:`, error.message);
    
    if (error.message === 'Account access item not found') {
      res.status(404).json({
        success: false,
        message: 'Account access item not found'
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
  getAccounts,
  addAccount,
  deleteAllAccounts,
  deleteAccountItem
};

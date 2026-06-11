const employeeService = require('../services/employeeService');

// Get All Employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getAllEmployees(req.query);
    res.json({
      success: true,
      message: 'Employees retrieved successfully',
      employees,
      data: employees,
      meta: { count: employees.length }
    });
  } catch (error) {
    console.error('[GET /api/employees] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[GET /api/employees/${id}] Fetching employee details`);
    const employee = await employeeService.getEmployeeWithRelatedData(id);

    res.json({
      success: true,
      message: 'Employee retrieved successfully',
      data: employee
    });
  } catch (error) {
    console.error(`[GET /api/employees/${req.params.id}] Error:`, error.message);
    if (error.message === 'Employee not found') {
      res.status(404).json({
        success: false,
        message: 'Employee not found'
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

// Create Employee
const createEmployee = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('[POST /api/employees] Error:', error.message);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Unable to create employee',
      error: error.message
    });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.updateEmployee(id, req.body);
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error(`[PUT /api/employees/${req.params.id}] Error:`, error.message);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Unable to update employee',
      error: error.message
    });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.deleteEmployee(id);
    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: employee
    });
  } catch (error) {
    console.error(`[DELETE /api/employees/${req.params.id}] Error:`, error.message);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : 'Unable to delete employee',
      error: error.message
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};

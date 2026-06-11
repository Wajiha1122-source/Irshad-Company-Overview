import api from './axios';

const employeeAccountAPI = {
  add: async (employeeId, accountData) => {
    const response = await api.post('/employees/account-access', {
      employee_id: employeeId,
      ...accountData
    });
    return response.data;
  },

  deleteAll: async (employeeId) => {
    const response = await api.delete(`/employees/account-access/${employeeId}`);
    return response.data;
  },

  deleteItem: async (accountId) => {
    const response = await api.delete(`/employees/account-access/item/${accountId}`);
    return response.data;
  }
};

export default employeeAccountAPI;
import api from './axios';

const employeeAuthorityAPI = {
  add: async (employeeId, authorityData) => {
    const response = await api.post('/employees/authority', {
      employee_id: employeeId,
      ...authorityData
    });
    return response.data;
  },

  deleteAll: async (employeeId) => {
    const response = await api.delete(`/employees/authority/${employeeId}`);
    return response.data;
  },

  deleteItem: async (authorityId) => {
    const response = await api.delete(`/employees/authority/item/${authorityId}`);
    return response.data;
  }
};

export default employeeAuthorityAPI;
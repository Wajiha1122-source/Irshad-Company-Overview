import api from './axios';

const employeeAssetAPI = {
  add: async (employeeId, assetData) => {
    const response = await api.post('/employees/assets', {
      employee_id: employeeId,
      ...assetData
    });
    return response.data;
  },

  deleteAll: async (employeeId) => {
    const response = await api.delete(`/employees/assets/${employeeId}`);
    return response.data;
  },

  deleteItem: async (assetId) => {
    const response = await api.delete(`/employees/assets/item/${assetId}`);
    return response.data;
  }
};

export default employeeAssetAPI;
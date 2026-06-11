import api from './axios';

const employeeStationaryAPI = {
  add: async (employeeId, stationaryData) => {
    const response = await api.post('/employees/stationary', {
      employee_id: employeeId,
      ...stationaryData
    });
    return response.data;
  },

  deleteAll: async (employeeId) => {
    const response = await api.delete(`/employees/stationary/${employeeId}`);
    return response.data;
  },

  deleteItem: async (stationaryId) => {
    const response = await api.delete(`/employees/stationary/item/${stationaryId}`);
    return response.data;
  }
};

export default employeeStationaryAPI;
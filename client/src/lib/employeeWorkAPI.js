import api from './axios';

const employeeWorkAPI = {
  add: async (employeeId, workData) => {
    const response = await api.post('/employees/work', {
      employee_id: employeeId,
      ...workData
    });
    return response.data;
  },

  deleteAll: async (employeeId) => {
    const response = await api.delete(`/employees/work/${employeeId}`);
    return response.data;
  },

  deleteItem: async (workId) => {
    const response = await api.delete(`/employees/work/item/${workId}`);
    return response.data;
  }
};

export default employeeWorkAPI;
import api from './axios';

const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    if (response.data.data) return response.data.data;
    if (response.data.employee) return response.data.employee;
    if (response.data) return response.data;
    return null;
  },

  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data.data;
  },

  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    if (response.data.data) return response.data.data;
    if (response.data.employee) return response.data.employee;
    if (response.data) return response.data;
    return null;
  },

  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data.data;
  }
};

export default employeeAPI;

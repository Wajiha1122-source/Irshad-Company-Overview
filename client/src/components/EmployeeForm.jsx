import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';

const EmployeeForm = ({ isOpen, onClose, employee, onSuccess }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    phone_number: '',
    email: '',
    joining_date: '',
    office_id: '',
    status: 'Active',
  });
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffices();
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const fetchOffices = async () => {
    try {
      const response = await api.get('/offices');
      setOffices(response.data.offices);
    } catch (error) {
      console.error('Error fetching offices:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (employee) {
        await api.put(`/employees/${employee.id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit Employee' : 'Add Employee'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Full Name *
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Designation
          </label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone Number
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Joining Date
          </label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Office *
          </label>
          <select
            name="office_id"
            value={formData.office_id}
            onChange={handleChange}
            required
            className={`
              field appearance-none
            `}
          >
            <option value="">Select Office</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`
              field appearance-none
            `}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="ghost-button flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="primary-button flex-1 disabled:opacity-50"
          >
            {loading ? 'Saving...' : employee ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeForm;

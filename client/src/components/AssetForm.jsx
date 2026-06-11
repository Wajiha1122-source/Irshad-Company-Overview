import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';

const AssetForm = ({ isOpen, onClose, asset, onSuccess }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    asset_code: '',
    asset_name: '',
    office_id: '',
    assigned_employee_id: '',
    assignment_date: '',
    return_date: '',
    status: 'Available',
    notes: '',
  });
  const [offices, setOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    fetchData();
    if (asset) {
      setFormData(asset);
    }
  }, [isOpen, asset]);

  const fetchData = async () => {
    try {
      const [officesRes, employeesRes] = await Promise.all([
        api.get('/offices'),
        api.get('/employees')
      ]);
      setOffices(officesRes.data.offices || officesRes.data.data || []);
      setEmployees(employeesRes.data.employees || employeesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (asset) {
        await api.put(`/assets/${asset.id}`, formData);
      } else {
        await api.post('/assets', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Error saving asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={asset ? 'Edit Asset Assignment' : 'Add Asset Assignment'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Asset Code *
          </label>
          <input
            type="text"
            name="asset_code"
            value={formData.asset_code}
            onChange={handleChange}
            required
            placeholder="e.g., LAP-001"
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Asset Name *
          </label>
          <input
            type="text"
            name="asset_name"
            value={formData.asset_name}
            onChange={handleChange}
            required
            placeholder="e.g., Dell Laptop"
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
            Assigned Employee
          </label>
          <select
            name="assigned_employee_id"
            value={formData.assigned_employee_id}
            onChange={handleChange}
            className={`
              field appearance-none
            `}
          >
            <option value="">Not Assigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Assignment Date
          </label>
          <input
            type="date"
            name="assignment_date"
            value={formData.assignment_date}
            onChange={handleChange}
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Return Date
          </label>
          <input
            type="date"
            name="return_date"
            value={formData.return_date}
            onChange={handleChange}
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Status *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className={`
              field appearance-none
            `}
          >
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Under Repair">Under Repair</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className={`
              field
            `}
          />
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
            {loading ? 'Saving...' : asset ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssetForm;

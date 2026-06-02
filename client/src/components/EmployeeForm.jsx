import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import { Plus, Trash2, Upload } from 'lucide-react';

const EmployeeForm = ({ isOpen, onClose, employee, onSuccess }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    full_name: '',
    picture: '',
    designation: '',
    phone_number: '',
    email: '',
    joining_date: '',
    office_id: '',
    status: 'Active',
  });
  const [work, setWork] = useState([{ work_type: '', description: '' }]);
  const [authority, setAuthority] = useState([{ authority_level: '' }]);
  const [devices, setDevices] = useState([{ device_type: '', device_name: '', quantity: 1, assigned_date: '', notes: '' }]);
  const [accounts, setAccounts] = useState([{ account_type: '', access_level: '', notes: '' }]);
  const [stationary, setStationary] = useState([{ stationary_item: '', quantity: 1, assigned_date: '', notes: '' }]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffices();
    if (employee) {
      setFormData(employee);
      if (employee.work && employee.work.length > 0) setWork(employee.work);
      if (employee.authority && employee.authority.length > 0) setAuthority(employee.authority);
      if (employee.assets && employee.assets.length > 0) setDevices(employee.assets);
      if (employee.account_access && employee.account_access.length > 0) setAccounts(employee.account_access);
      if (employee.stationary && employee.stationary.length > 0) setStationary(employee.stationary);
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
      let employeeId;
      if (employee) {
        const result = await api.put(`/employees/${employee.id}`, formData);
        employeeId = employee.id;
      } else {
        const result = await api.post('/employees', formData);
        employeeId = result.data.employee.id;
      }

      // Save related data
      await Promise.all([
        ...work.filter(w => w.work_type).map(w => 
          api.post('/employees/work', { employee_id: employeeId, ...w })
        ),
        ...authority.filter(a => a.authority_level).map(a => 
          api.post('/employees/authority', { employee_id: employeeId, ...a })
        ),
        ...devices.filter(d => d.device_type).map(d => 
          api.post('/employees/assets', { employee_id: employeeId, ...d })
        ),
        ...accounts.filter(a => a.account_type).map(a => 
          api.post('/employees/account-access', { employee_id: employeeId, ...a })
        ),
        ...stationary.filter(s => s.stationary_item).map(s => 
          api.post('/employees/stationary', { employee_id: employeeId, ...s })
        ),
      ]);

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

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addArrayItem = (setter, array) => {
    setter([...array, {}]);
  };

  const removeArrayItem = (setter, array, index) => {
    setter(array.filter((_, i) => i !== index));
  };

  const updateArrayItem = (setter, array, index, field, value) => {
    const newArray = [...array];
    newArray[index] = { ...newArray[index], [field]: value };
    setter(newArray);
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
            Picture
          </label>
          <div className="flex items-center gap-4">
            {formData.picture && (
              <img src={formData.picture} alt="Employee" className="w-16 h-16 rounded-full object-cover" />
            )}
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300">
              <Upload size={16} />
              <span>Upload Picture</span>
              <input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" />
            </label>
          </div>
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

        {/* Work Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Work Information</h3>
          {work.map((item, index) => (
            <div key={index} className="space-y-3 mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Work Type"
                  value={item.work_type || ''}
                  onChange={(e) => updateArrayItem(setWork, work, index, 'work_type', e.target.value)}
                  className="field flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(setWork, work, index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                placeholder="Description"
                value={item.description || ''}
                onChange={(e) => updateArrayItem(setWork, work, index, 'description', e.target.value)}
                rows="2"
                className="field"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(setWork, work)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} /> Add Work
          </button>
        </div>

        {/* Authority Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Authority</h3>
          {authority.map((item, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <select
                value={item.authority_level || ''}
                onChange={(e) => updateArrayItem(setAuthority, authority, index, 'authority_level', e.target.value)}
                className="field flex-1 appearance-none"
              >
                <option value="">Select Authority Level</option>
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Employee">Employee</option>
                <option value="Intern">Intern</option>
              </select>
              <button
                type="button"
                onClick={() => removeArrayItem(setAuthority, authority, index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(setAuthority, authority)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} /> Add Authority
          </button>
        </div>

        {/* Devices Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Access to Devices</h3>
          {devices.map((item, index) => (
            <div key={index} className="space-y-3 mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Device Type"
                  value={item.device_type || ''}
                  onChange={(e) => updateArrayItem(setDevices, devices, index, 'device_type', e.target.value)}
                  className="field flex-1"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity || 1}
                  onChange={(e) => updateArrayItem(setDevices, devices, index, 'quantity', parseInt(e.target.value) || 1)}
                  className="field w-20"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(setDevices, devices, index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Device Name"
                value={item.device_name || ''}
                onChange={(e) => updateArrayItem(setDevices, devices, index, 'device_name', e.target.value)}
                className="field"
              />
              <input
                type="date"
                value={item.assigned_date || ''}
                onChange={(e) => updateArrayItem(setDevices, devices, index, 'assigned_date', e.target.value)}
                className="field"
              />
              <textarea
                placeholder="Notes"
                value={item.notes || ''}
                onChange={(e) => updateArrayItem(setDevices, devices, index, 'notes', e.target.value)}
                rows="2"
                className="field"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(setDevices, devices)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} /> Add Device
          </button>
        </div>

        {/* Accounts Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Access to Company Accounts</h3>
          {accounts.map((item, index) => (
            <div key={index} className="space-y-3 mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Account Type"
                  value={item.account_type || ''}
                  onChange={(e) => updateArrayItem(setAccounts, accounts, index, 'account_type', e.target.value)}
                  className="field flex-1"
                />
                <select
                  value={item.access_level || ''}
                  onChange={(e) => updateArrayItem(setAccounts, accounts, index, 'access_level', e.target.value)}
                  className="field appearance-none"
                >
                  <option value="">Access Level</option>
                  <option value="View">View</option>
                  <option value="Edit">Edit</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeArrayItem(setAccounts, accounts, index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                placeholder="Notes"
                value={item.notes || ''}
                onChange={(e) => updateArrayItem(setAccounts, accounts, index, 'notes', e.target.value)}
                rows="2"
                className="field"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(setAccounts, accounts)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} /> Add Account Access
          </button>
        </div>

        {/* Stationary Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Stationary</h3>
          {stationary.map((item, index) => (
            <div key={index} className="space-y-3 mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Stationary Item"
                  value={item.stationary_item || ''}
                  onChange={(e) => updateArrayItem(setStationary, stationary, index, 'stationary_item', e.target.value)}
                  className="field flex-1"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity || 1}
                  onChange={(e) => updateArrayItem(setStationary, stationary, index, 'quantity', parseInt(e.target.value) || 1)}
                  className="field w-20"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(setStationary, stationary, index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <input
                type="date"
                value={item.assigned_date || ''}
                onChange={(e) => updateArrayItem(setStationary, stationary, index, 'assigned_date', e.target.value)}
                className="field"
              />
              <textarea
                placeholder="Notes"
                value={item.notes || ''}
                onChange={(e) => updateArrayItem(setStationary, stationary, index, 'notes', e.target.value)}
                rows="2"
                className="field"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(setStationary, stationary)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} /> Add Stationary
          </button>
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

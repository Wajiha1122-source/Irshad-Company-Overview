import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';

const InventoryForm = ({ isOpen, onClose, item, onSuccess }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    office_id: '',
    quantity: 0,
    notes: '',
  });
  const [categories, setCategories] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const fetchData = async () => {
    try {
      const [categoriesRes, officesRes] = await Promise.all([
        api.get('/inventory/categories'),
        api.get('/offices')
      ]);
      setCategories(categoriesRes.data.categories);
      setOffices(officesRes.data.offices);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await api.put(`/inventory/items/${item.id}`, formData);
      } else {
        await api.post('/inventory/items', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Inventory Item' : 'Add Inventory Item'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Item Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`
              field
            `}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Category *
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className={`
              field appearance-none
            `}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.type})
              </option>
            ))}
          </select>
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
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            className={`
              field
            `}
          />
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
            {loading ? 'Saving...' : item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryForm;

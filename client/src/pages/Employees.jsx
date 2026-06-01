import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmployeeForm from '../components/EmployeeForm';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Building,
  Calendar
} from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { isDark } = useTheme();

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedOffice]);

  const fetchData = async () => {
    try {
      const [employeesRes, officesRes] = await Promise.all([
        api.get('/employees', { params: { office_id: selectedOffice } }),
        api.get('/offices')
      ]);
      setEmployees(employeesRes.data.employees);
      setOffices(officesRes.data.offices);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="page-heading">
            Employees
          </h1>
          <p className="page-subtitle">
            Manage company employees
          </p>
        </div>
        <button
          onClick={handleAddEmployee}
          className="primary-button w-full sm:w-auto"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <GlassCard className="mb-6" hover={false}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                field pl-11
              `}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className={`
                field pl-11 pr-8 md:w-56
              `}
            >
              <option value="">All Offices</option>
              {offices.map(office => (
                <option key={office.id} value={office.id}>{office.name}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <GlassCard key={employee.id} hover>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 font-bold text-white shadow-md shadow-blue-600/20">
                  {employee.full_name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-950 dark:text-white">{employee.full_name}</h3>
                  <p className={`truncate text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {employee.designation}
                  </p>
                </div>
              </div>
              <span className={`
                px-3 py-1.5 rounded-full text-xs font-medium
                ${employee.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
                }
              `}>
                {employee.status}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <Mail size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span className={`truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{employee.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{employee.phone_number}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{employee.office_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleEditEmployee(employee)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
              >
                <Edit size={14} />
                Edit
              </button>
              <button 
                onClick={() => handleDeleteEmployee(employee.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-16">
          <UserPlus size={48} className={isDark ? 'text-gray-600 mx-auto' : 'text-gray-400 mx-auto'} />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No employees found
          </p>
        </div>
      )}

      <EmployeeForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        employee={editingEmployee}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Employees;

import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeView from '../components/EmployeeView';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import employeeAPI from '../lib/employeeAPI';
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
  Calendar,
} from 'lucide-react';

const EmployeeCard = memo(({ employee, canManage, canDelete, onView, onEdit, onDelete }) => (
  <GlassCard hover onClick={() => onView(employee.id)} className="cursor-pointer">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        {employee.picture ? (
          <img
            src={employee.picture}
            alt={employee.full_name}
            loading="lazy"
            decoding="async"
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 font-bold text-white">
            {employee.full_name?.charAt(0) || 'U'}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{employee.full_name}</h3>
          <p className="truncate text-sm text-slate-300">{employee.designation || 'No designation'}</p>
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
        employee.status === 'Active'
          ? 'bg-emerald-950 text-emerald-200 ring-1 ring-emerald-700'
          : 'bg-rose-950 text-rose-200 ring-1 ring-rose-700'
      }`}>
        {employee.status}
      </span>
    </div>

    <div className="space-y-3 text-sm text-slate-200">
      <div className="flex min-w-0 items-center gap-3">
        <Mail size={16} className="shrink-0 text-slate-400" />
        <span className="truncate">{employee.email || 'No email'}</span>
      </div>
      <div className="flex items-center gap-3">
        <Phone size={16} className="shrink-0 text-slate-400" />
        <span>{employee.phone_number || 'No phone number'}</span>
      </div>
      <div className="flex items-center gap-3">
        <Building size={16} className="shrink-0 text-slate-400" />
        <span>{employee.office_name || 'No office'}</span>
      </div>
      <div className="flex items-center gap-3">
        <Calendar size={16} className="shrink-0 text-slate-400" />
        <span>{employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'No joining date'}</span>
      </div>
    </div>

    {(canManage || canDelete) && (
      <div className="mt-4 flex gap-3 border-t border-slate-700 pt-4">
        {canManage && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit(employee);
            }}
            className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 py-2 text-sm font-semibold text-blue-200 ring-1 ring-blue-800 hover:bg-blue-900"
          >
            <Edit size={14} />
            Edit
          </button>
        )}
        {canDelete && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(employee.id);
            }}
            className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-950 px-4 py-2 text-sm font-semibold text-rose-200 ring-1 ring-rose-800 hover:bg-rose-900"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>
    )}
  </GlassCard>
));

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewEmployeeId, setViewEmployeeId] = useState(null);
  const { user } = useAuth();
  const canManageEmployees = user?.role === 'Owner' || user?.role === 'Manager';
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const fetchData = useCallback(async () => {
    try {
      const [employeesRes, officesRes] = await Promise.all([
        api.get('/employees', { params: { office_id: selectedOffice } }),
        api.get('/offices')
      ]);
      setEmployees(employeesRes.data.employees || employeesRes.data.data || []);
      setOffices(officesRes.data.offices || officesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedOffice]);

  const handleAddEmployee = useCallback(() => {
    setEditingEmployee(null);
    setShowModal(true);
  }, []);

  const handleEditEmployee = useCallback((employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  }, []);

  const handleViewEmployee = useCallback((employeeId) => {
    setViewEmployeeId(employeeId);
  }, []);


  const handleDeleteEmployee = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert(error.response?.data?.message || 'Unable to delete employee.');
      }
    }
  }, [fetchData]);

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);


  const filteredEmployees = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) => (
      employee.full_name?.toLowerCase().includes(query) ||
      employee.email?.toLowerCase().includes(query) ||
      employee.designation?.toLowerCase().includes(query)
    ));
  }, [employees, deferredSearchTerm]);

if (loading) {
  return <SkeletonLoader />;
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
        {canManageEmployees && (
          <button
            onClick={handleAddEmployee}
            className="primary-button w-full sm:w-auto"
          >
            <Plus size={18} />
            Add Employee
          </button>
        )}
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
          <EmployeeCard
            key={employee.id}
            employee={employee}
            canManage={canManageEmployees}
            canDelete={user?.role === 'Owner'}
            onView={handleViewEmployee}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
          />
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-16">
          <UserPlus size={48} className="mx-auto text-slate-500" />
          <p className="mt-4 text-slate-300">
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
      <EmployeeView
        isOpen={!!viewEmployeeId}
        onClose={() => setViewEmployeeId(null)}
        employeeId={viewEmployeeId}
      />
    </div>
  );
};

export default Employees;

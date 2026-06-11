import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import employeeAPI from '../lib/employeeAPI';
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Briefcase, 
  Shield, 
  Laptop, 
  Key, 
  Package
} from 'lucide-react';

const EmployeeView = ({ isOpen, onClose, employeeId }) => {
  const { isDark } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId || !isOpen) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const employeeDetails = await employeeAPI.getById(employeeId);
        if (active) setEmployee(employeeDetails || null);
      } catch {
        if (active) setEmployee(null);
      } finally {
        if (active) setLoading(false);
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [employeeId, isOpen]);

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-200">Loading...</div>
        </div>
      </Modal>
    );
  }

  if (!employee) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-200">Employee not found</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details" size="large">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="flex items-start gap-4">
          {employee.picture ? (
            <img 
              src={employee.picture} 
              alt={employee.full_name} 
              className="h-20 w-20 shrink-0 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 font-bold text-white text-2xl shadow-md shadow-blue-600/20">
              {employee.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.full_name}</h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{employee.designation}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${employee.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
                }
              `}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Mail size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</span>
            </div>
            <p className={`ml-7 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{employee.email || 'N/A'}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Phone size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</span>
            </div>
            <p className={`ml-7 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{employee.phone_number || 'N/A'}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Building size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Office</span>
            </div>
            <p className={`ml-7 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{employee.office_name || 'N/A'}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Joining Date</span>
            </div>
            <p className={`ml-7 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Work Information */}
        {employee.work && employee.work.length > 0 && (
          <div>
            <h3 className={`flex items-center gap-2 font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Briefcase size={18} />
              Work Information
            </h3>
            <div className={`space-y-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4`}>
              {employee.work.map((item, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.work_type}</p>
                  {item.description && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Authority */}
        {employee.authority && employee.authority.length > 0 && (
          <div>
            <h3 className={`flex items-center gap-2 font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Shield size={18} />
              Authority
            </h3>
            <div className={`flex flex-wrap gap-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4`}>
              {employee.authority.map((item, index) => (
                <span key={index} className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                  {item.authority_level}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Devices */}
        {employee.assets && employee.assets.length > 0 && (
          <div>
            <h3 className={`flex items-center gap-2 font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Laptop size={18} />
              Assigned Devices
            </h3>
            <div className={`space-y-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4`}>
              {employee.assets.map((item, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.device_name}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.device_type}</p>
                    </div>
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {item.status}
                    </span>
                  </div>
                  {item.assigned_date && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Assigned: {new Date(item.assigned_date).toLocaleDateString()}
                    </p>
                  )}
                  {item.return_date && (
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Return: {new Date(item.return_date).toLocaleDateString()}
                    </p>
                  )}
                  {item.notes && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Access */}
        {employee.account_access && employee.account_access.length > 0 && (
          <div>
            <h3 className={`flex items-center gap-2 font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Key size={18} />
              Account Access
            </h3>
            <div className={`space-y-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4`}>
              {employee.account_access.map((item, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.account_type}</p>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                      {item.access_level}
                    </span>
                  </div>
                  {item.notes && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stationary */}
        {employee.stationary && employee.stationary.length > 0 && (
          <div>
            <h3 className={`flex items-center gap-2 font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Package size={18} />
              Stationary
            </h3>
            <div className={`space-y-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4`}>
              {employee.stationary.map((item, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.stationary_item}</p>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  {item.assigned_date && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Assigned: {new Date(item.assigned_date).toLocaleDateString()}
                    </p>
                  )}
                  {item.notes && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="primary-button"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeView;

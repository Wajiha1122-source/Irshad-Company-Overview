import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, UserRound } from 'lucide-react';
import Modal from './Modal';
import api from '../lib/axios';
import employeeAPI from '../lib/employeeAPI';

const EMPTY_EMPLOYEE = {
  full_name: '',
  picture: '',
  designation: '',
  phone_number: '',
  email: '',
  joining_date: '',
  office_id: '',
  status: 'Active',
  work: [],
  authority: [],
  assets: [],
  account_access: [],
  stationary: []
};

const dateValue = (value) => value ? String(value).slice(0, 10) : '';

const normalizeDraft = (employee = {}) => ({
  ...EMPTY_EMPLOYEE,
  ...employee,
  joining_date: dateValue(employee.joining_date),
  office_id: employee.office_id ? String(employee.office_id) : '',
  work: employee.work || [],
  authority: employee.authority || [],
  assets: (employee.assets || []).map((item) => ({
    ...item,
    assigned_date: dateValue(item.assigned_date),
    return_date: dateValue(item.return_date),
    status: item.status || 'Assigned'
  })),
  account_access: employee.account_access || [],
  stationary: (employee.stationary || []).map((item) => ({
    ...item,
    assigned_date: dateValue(item.assigned_date)
  }))
});

const Section = ({ title, description, onAdd, addLabel, children }) => (
  <section className="rounded-2xl border border-slate-700 bg-slate-900/45 p-4">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300">{description}</p>
      </div>
      <button type="button" onClick={onAdd} className="ghost-button shrink-0 px-3 py-2 text-sm">
        <Plus size={16} />
        {addLabel}
      </button>
    </div>
    {children}
  </section>
);

const EmptyState = ({ children }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-sm text-slate-200">
    {children}
  </div>
);

const EmployeeForm = ({ isOpen, onClose, employee, onSuccess }) => {
  const [draft, setDraft] = useState(EMPTY_EMPLOYEE);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(employee?.id);
  const loadingEmployee = isEditing && Number(draft.id) !== Number(employee.id);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    const load = async () => {
      try {
        const requests = [api.get('/offices')];
        if (isEditing) requests.push(employeeAPI.getById(employee.id));
        const [officesResponse, fullEmployee] = await Promise.all(requests);

        if (!active) return;
        setError('');
        setOffices(officesResponse.data.offices || officesResponse.data.data || []);
        setDraft(isEditing ? normalizeDraft(fullEmployee) : EMPTY_EMPLOYEE);
      } catch (loadError) {
        if (active) {
          setError(loadError.response?.data?.message || 'Unable to load the employee form.');
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isOpen, isEditing, employee?.id]);

  const setField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const addItem = (collection, item) => {
    setDraft((current) => ({
      ...current,
      [collection]: [...current[collection], item]
    }));
  };

  const updateItem = (collection, index, field, value) => {
    setDraft((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }));
  };

  const removeItem = (collection, index) => {
    setDraft((current) => ({
      ...current,
      [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const uploadPicture = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setField('picture', preview);
    setUploadingPicture(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('picture', file);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl.replace(/\/api\/?$/, '')}/upload/profile-picture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: uploadData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Picture upload failed');
      const backendUrl = apiUrl.replace(/\/api\/?$/, '');
      const pictureUrl = result.fileUrl?.startsWith('/')
        ? `${backendUrl}${result.fileUrl}`
        : result.fileUrl;
      setField('picture', pictureUrl);
    } catch (uploadError) {
      setField('picture', '');
      setError(uploadError.message);
    } finally {
      URL.revokeObjectURL(preview);
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...draft,
      office_id: Number(draft.office_id),
      work: draft.work.filter((item) => item.work_type?.trim()),
      authority: draft.authority.filter((item) => item.authority_level),
      assets: draft.assets.filter((item) => item.device_type?.trim()),
      account_access: draft.account_access.filter((item) => item.account_type?.trim()),
      stationary: draft.stationary.filter((item) => item.stationary_item?.trim())
    };

    try {
      if (isEditing) {
        await employeeAPI.update(employee.id, payload);
      } else {
        await employeeAPI.create(payload);
      }
      await onSuccess();
      onClose();
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save this employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) onClose();
      }}
      title={isEditing ? 'Edit employee' : 'Add employee'}
      size="large"
    >
      {loadingEmployee ? (
        <div className="py-16 text-center text-slate-200">Loading employee details...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}

          <section className="grid gap-5 rounded-2xl border border-slate-700 bg-slate-900/45 p-4 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-3">
              {draft.picture ? (
                <img src={draft.picture} alt="" className="h-24 w-24 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <UserRound size={36} />
                </div>
              )}
              <label className="ghost-button cursor-pointer px-3 py-2 text-sm">
                <Upload size={16} />
                {uploadingPicture ? 'Uploading...' : 'Photo'}
                <input type="file" accept="image/*" onChange={uploadPicture} disabled={uploadingPicture} className="hidden" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium">Full name *</span>
                <input className="field" required value={draft.full_name} onChange={(e) => setField('full_name', e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Designation</span>
                <input className="field" value={draft.designation} onChange={(e) => setField('designation', e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Office *</span>
                <select className="field appearance-none" required value={draft.office_id} onChange={(e) => setField('office_id', e.target.value)}>
                  <option value="">Select office</option>
                  {offices.map((office) => <option key={office.id} value={office.id}>{office.name}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Email</span>
                <input className="field" type="email" value={draft.email} onChange={(e) => setField('email', e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Phone number</span>
                <input className="field" value={draft.phone_number} onChange={(e) => setField('phone_number', e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Joining date</span>
                <input className="field" type="date" value={draft.joining_date} onChange={(e) => setField('joining_date', e.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Status</span>
                <select className="field appearance-none" value={draft.status} onChange={(e) => setField('status', e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>
          </section>

          <Section title="Work" description="Responsibilities or areas of work." addLabel="Add work" onAdd={() => addItem('work', { work_type: '', description: '' })}>
            {draft.work.length === 0 ? <EmptyState>No work details added.</EmptyState> : draft.work.map((item, index) => (
              <div key={item.id || index} className="mb-3 grid gap-3 rounded-xl bg-slate-50 p-3 last:mb-0 dark:bg-slate-800/60 sm:grid-cols-[1fr_2fr_auto]">
                <input className="field" placeholder="Work type" value={item.work_type || ''} onChange={(e) => updateItem('work', index, 'work_type', e.target.value)} />
                <input className="field" placeholder="Description" value={item.description || ''} onChange={(e) => updateItem('work', index, 'description', e.target.value)} />
                <button type="button" className="ghost-button h-11 w-11 p-0 text-rose-600" onClick={() => removeItem('work', index)} aria-label="Remove work"><Trash2 size={17} /></button>
              </div>
            ))}
          </Section>

          <Section title="Authority" description="Organizational authority assigned to this employee." addLabel="Add level" onAdd={() => addItem('authority', { authority_level: '' })}>
            {draft.authority.length === 0 ? <EmptyState>No authority level added.</EmptyState> : draft.authority.map((item, index) => (
              <div key={item.id || index} className="mb-3 flex gap-3 last:mb-0">
                <select className="field appearance-none" value={item.authority_level || ''} onChange={(e) => updateItem('authority', index, 'authority_level', e.target.value)}>
                  <option value="">Select authority</option>
                  {['Owner', 'Manager', 'Supervisor', 'Employee', 'Intern'].map((level) => <option key={level}>{level}</option>)}
                </select>
                <button type="button" className="ghost-button h-11 w-11 shrink-0 p-0 text-rose-600" onClick={() => removeItem('authority', index)} aria-label="Remove authority"><Trash2 size={17} /></button>
              </div>
            ))}
          </Section>

          <Section title="Devices" description="Devices directly recorded against the employee profile." addLabel="Add device" onAdd={() => addItem('assets', { device_type: '', device_name: '', assigned_date: '', return_date: '', status: 'Assigned', notes: '' })}>
            {draft.assets.length === 0 ? <EmptyState>No profile devices added.</EmptyState> : draft.assets.map((item, index) => (
              <div key={item.id || index} className="mb-3 grid gap-3 rounded-xl bg-slate-50 p-3 last:mb-0 dark:bg-slate-800/60 sm:grid-cols-2">
                <input className="field" placeholder="Device type" value={item.device_type || ''} onChange={(e) => updateItem('assets', index, 'device_type', e.target.value)} />
                <input className="field" placeholder="Device name" value={item.device_name || ''} onChange={(e) => updateItem('assets', index, 'device_name', e.target.value)} />
                <input className="field" type="date" value={item.assigned_date || ''} onChange={(e) => updateItem('assets', index, 'assigned_date', e.target.value)} />
                <input className="field" type="date" value={item.return_date || ''} onChange={(e) => updateItem('assets', index, 'return_date', e.target.value)} />
                <select className="field appearance-none" value={item.status || 'Assigned'} onChange={(e) => updateItem('assets', index, 'status', e.target.value)}>
                  <option value="Assigned">Assigned</option>
                  <option value="Returned">Returned</option>
                  <option value="Lost">Lost</option>
                </select>
                <div className="flex gap-3">
                  <input className="field" placeholder="Notes" value={item.notes || ''} onChange={(e) => updateItem('assets', index, 'notes', e.target.value)} />
                  <button type="button" className="ghost-button h-11 w-11 shrink-0 p-0 text-rose-600" onClick={() => removeItem('assets', index)} aria-label="Remove device"><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
          </Section>

          <Section title="Account access" description="Company systems and permission levels." addLabel="Add account" onAdd={() => addItem('account_access', { account_type: '', access_level: 'View', notes: '' })}>
            {draft.account_access.length === 0 ? <EmptyState>No account access added.</EmptyState> : draft.account_access.map((item, index) => (
              <div key={item.id || index} className="mb-3 grid gap-3 rounded-xl bg-slate-50 p-3 last:mb-0 dark:bg-slate-800/60 sm:grid-cols-[1fr_160px_1fr_auto]">
                <input className="field" placeholder="Account or system" value={item.account_type || ''} onChange={(e) => updateItem('account_access', index, 'account_type', e.target.value)} />
                <select className="field appearance-none" value={item.access_level || 'View'} onChange={(e) => updateItem('account_access', index, 'access_level', e.target.value)}>
                  <option value="View">View</option>
                  <option value="Edit">Edit</option>
                  <option value="Admin">Admin</option>
                </select>
                <input className="field" placeholder="Notes" value={item.notes || ''} onChange={(e) => updateItem('account_access', index, 'notes', e.target.value)} />
                <button type="button" className="ghost-button h-11 w-11 p-0 text-rose-600" onClick={() => removeItem('account_access', index)} aria-label="Remove account"><Trash2 size={17} /></button>
              </div>
            ))}
          </Section>

          <Section title="Stationery" description="Consumable items issued to the employee." addLabel="Add item" onAdd={() => addItem('stationary', { stationary_item: '', quantity: 1, assigned_date: '', notes: '' })}>
            {draft.stationary.length === 0 ? <EmptyState>No stationery added.</EmptyState> : draft.stationary.map((item, index) => (
              <div key={item.id || index} className="mb-3 grid gap-3 rounded-xl bg-slate-50 p-3 last:mb-0 dark:bg-slate-800/60 sm:grid-cols-[1fr_100px_170px_1fr_auto]">
                <input className="field" placeholder="Item" value={item.stationary_item || ''} onChange={(e) => updateItem('stationary', index, 'stationary_item', e.target.value)} />
                <input className="field" type="number" min="1" value={item.quantity || 1} onChange={(e) => updateItem('stationary', index, 'quantity', e.target.value)} />
                <input className="field" type="date" value={item.assigned_date || ''} onChange={(e) => updateItem('stationary', index, 'assigned_date', e.target.value)} />
                <input className="field" placeholder="Notes" value={item.notes || ''} onChange={(e) => updateItem('stationary', index, 'notes', e.target.value)} />
                <button type="button" className="ghost-button h-11 w-11 p-0 text-rose-600" onClick={() => removeItem('stationary', index)} aria-label="Remove stationery"><Trash2 size={17} /></button>
              </div>
            ))}
          </Section>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-700 bg-[#111d2f] pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="ghost-button">Cancel</button>
            <button type="submit" disabled={loading || uploadingPicture} className="primary-button disabled:opacity-50">
              {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create employee'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EmployeeForm;

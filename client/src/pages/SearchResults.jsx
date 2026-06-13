import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3, Building, FileText, Laptop, LayoutDashboard, Mail, Package, Search, User } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../lib/axios';

const includesQuery = (query, values) => (
  values.some((value) => String(value ?? '').toLowerCase().includes(query))
);

const websitePages = [
  { id: 'dashboard', title: 'Dashboard', description: 'Company overview and office totals', href: '/dashboard', icon: LayoutDashboard },
  { id: 'employees', title: 'Employees', description: 'Employee directory and staff records', href: '/employees', icon: User },
  { id: 'inventory', title: 'Inventory', description: 'Stock, stationery, devices, furniture, and appliances', href: '/inventory', icon: Package },
  { id: 'assets', title: 'Assets', description: 'Asset assignments and equipment status', href: '/assets', icon: Laptop },
  { id: 'analytics', title: 'Analytics', description: 'Employee and inventory charts and insights', href: '/analytics', icon: BarChart3 },
  { id: 'reports', title: 'Reports', description: 'PDF and Excel company reports', href: '/reports', icon: FileText },
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const [records, setRecords] = useState({
    employees: [],
    inventory: [],
    assets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadResults = async () => {
      setLoading(true);
      setError('');

      try {
        const [employeesRes, inventoryRes, assetsRes] = await Promise.all([
          api.get('/employees'),
          api.get('/inventory/items'),
          api.get('/assets'),
        ]);

        if (!active) return;
        setRecords({
          employees: employeesRes.data.employees || employeesRes.data.data || [],
          inventory: inventoryRes.data.items || [],
          assets: assetsRes.data.assignments || assetsRes.data.data || [],
        });
      } catch (loadError) {
        if (active) {
          setError(loadError.response?.data?.message || 'Unable to search company records.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = window.setTimeout(loadResults, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const results = useMemo(() => ({
    pages: websitePages.filter((page) => includesQuery(query, [page.title, page.description])),
    employees: records.employees.filter((employee) => includesQuery(query, [
      employee.full_name,
      employee.email,
      employee.phone_number,
      employee.designation,
      employee.office_name,
      employee.status,
    ])),
    inventory: records.inventory.filter((item) => includesQuery(query, [
      item.name,
      item.category_name,
      item.category_type,
      item.office_name,
      item.notes,
      item.quantity,
    ])),
    assets: records.assets.filter((asset) => includesQuery(query, [
      asset.asset_name,
      asset.asset_code,
      asset.office_name,
      asset.employee_name,
      asset.status,
      asset.notes,
    ])),
  }), [query, records]);

  if (loading) return <SkeletonLoader />;

  const totalResults = results.pages.length + results.employees.length + results.inventory.length + results.assets.length;

  const sections = [
    {
      key: 'pages',
      title: 'Pages',
      icon: LayoutDashboard,
      items: results.pages,
      render: (page) => ({
        id: page.id,
        title: page.title,
        subtitle: page.description,
        detail: 'Open page',
        icon: page.icon,
        href: page.href,
      }),
    },
    {
      key: 'employees',
      title: 'Employees',
      href: `/employees?q=${encodeURIComponent(query)}`,
      icon: User,
      items: results.employees,
      render: (employee) => ({
        id: employee.id,
        title: employee.full_name,
        subtitle: [employee.designation, employee.office_name].filter(Boolean).join(' - '),
        detail: employee.email,
        icon: Mail,
        href: `/employees?q=${encodeURIComponent(query)}`,
      }),
    },
    {
      key: 'inventory',
      title: 'Inventory',
      href: `/inventory?q=${encodeURIComponent(query)}`,
      icon: Package,
      items: results.inventory,
      render: (item) => ({
        id: item.id,
        title: item.name,
        subtitle: [item.category_type, item.category_name].filter(Boolean).join(' - '),
        detail: `${item.office_name || 'No office'} - Quantity: ${item.quantity ?? 0}`,
        icon: Building,
        href: `/inventory?q=${encodeURIComponent(query)}`,
      }),
    },
    {
      key: 'assets',
      title: 'Assets',
      href: `/assets?q=${encodeURIComponent(query)}`,
      icon: Laptop,
      items: results.assets,
      render: (asset) => ({
        id: asset.id,
        title: asset.asset_name,
        subtitle: [asset.asset_code, asset.status].filter(Boolean).join(' - '),
        detail: [asset.office_name, asset.employee_name].filter(Boolean).join(' - ') || 'Unassigned',
        icon: Laptop,
        href: `/assets?q=${encodeURIComponent(query)}`,
      }),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="page-heading">Search Results</h1>
        <p className="page-subtitle">
          {query ? `${totalResults} results across the company for "${query}"` : 'Enter a search term above.'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-800 bg-rose-950/70 px-4 py-3 text-rose-100">
          {error}
        </div>
      )}

      {!error && totalResults === 0 && (
        <GlassCard className="py-16 text-center" hover={false}>
          <Search className="mx-auto text-slate-500" size={48} />
          <p className="mt-4 text-slate-200">No matching employees, inventory, or assets found.</p>
        </GlassCard>
      )}

      {sections.map((section) => {
        if (section.items.length === 0) return null;
        const SectionIcon = section.icon;

        return (
          <section key={section.key} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SectionIcon className="text-teal-300" size={22} />
                <h2 className="text-xl font-semibold text-white">
                  {section.title} ({section.items.length})
                </h2>
              </div>
              {section.href && (
                <Link className="text-sm font-semibold text-teal-300 hover:text-teal-200" to={section.href}>
                  View all
                </Link>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {section.items.slice(0, 6).map((item) => {
                const result = section.render(item);
                const ResultIcon = result.icon;

                return (
                  <Link key={result.id} to={result.href}>
                    <GlassCard className="h-full" hover>
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-slate-800 p-3 text-blue-300">
                          <ResultIcon size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-white">{result.title}</h3>
                          <p className="mt-1 truncate text-sm text-slate-300">{result.subtitle || 'No additional details'}</p>
                          <p className="mt-2 truncate text-sm text-slate-400">{result.detail}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default SearchResults;

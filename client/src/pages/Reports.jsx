import { useEffect, useState } from 'react';
import {
  Building,
  FileSpreadsheet,
  FileText,
  Laptop,
  Package,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import {
  addReportTable,
  addSectionHeading,
  createEnterprisePdf,
  finalizeEnterprisePdf,
  formatReportDate,
  reportText
} from '../lib/pdfReport';

const INVENTORY_TYPES = ['Stationary', 'Devices', 'Appliances', 'Furniture', 'Cleaning'];

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [exportError, setExportError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const [employeesRes, inventoryRes, assetsRes, officesRes] = await Promise.all([
          api.get('/employees'),
          api.get('/inventory/items'),
          api.get('/assets'),
          api.get('/offices')
        ]);
        if (!active) return;
        const employeeList = employeesRes.data.employees || employeesRes.data.data || [];
        const details = await Promise.all(
          employeeList.map((employee) => (
            api.get(`/employees/${employee.id}`)
              .then((response) => response.data.data || response.data.employee || employee)
              .catch(() => employee)
          ))
        );
        if (!active) return;
        setEmployees(employeeList);
        setEmployeeDetails(details);
        setInventory(inventoryRes.data.items || []);
        setAssets(assetsRes.data.assignments || []);
        setOffices(officesRes.data.offices || officesRes.data.data || []);
      } catch (error) {
        if (active) setExportError(error.response?.data?.message || 'Unable to load report data.');
      } finally {
        if (active) setLoading(false);
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const runExport = (name, action) => {
    setExporting(name);
    setExportError('');
    try {
      action();
    } catch (error) {
      console.error(`Failed to generate ${name}:`, error);
      setExportError(`Unable to generate ${name}. Please try again.`);
    } finally {
      setExporting('');
    }
  };

  const createReport = (config) => createEnterprisePdf({
    ...config,
    preparedBy: user?.full_name
  });

  const employeeRows = employees.map((employee, index) => [
    index + 1,
    reportText(employee.full_name),
    reportText(employee.designation),
    reportText(employee.email),
    reportText(employee.phone_number),
    reportText(employee.office_name),
    reportText(employee.status),
    formatReportDate(employee.joining_date)
  ]);

  const inventoryRows = (items) => items.map((item, index) => [
    index + 1,
    reportText(item.name),
    reportText(item.category_name),
    reportText(item.category_type),
    reportText(item.office_name),
    Number(item.quantity || 0).toLocaleString('en-GB'),
    reportText(item.notes, '-')
  ]);

  const generateEmployeePDF = () => {
    const { doc, startY, title } = createReport({
      title: 'Employee Report',
      subtitle: 'Employee directory, office placement and employment status',
      reportCode: 'HR-EMP-001',
      recordCount: employees.length
    });
    addReportTable(doc, {
      title: 'Employee Register',
      startY,
      continuedTitle: title,
      head: [['#', 'Employee Name', 'Designation', 'Email', 'Phone', 'Office', 'Status', 'Joining Date']],
      body: employeeRows,
      columnStyles: {
        0: { cellWidth: 9, halign: 'center' },
        1: { cellWidth: 31 },
        2: { cellWidth: 26 },
        3: { cellWidth: 42 },
        4: { cellWidth: 27 },
        5: { cellWidth: 34 },
        6: { cellWidth: 18 },
        7: { cellWidth: 24 }
      }
    });
    finalizeEnterprisePdf(doc, 'employee-report.pdf');
  };

  const generateInventoryPDF = () => {
    const totalQuantity = inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const { doc, startY, title } = createReport({
      title: 'Inventory Report',
      subtitle: `Inventory register across all offices - Total quantity: ${totalQuantity.toLocaleString('en-GB')}`,
      reportCode: 'INV-ALL-001',
      recordCount: inventory.length
    });
    addReportTable(doc, {
      title: 'Complete Inventory Register',
      startY,
      continuedTitle: title,
      head: [['#', 'Item Name', 'Category', 'Type', 'Office', 'Quantity', 'Notes']],
      body: inventoryRows(inventory),
      columnStyles: {
        0: { cellWidth: 9, halign: 'center' },
        1: { cellWidth: 42 },
        2: { cellWidth: 38 },
        3: { cellWidth: 28 },
        4: { cellWidth: 42 },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 72 }
      }
    });
    finalizeEnterprisePdf(doc, 'inventory-report.pdf');
  };

  const generateAssetsPDF = () => {
    const { doc, startY, title } = createReport({
      title: 'Asset Assignments Report',
      subtitle: 'Asset ownership, allocation and lifecycle status',
      reportCode: 'AST-ASSIGN-001',
      recordCount: assets.length
    });
    const rows = assets.map((asset, index) => [
      index + 1,
      reportText(asset.asset_code),
      reportText(asset.asset_name),
      reportText(asset.office_name),
      reportText(asset.employee_name, 'Unassigned'),
      reportText(asset.status),
      formatReportDate(asset.assignment_date, '-'),
      formatReportDate(asset.return_date, '-'),
      reportText(asset.notes, '-')
    ]);
    addReportTable(doc, {
      title: 'Asset Allocation Register',
      startY,
      continuedTitle: title,
      head: [['#', 'Asset Code', 'Asset Name', 'Office', 'Assigned To', 'Status', 'Assigned', 'Return', 'Notes']],
      body: rows,
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 34 },
        3: { cellWidth: 32 },
        4: { cellWidth: 34 },
        5: { cellWidth: 21 },
        6: { cellWidth: 23 },
        7: { cellWidth: 23 },
        8: { cellWidth: 55 }
      }
    });
    finalizeEnterprisePdf(doc, 'asset-assignments-report.pdf');
  };

  const generateInventoryTypePDF = (type, reportTitle, reportCode, fileName) => {
    const items = inventory.filter((item) => item.category_type === type);
    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const { doc, startY, title } = createReport({
      title: reportTitle,
      subtitle: `${type} inventory by office - Total quantity: ${totalQuantity.toLocaleString('en-GB')}`,
      reportCode,
      recordCount: items.length
    });
    addReportTable(doc, {
      title: `${type} Register`,
      startY,
      continuedTitle: title,
      head: [['#', 'Item Name', 'Category', 'Office', 'Quantity', 'Notes']],
      body: items.map((item, index) => [
        index + 1,
        reportText(item.name),
        reportText(item.category_name),
        reportText(item.office_name),
        Number(item.quantity || 0).toLocaleString('en-GB'),
        reportText(item.notes, '-')
      ]),
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 48 },
        2: { cellWidth: 45 },
        3: { cellWidth: 48 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 90 }
      }
    });
    finalizeEnterprisePdf(doc, fileName);
  };

  const generateStationaryPDF = () => generateInventoryTypePDF(
    'Stationary', 'Stationary Report', 'INV-STA-001', 'stationary-report.pdf'
  );

  const generateDevicesPDF = () => generateInventoryTypePDF(
    'Devices', 'Devices Report', 'INV-DEV-001', 'devices-report.pdf'
  );

  const generateAppliancesPDF = () => generateInventoryTypePDF(
    'Appliances', 'Appliances Report', 'INV-APP-001', 'appliances-report.pdf'
  );

  const generateFurniturePDF = () => generateInventoryTypePDF(
    'Furniture', 'Furniture & Essentials Report', 'INV-FUR-001', 'furniture-report.pdf'
  );

  const generateCleaningPDF = () => generateInventoryTypePDF(
    'Cleaning', 'Cleaning Essentials Report', 'INV-CLN-001', 'cleaning-report.pdf'
  );

  const generateComprehensivePDF = () => {
    const totalRecords = employees.length + inventory.length + assets.length;
    const { doc, startY, title } = createReport({
      title: 'Comprehensive Company Report',
      subtitle: 'Consolidated workforce, inventory and asset management overview',
      reportCode: 'EXEC-COMP-001',
      recordCount: totalRecords
    });

    let y = addSectionHeading(doc, 'Workforce Overview', startY);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Employee', 'Designation', 'Office', 'Status', 'Joining Date']],
      body: employees.map((employee) => [
        reportText(employee.full_name),
        reportText(employee.designation),
        reportText(employee.office_name),
        reportText(employee.status),
        formatReportDate(employee.joining_date)
      ])
    }) + 10;

    y = addSectionHeading(doc, 'Inventory Summary by Type', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Inventory Type', 'Distinct Items', 'Total Quantity']],
      body: INVENTORY_TYPES.map((type) => {
        const items = inventory.filter((item) => item.category_type === type);
        return [
          type,
          items.length,
          items.reduce((sum, item) => sum + Number(item.quantity || 0), 0).toLocaleString('en-GB')
        ];
      }),
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 55, halign: 'right' },
        2: { cellWidth: 65, halign: 'right' }
      }
    }) + 10;

    y = addSectionHeading(doc, 'Asset Assignment Summary', y);
    addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Asset Status', 'Count']],
      body: ['Assigned', 'Available', 'Under Repair', 'Lost'].map((status) => [
        status,
        assets.filter((asset) => asset.status === status).length
      ]),
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: 'right' }
      }
    });

    finalizeEnterprisePdf(doc, 'comprehensive-company-report.pdf');
  };

  const getOfficeData = (office) => {
    const officeId = Number(office.id);
    const officeEmployees = employeeDetails.filter((employee) => Number(employee.office_id) === officeId);
    const officeInventory = inventory.filter((item) => Number(item.office_id) === officeId);
    const officeAssets = assets.filter((asset) => Number(asset.office_id) === officeId);

    return {
      employees: officeEmployees,
      inventory: officeInventory,
      assets: officeAssets,
      work: officeEmployees.flatMap((employee) => (
        (employee.work || []).map((item) => ({ ...item, employee_name: employee.full_name }))
      )),
      authority: officeEmployees.flatMap((employee) => (
        (employee.authority || []).map((item) => ({ ...item, employee_name: employee.full_name }))
      )),
      employeeDevices: officeEmployees.flatMap((employee) => (
        (employee.assets || []).map((item) => ({ ...item, employee_name: employee.full_name }))
      )),
      accounts: officeEmployees.flatMap((employee) => (
        (employee.account_access || []).map((item) => ({ ...item, employee_name: employee.full_name }))
      )),
      employeeStationary: officeEmployees.flatMap((employee) => (
        (employee.stationary || []).map((item) => ({ ...item, employee_name: employee.full_name }))
      ))
    };
  };

  const officeFileName = (office, extension) => (
    `${office.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-complete-report.${extension}`
  );

  const generateOfficePDF = (office) => {
    const data = getOfficeData(office);
    const totalRecords = data.employees.length + data.inventory.length + data.assets.length
      + data.work.length + data.authority.length + data.employeeDevices.length
      + data.accounts.length + data.employeeStationary.length;
    const { doc, startY, title } = createReport({
      title: `${office.name} Complete Report`,
      subtitle: `${reportText(office.location, 'Office-wide')} workforce, inventory, access and asset register`,
      reportCode: `OFF-${String(office.id).padStart(3, '0')}`,
      recordCount: totalRecords
    });

    let y = addSectionHeading(doc, 'Office Overview', startY);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Office', 'Location', 'Employees', 'Inventory Items', 'Inventory Quantity', 'Asset Assignments']],
      body: [[
        office.name,
        reportText(office.location),
        data.employees.length,
        data.inventory.length,
        data.inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        data.assets.length
      ]]
    }) + 10;

    y = addSectionHeading(doc, 'Employees', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Employee', 'Designation', 'Email', 'Phone', 'Status', 'Joining Date']],
      body: data.employees.map((employee) => [
        reportText(employee.full_name),
        reportText(employee.designation),
        reportText(employee.email),
        reportText(employee.phone_number),
        reportText(employee.status),
        formatReportDate(employee.joining_date)
      ])
    }) + 10;

    y = addSectionHeading(doc, 'Employee Work & Responsibilities', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Employee', 'Work Type', 'Description']],
      body: data.work.map((item) => [
        reportText(item.employee_name),
        reportText(item.work_type),
        reportText(item.description, '-')
      ])
    }) + 10;

    y = addSectionHeading(doc, 'Authority Assignments', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Employee', 'Authority Level']],
      body: data.authority.map((item) => [
        reportText(item.employee_name),
        reportText(item.authority_level)
      ])
    }) + 10;

    y = addSectionHeading(doc, 'Employee Device Access', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Employee', 'Device Type', 'Device Name', 'Status', 'Assigned Date', 'Return Date', 'Notes']],
      body: data.employeeDevices.map((item) => [
        reportText(item.employee_name),
        reportText(item.device_type),
        reportText(item.device_name),
        reportText(item.status),
        formatReportDate(item.assigned_date, '-'),
        formatReportDate(item.return_date, '-'),
        reportText(item.notes, '-')
      ])
    }) + 10;

    y = addSectionHeading(doc, 'Company Account Access', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Employee', 'Account / System', 'Access Level', 'Notes']],
      body: data.accounts.map((item) => [
        reportText(item.employee_name),
        reportText(item.account_type),
        reportText(item.access_level),
        reportText(item.notes, '-')
      ])
    }) + 10;

    y = addSectionHeading(doc, 'Stationery Issued to Employees', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Employee', 'Stationery Item', 'Quantity', 'Assigned Date', 'Notes']],
      body: data.employeeStationary.map((item) => [
        reportText(item.employee_name),
        reportText(item.stationary_item),
        Number(item.quantity || 0),
        formatReportDate(item.assigned_date, '-'),
        reportText(item.notes, '-')
      ])
    }) + 10;

    y = addSectionHeading(doc, 'Office Inventory Summary', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Inventory Type', 'Distinct Items', 'Total Quantity']],
      body: INVENTORY_TYPES.map((type) => {
        const items = data.inventory.filter((item) => item.category_type === type);
        return [
          type,
          items.length,
          items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        ];
      })
    }) + 10;

    y = addSectionHeading(doc, 'Complete Office Inventory', y);
    y = addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Item Name', 'Category', 'Type', 'Quantity', 'Notes']],
      body: data.inventory.map((item) => [
        reportText(item.name),
        reportText(item.category_name),
        reportText(item.category_type),
        Number(item.quantity || 0),
        reportText(item.notes, '-')
      ])
    }) + 10;

    y = addSectionHeading(doc, 'Office Asset Assignments', y);
    addReportTable(doc, {
      startY: y,
      continuedTitle: title,
      head: [['Asset Code', 'Asset Name', 'Assigned To', 'Status', 'Assignment Date', 'Return Date', 'Notes']],
      body: data.assets.map((asset) => [
        reportText(asset.asset_code),
        reportText(asset.asset_name),
        reportText(asset.employee_name, 'Unassigned'),
        reportText(asset.status),
        formatReportDate(asset.assignment_date, '-'),
        formatReportDate(asset.return_date, '-'),
        reportText(asset.notes, '-')
      ])
    });

    finalizeEnterprisePdf(doc, officeFileName(office, 'pdf'));
  };

  const exportWorkbook = (fileName, sheetName, rows) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);
  };

  const generateEmployeeExcel = () => exportWorkbook('employee-report.xlsx', 'Employees', employees);
  const generateInventoryExcel = () => exportWorkbook('inventory-report.xlsx', 'Inventory', inventory);
  const generateAssetsExcel = () => exportWorkbook('asset-report.xlsx', 'Assets', assets);

  const generateOfficeExcel = (office) => {
    const data = getOfficeData(office);
    const workbook = XLSX.utils.book_new();
    const appendSheet = (name, rows) => {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, name.slice(0, 31));
    };

    appendSheet('Office Summary', [{
      Office: office.name,
      Location: office.location || '',
      Employees: data.employees.length,
      'Inventory Items': data.inventory.length,
      'Inventory Quantity': data.inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      'Asset Assignments': data.assets.length
    }]);
    appendSheet('Employees', data.employees);
    appendSheet('Employee Work', data.work);
    appendSheet('Authority', data.authority);
    appendSheet('Employee Devices', data.employeeDevices);
    appendSheet('Account Access', data.accounts);
    appendSheet('Employee Stationery', data.employeeStationary);
    appendSheet('Office Inventory', data.inventory);
    appendSheet('Asset Assignments', data.assets);

    XLSX.writeFile(workbook, officeFileName(office, 'xlsx'));
  };

  if (loading) return <SkeletonLoader />;

  const reportTypes = [
    {
      title: 'Employee Report',
      description: 'Complete employee directory with office and employment details',
      icon: Users,
      count: employees.length,
      pdfAction: generateEmployeePDF,
      excelAction: generateEmployeeExcel
    },
    {
      title: 'Inventory Report',
      description: 'All inventory items across all categories and offices',
      icon: Package,
      count: inventory.length,
      pdfAction: generateInventoryPDF,
      excelAction: generateInventoryExcel
    },
    {
      title: 'Asset Assignments Report',
      description: 'Asset allocation, ownership and lifecycle tracking',
      icon: Laptop,
      count: assets.length,
      pdfAction: generateAssetsPDF,
      excelAction: generateAssetsExcel
    },
    {
      title: 'Stationary Report',
      description: 'Stationary items and quantities across all offices',
      icon: Package,
      count: inventory.filter((item) => item.category_type === 'Stationary').length,
      pdfAction: generateStationaryPDF,
      excelAction: generateInventoryExcel
    },
    {
      title: 'Devices Report',
      description: 'Devices and equipment across all offices',
      icon: Laptop,
      count: inventory.filter((item) => item.category_type === 'Devices').length,
      pdfAction: generateDevicesPDF,
      excelAction: generateInventoryExcel
    },
    {
      title: 'Appliances Report',
      description: 'Office appliances across all locations',
      icon: Package,
      count: inventory.filter((item) => item.category_type === 'Appliances').length,
      pdfAction: generateAppliancesPDF,
      excelAction: generateInventoryExcel
    },
    {
      title: 'Furniture Report',
      description: 'Furniture and essential inventory by office',
      icon: Building,
      count: inventory.filter((item) => item.category_type === 'Furniture').length,
      pdfAction: generateFurniturePDF,
      excelAction: generateInventoryExcel
    },
    {
      title: 'Cleaning Report',
      description: 'Cleaning essentials and quantities by office',
      icon: Package,
      count: inventory.filter((item) => item.category_type === 'Cleaning').length,
      pdfAction: generateCleaningPDF,
      excelAction: generateInventoryExcel
    },
    {
      title: 'Comprehensive Report',
      description: 'Consolidated workforce, inventory and asset overview',
      icon: FileText,
      count: employees.length + inventory.length + assets.length,
      pdfAction: generateComprehensivePDF,
      excelAction: generateInventoryExcel
    }
  ];

  const officeReports = offices.map((office) => {
    const data = getOfficeData(office);
    return {
      office,
      count: data.employees.length + data.inventory.length + data.assets.length
    };
  });

  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <h1 className="page-heading">Reports</h1>
        <p className="page-subtitle">Generate enterprise PDF and Excel reports for each business area</p>
      </div>

      {exportError && (
        <div className="rounded-xl border border-rose-800 bg-rose-950/70 px-4 py-3 text-sm text-rose-100">
          {exportError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <GlassCard key={report.title} hover={false}>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-3">
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{report.title}</h3>
                  <p className="text-sm text-slate-300">{report.count} records</p>
                </div>
              </div>

              <p className="mb-6 text-sm text-slate-300">{report.description}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => runExport(`${report.title} PDF`, report.pdfAction)}
                  disabled={Boolean(exporting)}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-wait disabled:opacity-60"
                >
                  <FileText size={18} />
                  {exporting === `${report.title} PDF` ? 'Generating...' : 'PDF'}
                </button>
                <button
                  onClick={() => runExport(`${report.title} Excel`, report.excelAction)}
                  disabled={Boolean(exporting)}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
                >
                  <FileSpreadsheet size={18} />
                  {exporting === `${report.title} Excel` ? 'Generating...' : 'Excel'}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="space-y-2 pt-4">
        <h2 className="text-2xl font-bold text-white">Office-Wise Complete Reports</h2>
        <p className="text-sm text-slate-300">
          Complete registered data for each office, including employees, access records, stationery, inventory and assets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {officeReports.map(({ office, count }) => (
          <GlassCard key={office.id} hover={false}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 p-3">
                <Building size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{office.name} Report</h3>
                <p className="text-sm text-slate-300">{count} primary records</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-slate-300">
              {reportText(office.location)}. Includes every employee-linked record, office inventory category and asset assignment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => runExport(`${office.name} PDF`, () => generateOfficePDF(office))}
                disabled={Boolean(exporting)}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-wait disabled:opacity-60"
              >
                <FileText size={18} />
                {exporting === `${office.name} PDF` ? 'Generating...' : 'PDF'}
              </button>
              <button
                onClick={() => runExport(`${office.name} Excel`, () => generateOfficeExcel(office))}
                disabled={Boolean(exporting)}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
              >
                <FileSpreadsheet size={18} />
                {exporting === `${office.name} Excel` ? 'Generating...' : 'Excel'}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-8" hover={false}>
        <h2 className="mb-6 text-xl font-semibold text-white">Report Summary</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ['Total Employees', employees.length],
            ['Total Inventory Items', inventory.length],
            ['Total Asset Assignments', assets.length]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-700 bg-slate-950/55 p-4">
              <p className="text-sm text-slate-300">{label}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Reports;

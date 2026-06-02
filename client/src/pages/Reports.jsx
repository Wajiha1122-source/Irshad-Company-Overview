import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import { 
  FileText, 
  FileSpreadsheet,
  Package,
  Laptop,
  Users,
  Building
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, inventoryRes, assetsRes, categoriesRes] = await Promise.all([
        api.get('/employees'),
        api.get('/inventory/items'),
        api.get('/assets'),
        api.get('/inventory/categories')
      ]);
      setEmployees(employeesRes.data.employees);
      setInventory(inventoryRes.data.items);
      setAssets(assetsRes.data.assignments);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmployeePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Employee Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = employees.map(emp => [
      emp.full_name,
      emp.designation || 'N/A',
      emp.email || 'N/A',
      emp.phone_number || 'N/A',
      emp.office_name || 'N/A',
      emp.status,
      emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'N/A'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Designation', 'Email', 'Phone', 'Office', 'Status', 'Joining Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('employee-report.pdf');
  };

  const generateInventoryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Inventory Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = inventory.map(item => [
      item.name,
      item.category_name || 'N/A',
      item.category_type || 'N/A',
      item.office_name || 'N/A',
      item.quantity.toString(),
      item.notes || '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item Name', 'Category', 'Type', 'Office', 'Quantity', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('inventory-report.pdf');
  };

  const generateAssetsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Asset Assignments Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = assets.map(asset => [
      asset.asset_code,
      asset.asset_name,
      asset.office_name || 'N/A',
      asset.employee_name || 'Unassigned',
      asset.status,
      asset.assignment_date ? new Date(asset.assignment_date).toLocaleDateString() : '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Asset Code', 'Asset Name', 'Office', 'Assigned To', 'Status', 'Assignment Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('asset-report.pdf');
  };

  const generateEmployeeExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'employee-report.xlsx');
  };

  const generateInventoryExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(inventory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, 'inventory-report.xlsx');
  };

  const generateAssetsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(assets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
    XLSX.writeFile(workbook, 'asset-report.xlsx');
  };

  const generateStationaryPDF = () => {
    const stationaryItems = inventory.filter(item => item.category_type === 'Stationary');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Stationary Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = stationaryItems.map(item => [
      item.name,
      item.category_name || 'N/A',
      item.office_name || 'N/A',
      item.quantity.toString(),
      item.notes || '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item Name', 'Category', 'Office', 'Quantity', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('stationary-report.pdf');
  };

  const generateDevicesPDF = () => {
    const deviceItems = inventory.filter(item => item.category_type === 'Devices');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Devices Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = deviceItems.map(item => [
      item.name,
      item.category_name || 'N/A',
      item.office_name || 'N/A',
      item.quantity.toString(),
      item.notes || '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item Name', 'Category', 'Office', 'Quantity', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('devices-report.pdf');
  };

  const generateAppliancesPDF = () => {
    const applianceItems = inventory.filter(item => item.category_type === 'Appliances');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Appliances Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = applianceItems.map(item => [
      item.name,
      item.category_name || 'N/A',
      item.office_name || 'N/A',
      item.quantity.toString(),
      item.notes || '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item Name', 'Category', 'Office', 'Quantity', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('appliances-report.pdf');
  };

  const generateFurniturePDF = () => {
    const furnitureItems = inventory.filter(item => item.category_type === 'Furniture');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Furniture & Essentials Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = furnitureItems.map(item => [
      item.name,
      item.category_name || 'N/A',
      item.office_name || 'N/A',
      item.quantity.toString(),
      item.notes || '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item Name', 'Category', 'Office', 'Quantity', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('furniture-report.pdf');
  };

  const generateCleaningPDF = () => {
    const cleaningItems = inventory.filter(item => item.category_type === 'Cleaning');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Cleaning Essentials Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = cleaningItems.map(item => [
      item.name,
      item.category_name || 'N/A',
      item.office_name || 'N/A',
      item.quantity.toString(),
      item.notes || '-'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item Name', 'Category', 'Office', 'Quantity', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('cleaning-report.pdf');
  };

  const generateComprehensivePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Comprehensive Company Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    let startY = 35;

    // Employees Section
    doc.setFontSize(14);
    doc.text('Employees', 14, startY);
    startY += 5;

    const employeeData = employees.map(emp => [
      emp.full_name,
      emp.designation || 'N/A',
      emp.office_name || 'N/A',
      emp.status
    ]);

    autoTable(doc, {
      startY: startY,
      head: [['Name', 'Designation', 'Office', 'Status']],
      body: employeeData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    startY = doc.lastAutoTable.finalY + 10;

    // Inventory Summary by Type
    doc.setFontSize(14);
    doc.text('Inventory Summary by Type', 14, startY);
    startY += 5;

    const types = ['Stationary', 'Devices', 'Appliances', 'Furniture', 'Cleaning'];
    const inventorySummary = types.map(type => {
      const typeItems = inventory.filter(item => item.category_type === type);
      const totalQty = typeItems.reduce((sum, item) => sum + item.quantity, 0);
      return [type, typeItems.length.toString(), totalQty.toString()];
    });

    autoTable(doc, {
      startY: startY,
      head: [['Type', 'Items Count', 'Total Quantity']],
      body: inventorySummary,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    startY = doc.lastAutoTable.finalY + 10;

    // Assets Summary
    doc.setFontSize(14);
    doc.text('Asset Assignments Summary', 14, startY);
    startY += 5;

    const assetSummary = [
      ['Total Assets', assets.length.toString()],
      ['Assigned', assets.filter(a => a.status === 'Assigned').length.toString()],
      ['Available', assets.filter(a => a.status === 'Available').length.toString()],
      ['Under Repair', assets.filter(a => a.status === 'Under Repair').length.toString()]
    ];

    autoTable(doc, {
      startY: startY,
      head: [['Status', 'Count']],
      body: assetSummary,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save('comprehensive-report.pdf');
  };

 if (loading) {
  return <SkeletonLoader />;
}

  const reportTypes = [
    {
      title: 'Employee Report',
      description: 'Complete list of all employees with their details',
      icon: Users,
      count: employees.length,
      pdfAction: generateEmployeePDF,
      excelAction: generateEmployeeExcel,
    },
    {
      title: 'Inventory Report',
      description: 'All inventory items across all categories and offices',
      icon: Package,
      count: inventory.length,
      pdfAction: generateInventoryPDF,
      excelAction: generateInventoryExcel,
    },
    {
      title: 'Asset Assignments Report',
      description: 'Track all asset assignments and their status',
      icon: Laptop,
      count: assets.length,
      pdfAction: generateAssetsPDF,
      excelAction: generateAssetsExcel,
    },
    {
      title: 'Stationary Report',
      description: 'Stationary items across all offices',
      icon: Package,
      count: inventory.filter(i => i.category_type === 'Stationary').length,
      pdfAction: generateStationaryPDF,
      excelAction: generateInventoryExcel,
    },
    {
      title: 'Devices Report',
      description: 'Devices and equipment across all offices',
      icon: Laptop,
      count: inventory.filter(i => i.category_type === 'Devices').length,
      pdfAction: generateDevicesPDF,
      excelAction: generateInventoryExcel,
    },
    {
      title: 'Appliances Report',
      description: 'Office appliances across all locations',
      icon: Package,
      count: inventory.filter(i => i.category_type === 'Appliances').length,
      pdfAction: generateAppliancesPDF,
      excelAction: generateInventoryExcel,
    },
    {
      title: 'Furniture Report',
      description: 'Furniture and essentials inventory',
      icon: Building,
      count: inventory.filter(i => i.category_type === 'Furniture').length,
      pdfAction: generateFurniturePDF,
      excelAction: generateInventoryExcel,
    },
    {
      title: 'Cleaning Report',
      description: 'Cleaning essentials inventory',
      icon: Package,
      count: inventory.filter(i => i.category_type === 'Cleaning').length,
      pdfAction: generateCleaningPDF,
      excelAction: generateInventoryExcel,
    },
    {
      title: 'Comprehensive Report',
      description: 'Complete overview of all company resources',
      icon: FileText,
      count: '-',
      pdfAction: generateComprehensivePDF,
      excelAction: generateInventoryExcel,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <h1 className="page-heading">Reports</h1>
        <p className="page-subtitle">
          Generate and download reports in PDF or Excel format
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <GlassCard key={index}>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 p-3 shadow-lg shadow-blue-600/20">
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{report.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {report.count} records
                  </p>
                </div>
              </div>

              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {report.description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={report.pdfAction}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-white shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 hover:bg-rose-600"
                >
                  <FileSpreadsheet size={18} />
                  PDF
                </button>
                <button
                  onClick={report.excelAction}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  <FileSpreadsheet size={18} />
                  Excel
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Summary Stats */}
      <GlassCard className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Report Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950/35' : 'border-white bg-white/64'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Employees</p>
            <p className="text-3xl font-bold">{employees.length}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950/35' : 'border-white bg-white/64'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Inventory Items</p>
            <p className="text-3xl font-bold">{inventory.length}</p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950/35' : 'border-white bg-white/64'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Asset Assignments</p>
            <p className="text-3xl font-bold">{assets.length}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Reports;

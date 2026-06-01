import { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/axios';
import { 
  FileText, 
  FileSpreadsheet,
  Package,
  Laptop
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, inventoryRes, assetsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/inventory/items'),
        api.get('/assets')
      ]);
      setEmployees(employeesRes.data.employees);
      setInventory(inventoryRes.data.items);
      setAssets(assetsRes.data.assignments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmployeePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Employee Report', 20, 20);
    doc.setFontSize(12);
    
    let y = 40;
    employees.forEach((emp, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${emp.full_name} - ${emp.designation}`, 20, y);
      y += 10;
      doc.text(`   Office: ${emp.office_name} | Status: ${emp.status}`, 25, y);
      y += 15;
    });
    
    doc.save('employee-report.pdf');
  };

  const generateInventoryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Inventory Report', 20, 20);
    doc.setFontSize(12);
    
    let y = 40;
    inventory.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${item.name}`, 20, y);
      y += 10;
      doc.text(`   Category: ${item.category_name} | Office: ${item.office_name} | Qty: ${item.quantity}`, 25, y);
      y += 15;
    });
    
    doc.save('inventory-report.pdf');
  };

  const generateAssetsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Asset Assignments Report', 20, 20);
    doc.setFontSize(12);
    
    let y = 40;
    assets.forEach((asset, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${asset.asset_name} (${asset.asset_code})`, 20, y);
      y += 10;
      doc.text(`   Office: ${asset.office_name} | Status: ${asset.status}`, 25, y);
      y += 10;
      if (asset.employee_name) {
        doc.text(`   Assigned to: ${asset.employee_name}`, 25, y);
        y += 10;
      }
      y += 5;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const reportTypes = [
    {
      title: 'Employee Report',
      description: 'Complete list of all employees with their details',
      icon: FileText,
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

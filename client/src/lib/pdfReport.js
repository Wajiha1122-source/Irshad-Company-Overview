import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

applyPlugin(jsPDF);

const COLORS = {
  navy: [15, 23, 42],
  blue: [37, 99, 235],
  teal: [13, 148, 136],
  slate: [71, 85, 105],
  light: [241, 245, 249],
  border: [203, 213, 225],
  white: [255, 255, 255],
  dark: [30, 41, 59]
};

export const formatReportDate = (value, fallback = 'N/A') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const safeText = (value, fallback = 'N/A') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const drawContinuationHeader = (doc, title) => {
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, width, 17, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('IRSHAD & COMPANY', 14, 7);
  doc.setFont('helvetica', 'normal');
  doc.text(title.toUpperCase(), 14, 12);
};

export const createEnterprisePdf = ({
  title,
  subtitle,
  reportCode,
  recordCount,
  preparedBy,
  orientation = 'landscape'
}) => {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const generatedAt = new Date();

  doc.setProperties({
    title,
    subject: subtitle,
    author: 'Irshad & Company',
    creator: 'Irshad & Company Management System',
    keywords: `Irshad & Company, ${title}, enterprise report`
  });

  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, width, 38, 'F');
  doc.setFillColor(...COLORS.blue);
  doc.rect(0, 38, width, 2, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('IRSHAD & COMPANY', 14, 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('COMPANY OVERVIEW & RESOURCE MANAGEMENT', 14, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, width - 14, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(safeText(subtitle, 'Enterprise Management Report'), width - 14, 19, { align: 'right' });

  doc.setFontSize(7.5);
  doc.text(`Report ID: ${reportCode}`, 14, 30);
  doc.text(`Generated: ${generatedAt.toLocaleString('en-GB')}`, width / 2, 30, { align: 'center' });
  doc.text(`Prepared by: ${safeText(preparedBy, 'System User')}`, width - 14, 30, { align: 'right' });

  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('REPORT OVERVIEW', 14, 49);

  const cards = [
    ['Total Records', safeText(recordCount, '0')],
    ['Reporting Scope', 'All Offices'],
    ['Data Status', 'Current Snapshot']
  ];
  const gap = 5;
  const cardWidth = (width - 28 - gap * 2) / 3;
  cards.forEach(([label, value], index) => {
    const x = 14 + index * (cardWidth + gap);
    doc.setFillColor(...COLORS.light);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, 53, cardWidth, 18, 2, 2, 'FD');
    doc.setTextColor(...COLORS.slate);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(label, x + 4, 59);
    doc.setTextColor(...COLORS.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(value, x + 4, 66);
  });

  return { doc, startY: 79, title };
};

export const addReportTable = (doc, {
  title,
  head,
  body,
  startY,
  columnStyles = {},
  continuedTitle
}) => {
  let tableStart = startY;
  if (title) {
    doc.setTextColor(...COLORS.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, 14, tableStart);
    tableStart += 4;
  }

  const rows = body.length ? body : [
    [{ content: 'No records available for this report.', colSpan: head[0].length, styles: { halign: 'center', textColor: COLORS.slate } }]
  ];

  doc.autoTable({
    startY: tableStart,
    head,
    body: rows,
    theme: 'grid',
    margin: { top: 23, right: 14, bottom: 18, left: 14 },
    showHead: 'everyPage',
    headStyles: {
      fillColor: COLORS.blue,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      valign: 'middle',
      cellPadding: 2.5
    },
    bodyStyles: {
      textColor: COLORS.dark,
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: COLORS.border,
      lineWidth: 0.15,
      valign: 'middle',
      overflow: 'linebreak'
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles,
    didDrawPage: (data) => {
      if (data.pageNumber > 1) drawContinuationHeader(doc, continuedTitle || title);
    }
  });

  return doc.lastAutoTable?.finalY || tableStart;
};

export const addSectionHeading = (doc, title, requestedY) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = requestedY;
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 27;
  }
  doc.setFillColor(...COLORS.light);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(14, y - 5, doc.internal.pageSize.getWidth() - 28, 10, 1.5, 1.5, 'FD');
  doc.setTextColor(...COLORS.navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(title.toUpperCase(), 18, y + 1);
  return y + 9;
};

export const finalizeEnterprisePdf = (doc, fileName) => {
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...COLORS.border);
    doc.line(14, height - 12, width - 14, height - 12);
    doc.setTextColor(...COLORS.slate);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Confidential - Internal Business Use', 14, height - 7);
    doc.text(`Page ${page} of ${totalPages}`, width / 2, height - 7, { align: 'center' });
    doc.text('Irshad & Company Management System', width - 14, height - 7, { align: 'right' });
  }

  doc.save(fileName);
};

export const reportText = safeText;

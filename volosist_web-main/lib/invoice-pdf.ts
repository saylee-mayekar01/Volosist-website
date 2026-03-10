import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoicePdfItem {
  name: string;
  plan: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePdfPayload {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: string;
  items: InvoicePdfItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidDate?: string;
  customerInfo: {
    name: string;
    email: string;
    company: string;
    address: string;
    gst?: string;
  };
}

export interface InvoicePdfOptions {
  logoPath?: string;
  companyName?: string;
  supportPhone?: string;
  supportEmail?: string;
  supportLabel?: string;
  inquiryLabel?: string;
  fileSuffix?: string;
}

const DEFAULT_OPTIONS: Required<InvoicePdfOptions> = {
  logoPath: '/volosist-logo.svg',
  companyName: 'Volosist',
  supportPhone: '+91 9769789769',
  supportEmail: 'volosist.ai@gmail.com',
  supportLabel: 'Global Support',
  inquiryLabel: 'Email Inquiry',
  fileSuffix: 'invoice',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const formatInr = (value: number) =>
  `INR ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getStatusStyle = (status: string) => {
  const normalized = String(status || '').trim().toLowerCase();

  if (['paid', 'completed', 'success'].includes(normalized)) {
    return {
      label: 'PAID',
      fill: [220, 252, 231] as [number, number, number],
      text: [22, 101, 52] as [number, number, number],
      border: [134, 239, 172] as [number, number, number],
    };
  }

  if (normalized === 'pending') {
    return {
      label: 'PENDING',
      fill: [254, 243, 199] as [number, number, number],
      text: [146, 64, 14] as [number, number, number],
      border: [252, 211, 77] as [number, number, number],
    };
  }

  return {
    label: normalized ? normalized.toUpperCase() : 'DUE',
    fill: [254, 226, 226] as [number, number, number],
    text: [153, 27, 27] as [number, number, number],
    border: [252, 165, 165] as [number, number, number],
  };
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to load image'));
    img.src = src;
  });

const getContainedSize = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) => {
  const safeWidth = width > 0 ? width : maxWidth;
  const safeHeight = height > 0 ? height : maxHeight;
  const ratio = Math.min(maxWidth / safeWidth, maxHeight / safeHeight);

  return {
    width: safeWidth * ratio,
    height: safeHeight * ratio,
  };
};

const getDataUrlDimensions = async (dataUrl: string): Promise<{ width: number; height: number } | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const image = await loadImage(dataUrl);
    return {
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    };
  } catch {
    return null;
  }
};

const toDataUrl = async (path: string): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const absolutePath = path.startsWith('http') ? path : `${window.location.origin}${path}`;
    const response = await fetch(absolutePath);
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    const normalizedPath = absolutePath.toLowerCase();
    const isSvg =
      contentType.includes('image/svg+xml') ||
      normalizedPath.endsWith('.svg') ||
      normalizedPath.includes('.svg?');

    if (isSvg) {
      const svgMarkup = await response.text();
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const svgObjectUrl = URL.createObjectURL(svgBlob);

      try {
        const image = await loadImage(svgObjectUrl);
        const sourceWidth = image.naturalWidth || 280;
        const sourceHeight = image.naturalHeight || 64;
        const scaleFactor = 3;

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(sourceWidth * scaleFactor));
        canvas.height = Math.max(1, Math.round(sourceHeight * scaleFactor));

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL('image/png', 1);
      } finally {
        URL.revokeObjectURL(svgObjectUrl);
      }
    }

    const imageBlob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(imageBlob);
    });
  } catch {
    return null;
  }
};

export async function downloadInvoicePdf(invoice: InvoicePdfPayload, options?: InvoicePdfOptions) {
  const config = {
    ...DEFAULT_OPTIONS,
    ...(options || {}),
  };

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 40;
  const rightEdge = pageWidth - marginX;
  const statusStyle = getStatusStyle(invoice.status);

  const logoDataUrl = await toDataUrl(config.logoPath);
  const logoBlockWidth = 220;
  const logoBlockHeight = 54;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 140, 'F');

  if (logoDataUrl) {
    try {
      const logoDimensions = await getDataUrlDimensions(logoDataUrl);
      const size = getContainedSize(
        logoDimensions?.width || logoBlockWidth,
        logoDimensions?.height || logoBlockHeight,
        logoBlockWidth,
        logoBlockHeight
      );

      const logoFormat = logoDataUrl.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
      const logoX = marginX;
      const logoY = 26 + (logoBlockHeight - size.height) / 2;

      doc.addImage(logoDataUrl, logoFormat, logoX, logoY, size.width, size.height, undefined, 'FAST');
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text(config.companyName.toUpperCase(), marginX, 60);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(config.companyName.toUpperCase(), marginX, 60);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('INVOICE', rightEdge, 58, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, rightEdge, 78, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.date)}`, rightEdge, 94, { align: 'right' });
  doc.text(`Due: ${formatDate(invoice.dueDate)}`, rightEdge, 110, { align: 'right' });

  const badgeWidth = Math.max(78, doc.getTextWidth(statusStyle.label) + 22);
  const badgeX = rightEdge - badgeWidth;
  const badgeY = 118;
  doc.setFillColor(...statusStyle.fill);
  doc.setDrawColor(...statusStyle.border);
  doc.roundedRect(badgeX, badgeY, badgeWidth, 20, 10, 10, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...statusStyle.text);
  doc.text(statusStyle.label, badgeX + badgeWidth / 2, badgeY + 13, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  const supportStartY = 162;
  doc.text(config.supportLabel, marginX, supportStartY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(config.supportPhone, marginX, supportStartY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(config.inquiryLabel, marginX, supportStartY + 34);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(config.supportEmail, marginX, supportStartY + 50);

  doc.setDrawColor(226, 232, 240);
  const dividerY = supportStartY + 64;
  doc.line(marginX, dividerY, rightEdge, dividerY);

  const billCardTop = dividerY + 16;
  const billCardHeight = 100;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, billCardTop, pageWidth - marginX * 2, billCardHeight, 10, 10, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text('BILL TO', marginX + 12, billCardTop + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const billToLines = [
    invoice.customerInfo.name,
    invoice.customerInfo.company,
    invoice.customerInfo.email,
    invoice.customerInfo.address,
    invoice.customerInfo.gst ? `GST: ${invoice.customerInfo.gst}` : '',
  ].filter(Boolean);

  const billContentWidth = pageWidth - marginX * 2 - 24;
  let billToY = billCardTop + 38;
  billToLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(String(line), billContentWidth);
    wrapped.forEach((textLine: string) => {
      doc.text(textLine, marginX + 12, billToY);
      billToY += 13;
    });
  });

  const tableStartY = billCardTop + billCardHeight + 20;
  const itemRows = invoice.items.length
    ? invoice.items.map((item) => [
        item.name,
        item.plan,
        String(item.quantity),
        formatInr(item.unitPrice),
        formatInr(item.total),
      ])
    : [['-', '-', '-', formatInr(0), formatInr(0)]];

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX },
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: { top: 8, right: 8, bottom: 8, left: 8 },
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.6,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [239, 246, 255],
      textColor: [30, 64, 175],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 170 },
      1: { cellWidth: 90 },
      2: { halign: 'center', cellWidth: 45 },
      3: { halign: 'right', cellWidth: 90 },
      4: { halign: 'right', cellWidth: 90 },
    },
    head: [['Service', 'Plan', 'Qty', 'Unit Price', 'Amount']],
    body: itemRows,
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || tableStartY + 100;

  let totalsY = finalTableY + 18;
  const totalsCardWidth = 220;
  const totalsCardHeight = invoice.paidDate ? 96 : 78;
  const totalsCardX = rightEdge - totalsCardWidth;

  if (totalsY + totalsCardHeight > pageHeight - 70) {
    doc.addPage();
    totalsY = 56;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsCardX, totalsY, totalsCardWidth, totalsCardHeight, 10, 10, 'FD');

  const totalsLabelX = totalsCardX + 12;
  const totalsValueX = totalsCardX + totalsCardWidth - 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal', totalsLabelX, totalsY + 22);
  doc.text(formatInr(invoice.subtotal), totalsValueX, totalsY + 22, { align: 'right' });

  doc.text('GST (18%)', totalsLabelX, totalsY + 40);
  doc.text(formatInr(invoice.tax), totalsValueX, totalsY + 40, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(totalsLabelX, totalsY + 48, totalsValueX, totalsY + 48);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Total', totalsLabelX, totalsY + 66);
  doc.text(formatInr(invoice.total), totalsValueX, totalsY + 66, { align: 'right' });

  if (invoice.paidDate) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(4, 120, 87);
    doc.text(`Paid on ${formatDate(invoice.paidDate)}`, totalsValueX, totalsY + 84, { align: 'right' });
    doc.setTextColor(15, 23, 42);
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, pageHeight - 56, rightEdge, pageHeight - 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${config.supportLabel}: ${config.supportPhone}`, marginX, pageHeight - 36);
  doc.text(`${config.inquiryLabel}: ${config.supportEmail}`, marginX, pageHeight - 22);

  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated invoice.', rightEdge, pageHeight - 22, { align: 'right' });

  const safeInvoiceNumber = String(invoice.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]+/g, '_');
  doc.save(`${safeInvoiceNumber}-${config.fileSuffix}.pdf`);
}

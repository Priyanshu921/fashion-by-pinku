import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Loads the brand SVG logo from /logo.svg, renders it onto a canvas
 * with a transparent background, and returns a PNG data URL.
 */
const loadLogoAsDataUrl = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load logo'));
    img.src = '/logo.svg';
  });
};

/** Format a number as Indian Rupees: Rs. 1,099.00 */
const fmt = (n: number): string =>
  `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Color palette ──────────────────────────────────────────
const C = {
  black:      [12, 12, 12]   as [number, number, number],
  darkGray:   [40, 40, 40]   as [number, number, number],
  midGray:    [110, 110, 110] as [number, number, number],
  lightGray:  [170, 170, 170] as [number, number, number],
  ruleGray:   [225, 225, 225] as [number, number, number],
  zebraGray:  [250, 248, 252] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  pink:       [255, 209, 220] as [number, number, number],
  headerBg:   [30, 30, 30]   as [number, number, number],
  tableHead:  [45, 45, 48]   as [number, number, number],
  green:      [34, 197, 94]  as [number, number, number],
  blue:       [59, 130, 246] as [number, number, number],
  amber:      [245, 158, 11] as [number, number, number],
  red:        [239, 68, 68]  as [number, number, number],
};

export const generateInvoice = async (order: any) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();   // 210
  const ph = doc.internal.pageSize.getHeight();  // 297
  const m  = 18; // generous outer margin
  const rightEdge = pw - m;

  // ─────────────────────────────────────────────
  //  1. HEADER BAND
  // ─────────────────────────────────────────────
  const hdrH = 44;
  doc.setFillColor(...C.black);
  doc.rect(0, 0, pw, hdrH, 'F');

  // Subtle pink accent — thin 1px line
  doc.setFillColor(...C.pink);
  doc.rect(0, hdrH, pw, 0.6, 'F');

  // Logo (left side)
  try {
    const logo = await loadLogoAsDataUrl();
    const logoH = 24;
    const logoW = logoH * (677 / 369); // exact aspect ratio
    doc.addImage(logo, 'PNG', m, (hdrH - logoH) / 2, logoW, logoH);
  } catch {
    doc.setFontSize(16);
    doc.setTextColor(...C.pink);
    doc.text('FASHION BY PINKU', m, hdrH / 2 + 2);
  }

  // Right-side header stack — clean vertical rhythm
  const hdrRightX = rightEdge;
  let hdrY = 13;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text('INVOICE', hdrRightX, hdrY, { align: 'right' });

  hdrY += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.lightGray);
  doc.text(`#INV-${String(order.id).padStart(4, '0')}`, hdrRightX, hdrY, { align: 'right' });

  hdrY += 6;
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  doc.text(dateStr, hdrRightX, hdrY, { align: 'right' });

  // Status pill — small rounded rect with text
  hdrY += 7;
  const status = (order.status || 'PENDING').toUpperCase();
  const statusColor: Record<string, [number, number, number]> = {
    PAID: C.green, CONFIRMED: C.green, SHIPPED: C.blue,
    DELIVERED: C.green, PENDING: C.amber, CANCELLED: C.red,
  };
  const sc = statusColor[status] || C.lightGray;
  const statusText = status;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const stw = doc.getTextWidth(statusText) + 8; // pill horizontal padding
  const sth = 5.5;
  // Pill is right-aligned to hdrRightX
  const pillRectX = hdrRightX - stw;
  const pillRectY = hdrY - sth + 1;

  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.roundedRect(pillRectX, pillRectY, stw, sth, 1.5, 1.5, 'F');
  doc.setTextColor(...C.white);
  // Center text both horizontally and vertically inside the pill
  doc.text(statusText, pillRectX + stw / 2, pillRectY + sth / 2 + 1.2, { align: 'center' });

  // ─────────────────────────────────────────────
  //  2. BILL TO / SHIP TO
  // ─────────────────────────────────────────────
  let y = hdrH + 16;
  const colL = m;
  const colR = pw / 2 + 8;

  // Section labels — small, uppercase, muted
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.midGray);
  doc.text('BILL TO', colL, y);
  doc.text('SHIP TO', colR, y);

  // Thin underline under labels
  y += 2;
  doc.setDrawColor(...C.ruleGray);
  doc.setLineWidth(0.3);
  doc.line(colL, y, colL + 28, y);
  doc.line(colR, y, colR + 28, y);

  y += 6;
  const name  = order.User?.name  || order.user?.name  || 'Customer';
  const email = order.User?.email || order.user?.email || '';

  // Bill To
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.darkGray);
  doc.text(name, colL, y);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.midGray);
  if (email) doc.text(email, colL, y + 5.5);

  // Ship To
  if (order.Address || order.address) {
    const a = order.Address || order.address;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.darkGray);
    doc.text(name, colR, y);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.midGray);
    doc.text(a.street || '', colR, y + 5.5);
    doc.text(`${a.city || ''}, ${a.state || ''} – ${a.zipCode || ''}`, colR, y + 11);
    doc.text(a.country || 'India', colR, y + 16.5);
  } else {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.lightGray);
    doc.text('No address provided', colR, y);
  }

  // Section separator
  y += 26;
  doc.setDrawColor(...C.ruleGray);
  doc.setLineWidth(0.3);
  doc.line(m, y, rightEdge, y);

  // ─────────────────────────────────────────────
  //  3. ITEMS TABLE
  // ─────────────────────────────────────────────
  y += 6;

  const cols = ['#', 'Description', 'Price', 'Qty', 'Amount'];
  const rows: (string | number)[][] = [];
  let subtotal = 0;

  if (order.items && Array.isArray(order.items)) {
    order.items.forEach((item: any, i: number) => {
      const title = item.Product?.title || item.product?.title || `Product #${item.productId}`;
      const price = parseFloat(item.price);
      const qty   = item.quantity;
      const total = price * qty;
      subtotal += total;
      rows.push([
        i + 1,
        title + (item.size ? `  ·  ${item.size}` : ''),
        fmt(price),
        qty,
        fmt(total),
      ]);
    });
  }

  autoTable(doc, {
    startY: y,
    head: [cols],
    body: rows,
    theme: 'plain',
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 6, bottom: 6, left: 5, right: 5 },
      textColor: C.darkGray,
    },
    headStyles: {
      fillColor: C.tableHead,
      textColor: C.pink,
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
    },
    bodyStyles: {
      lineColor: C.ruleGray,
      lineWidth: { bottom: 0.25, top: 0, left: 0, right: 0 },
    },
    alternateRowStyles: { fillColor: C.zebraGray },
    columnStyles: {
      0: { cellWidth: 12,  halign: 'center', textColor: C.midGray },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 32,  halign: 'right' },
      3: { cellWidth: 16,  halign: 'center' },
      4: { cellWidth: 36,  halign: 'right', fontStyle: 'bold', textColor: C.black },
    },
    margin: { left: m, right: m },
  });

  // ─────────────────────────────────────────────
  //  4. TOTALS (right-aligned to match table)
  // ─────────────────────────────────────────────
  const tblEnd  = (doc as any).lastAutoTable.finalY;
  let ty        = tblEnd + 12;
  // valX must match the right edge of the table (margin.right = m, so table right = pw - m)
  const valX    = pw - m;             // exactly matches autoTable right margin
  const lblX    = valX - 52;          // labels column, left of values

  const orderTotal  = parseFloat(order.totalAmount || order.total || '0');
  const deliveryFee = orderTotal - subtotal > 0 ? orderTotal - subtotal : 0;

  // Subtotal row
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.midGray);
  doc.text('Subtotal', lblX, ty, { align: 'right' });
  doc.setTextColor(...C.darkGray);
  doc.text(fmt(subtotal), valX, ty, { align: 'right' });

  // Delivery row
  ty += 7;
  doc.setTextColor(...C.midGray);
  doc.text('Delivery', lblX, ty, { align: 'right' });
  doc.setTextColor(...C.darkGray);
  doc.text(deliveryFee > 0 ? fmt(deliveryFee) : 'FREE', valX, ty, { align: 'right' });

  // Thin rule
  ty += 5;
  doc.setDrawColor(...C.ruleGray);
  doc.setLineWidth(0.4);
  doc.line(lblX - 10, ty, valX, ty);

  // Grand Total
  ty += 9;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.black);
  doc.text('Total', lblX, ty, { align: 'right' });
  doc.text(fmt(orderTotal), valX, ty, { align: 'right' });

  // Payment-received pill — positioned below Grand Total with clear spacing
  if (['PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(status)) {
    ty += 10;
    const pillText = 'Payment Received';
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const pillW = doc.getTextWidth(pillText) + 10;
    const pillH = 5.5;
    // Right-align pill to valX
    const pillX = valX - pillW;
    const pillY = ty - pillH + 1;

    doc.setFillColor(...C.green);
    doc.roundedRect(pillX, pillY, pillW, pillH, 2, 2, 'F');
    doc.setTextColor(...C.white);
    doc.text(pillText, pillX + pillW / 2, pillY + pillH / 2 + 1.2, { align: 'center' });
  }

  // ─────────────────────────────────────────────
  //  5. FOOTER
  // ─────────────────────────────────────────────
  const ftY = ph - 24;

  // Pink accent — very thin
  doc.setFillColor(...C.pink);
  doc.rect(m, ftY, rightEdge - m, 0.4, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.lightGray);
  doc.text('Thank you for shopping with Fashion By Pinku!', m, ftY + 7);

  doc.setFontSize(6.5);
  doc.setTextColor(200, 200, 200);
  doc.text('This is a computer-generated invoice and does not require a signature.', m, ftY + 12);
  doc.text('fashionbypinku.com', rightEdge, ftY + 12, { align: 'right' });

  // ─────────────────────────────────────────────
  //  SAVE
  // ─────────────────────────────────────────────
  doc.save(`Invoice_FBP_${String(order.id).padStart(4, '0')}.pdf`);
};

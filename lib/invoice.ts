export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentClass: string;
  tuitionFee: number;
  paid: boolean;
  amountPaid: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function generateInvoice(student: Student): Promise<void> {
  if (typeof window === "undefined") return;
  
  const { jsPDF } = await import("jspdf");
  
  const invoiceNumber = `INV-${Date.now()}`;
  const invoiceData = {
    invoiceNumber,
    studentName: student.name,
    studentEmail: student.email,
    studentPhone: student.phone,
    studentClass: student.studentClass,
    tuitionFee: student.tuitionFee,
    amountPaid: student.amountPaid,
    balance: student.tuitionFee - student.amountPaid,
    paid: student.paid,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    instituteName: "A² Institutions",
    instituteAddress: "F-1, Sai Mansion Apartments, Road No-3, Mallikarjuna Colony",
    instituteCity: "Old Bowenpally, Secunderabad, Hyderabad - 500011",
    institutePhone: "+91 XXX XXX XXXX",
    instituteEmail: "info@a2institutions.com",
  };

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 0;

  const primary = { r: 255, g: 180, b: 60 };
  const primaryDark = { r: 230, g: 150, b: 40 };
  const accent = { r: 45, g: 55, b: 72 };
  const success = { r: 34, g: 197, b: 94 };
  const danger = { r: 239, g: 68, b: 68 };
  const text = { r: 31, g: 41, b: 55 };
  const textLight = { r: 107, g: 114, b: 128 };
  const bgGray = { r: 249, g: 250, b: 251 };
  const white = { r: 255, g: 255, b: 255 };

  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, pageWidth, 60, "F");
  
  doc.setFillColor(primary.r, primary.g, primary.b);
  doc.triangle(pageWidth - 40, 0, pageWidth, 0, pageWidth, 40, "F");
  doc.triangle(0, 50, 0, 60, 30, 60, "F");

  doc.setTextColor(white.r, white.g, white.b);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("A²", margin, 25);
  
  doc.setFontSize(18);
  doc.text("INSTITUTIONS", margin + 20, 25);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(white.r, white.g, white.b);
  doc.text("Excellence in Education", margin, 33);

  doc.setFontSize(9);
  const contactY = 45;
  doc.text(invoiceData.institutePhone, pageWidth - margin, contactY, { align: "right" });
  doc.text(invoiceData.instituteEmail, pageWidth - margin, contactY + 5, { align: "right" });

  yPos = 75;

  doc.setFillColor(primary.r, primary.g, primary.b);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 20, "F");
  
  doc.setTextColor(white.r, white.g, white.b);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin + 5, yPos + 13);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`#${invoiceNumber}`, pageWidth - margin - 5, yPos + 13, { align: "right" });

  yPos += 30;

  const colWidth = (pageWidth - 2 * margin - 10) / 2;
  
  doc.setFillColor(bgGray.r, bgGray.g, bgGray.b);
  doc.roundedRect(margin, yPos, colWidth, 40, 3, 3, "F");
  
  doc.setTextColor(textLight.r, textLight.g, textLight.b);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE TO", margin + 5, yPos + 8);
  
  doc.setTextColor(text.r, text.g, text.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.studentName, margin + 5, yPos + 16);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textLight.r, textLight.g, textLight.b);
  doc.text(invoiceData.studentEmail, margin + 5, yPos + 23);
  doc.text(invoiceData.studentPhone, margin + 5, yPos + 29);
  doc.text(`Class: ${invoiceData.studentClass}`, margin + 5, yPos + 35);

  doc.setFillColor(bgGray.r, bgGray.g, bgGray.b);
  doc.roundedRect(margin + colWidth + 10, yPos, colWidth, 40, 3, 3, "F");
  
  doc.setTextColor(textLight.r, textLight.g, textLight.b);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE DETAILS", margin + colWidth + 15, yPos + 8);
  
  doc.setTextColor(text.r, text.g, text.b);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const detailX = margin + colWidth + 15;
  doc.text("Invoice Date:", detailX, yPos + 18);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.date, pageWidth - margin - 5, yPos + 18, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.text("Invoice Number:", detailX, yPos + 26);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceNumber, pageWidth - margin - 5, yPos + 26, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.text("Payment Status:", detailX, yPos + 34);
  
  const statusColor = invoiceData.paid ? success : danger;
  doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
  const statusText = invoiceData.paid ? "PAID" : "PENDING";
  const statusWidth = doc.getTextWidth(statusText) + 8;
  doc.roundedRect(pageWidth - margin - statusWidth - 5, yPos + 29, statusWidth, 7, 2, 2, "F");
  doc.setTextColor(white.r, white.g, white.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(statusText, pageWidth - margin - statusWidth / 2 - 5, yPos + 34, { align: "center" });

  yPos += 55;

  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 12, "F");
  
  doc.setTextColor(white.r, white.g, white.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIPTION", margin + 5, yPos + 8);
  doc.text("AMOUNT", pageWidth - margin - 5, yPos + 8, { align: "right" });

  yPos += 12;

  const lineHeight = 14;
  
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  
  doc.setFillColor(white.r, white.g, white.b);
  doc.rect(margin, yPos, pageWidth - 2 * margin, lineHeight, "F");
  doc.line(margin, yPos + lineHeight, pageWidth - margin, yPos + lineHeight);
  
  doc.setTextColor(text.r, text.g, text.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tuition Fee - ${invoiceData.studentClass}`, margin + 5, yPos + 9);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${invoiceData.tuitionFee.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPos + 9, { align: "right" });
  
  yPos += lineHeight;

  doc.setFillColor(bgGray.r, bgGray.g, bgGray.b);
  doc.rect(margin, yPos, pageWidth - 2 * margin, lineHeight, "F");
  doc.line(margin, yPos + lineHeight, pageWidth - margin, yPos + lineHeight);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(text.r, text.g, text.b);
  doc.text("Amount Paid", margin + 5, yPos + 9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(success.r, success.g, success.b);
  doc.text(`-Rs. ${invoiceData.amountPaid.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPos + 9, { align: "right" });
  
  yPos += lineHeight + 5;

  doc.setFillColor(primary.r, primary.g, primary.b);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 18, "F");
  
  doc.setTextColor(white.r, white.g, white.b);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BALANCE DUE", margin + 5, yPos + 11);
  doc.setFontSize(14);
  doc.text(`Rs. ${invoiceData.balance.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPos + 11, { align: "right" });

  yPos += 30;

  if (invoiceData.balance > 0 && !invoiceData.paid) {
    doc.setFillColor(249, 243, 232);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 3, 3, "F");
    
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT REMINDER", margin + 5, yPos + 8);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(146, 64, 14);
    const reminderText = `Please ensure payment of Rs. ${invoiceData.balance.toLocaleString('en-IN')} at your earliest convenience.`;
    doc.text(reminderText, margin + 5, yPos + 15);
    doc.text("For payment inquiries, please contact us at your convenience.", margin + 5, yPos + 21);
  }

  const footerY = pageHeight - 35;
  
  doc.setDrawColor(primary.r, primary.g, primary.b);
  doc.setLineWidth(1);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setTextColor(textLight.r, textLight.g, textLight.b);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  
  const addressLines = [
    invoiceData.instituteAddress,
    invoiceData.instituteCity
  ];
  
  let footerTextY = footerY + 8;
  addressLines.forEach(line => {
    doc.text(line, pageWidth / 2, footerTextY, { align: "center" });
    footerTextY += 4;
  });

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(text.r, text.g, text.b);
  doc.text("Thank you for choosing A² Institutions", pageWidth / 2, footerTextY + 4, { align: "center" });

  doc.setFillColor(primary.r, primary.g, primary.b);
  for (let i = 0; i < 3; i++) {
    doc.circle(pageWidth / 2 - 10 + (i * 10), pageHeight - 8, 1.5, "F");
  }

  doc.save(`Invoice_${invoiceData.invoiceNumber}_${invoiceData.studentName.replace(/\s+/g, "_")}.pdf`);
}
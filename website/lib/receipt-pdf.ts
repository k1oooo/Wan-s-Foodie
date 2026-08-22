import type { ConfirmedOrder } from "@/lib/order-utils";
import { formatRM } from "@/lib/order-utils";

type RGB = [number, number, number];

// Wan's Foodies customer-facing brand palette, as RGB triples for jsPDF
// (which doesn't understand hex/Tailwind classes). Kept local to this file
// rather than shared with the admin's pdf-colors.ts — same brand, but
// customer-facing code intentionally doesn't depend on anything under
// app/admin.
const BRAND = {
  terracotta: [193, 68, 45] as RGB,
  gold: [227, 167, 59] as RGB,
  cream: [251, 247, 242] as RGB,
  nearBlack: [31, 26, 23] as RGB,
  muted: [122, 111, 104] as RGB,
  white: [255, 255, 255] as RGB,
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Builds and downloads a one-page PDF receipt for a single confirmed order.
 * This is the customer's own copy of their order — since the site has no
 * accounts/order history, this (plus the WhatsApp thread) is the only
 * record they can keep without having to scroll back through chat.
 */
export async function generateReceiptPdf(
  order: ConfirmedOrder,
  pickupAddress: string,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF() as InstanceType<typeof jsPDF> & {
    lastAutoTable?: { finalY: number };
  };
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // ---- Header banner ----
  doc.setFillColor(...BRAND.terracotta);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(...BRAND.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Wan's Foodies", marginX, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Order Receipt", marginX, 22);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Order #${order.orderNumber}`, pageWidth - marginX, 15, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(formatDateTime(order.sentAt), pageWidth - marginX, 21, {
    align: "right",
  });

  let y = 40;

  // ---- Itemized list ----
  const itemRows = order.items.map((item) => [
    item.name,
    String(item.quantity),
    formatRM(item.price),
    formatRM(item.price * item.quantity),
  ]);

  autoTable(doc, {
    theme: "grid",
    margin: { left: marginX, right: marginX },
    startY: y,
    styles: { fontSize: 9, cellPadding: 3, textColor: BRAND.nearBlack },
    headStyles: {
      fillColor: BRAND.terracotta,
      textColor: BRAND.white,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: BRAND.cream },
    head: [["Item", "Boxes", "Price / Box", "Subtotal"]],
    body: itemRows,
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 8;

  // ---- Total ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.nearBlack);
  doc.text("Total", marginX, y);
  doc.setTextColor(...BRAND.terracotta);
  doc.text(formatRM(order.total), pageWidth - marginX, y, { align: "right" });
  y += 10;

  // ---- Customer + fulfilment details ----
  doc.setDrawColor(...BRAND.gold);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  function detailRow(label: string, value: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.nearBlack);
    doc.text(value, pageWidth - marginX, y, { align: "right" });
    y += 6;
  }

  detailRow("Name", order.customerName);
  detailRow("Phone", order.customerPhone);
  detailRow(
    "Fulfilment",
    order.deliveryMethod === "delivery" ? "Delivery" : "Self pickup",
  );

  const addressLabel =
    order.deliveryMethod === "delivery" ? "Delivery address" : "Pickup address";
  const addressValue =
    order.deliveryMethod === "delivery" ? order.address : pickupAddress;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text(addressLabel, marginX, y);
  y += 5;
  doc.setTextColor(...BRAND.nearBlack);
  const addressLines = doc.splitTextToSize(
    addressValue,
    pageWidth - marginX * 2,
  );
  doc.text(addressLines, marginX, y);
  y += addressLines.length * 5 + 6;

  // ---- Payment note ----
  doc.setFillColor(...BRAND.cream);
  const noteText =
    "Pay via DuitNow QR — sent once your order is confirmed on WhatsApp.";
  const noteLines = doc.splitTextToSize(noteText, pageWidth - marginX * 2 - 10);
  const noteHeight = noteLines.length * 5 + 8;
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, noteHeight, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text(noteLines, pageWidth / 2, y + noteHeight / 2, {
    align: "center",
    baseline: "middle",
  });

  // ---- Footer ----
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(
    "Thank you for ordering from Wan's Foodies!",
    marginX,
    pageHeight - 8,
  );
  doc.text(
    `Generated ${new Date().toLocaleString("en-MY")}`,
    pageWidth - marginX,
    pageHeight - 8,
    { align: "right" },
  );

  doc.save(`wans-foodies-receipt-${order.orderNumber}.pdf`);
}

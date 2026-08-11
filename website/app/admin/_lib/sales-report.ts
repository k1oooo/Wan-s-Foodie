import { createClient } from "@/lib/supabase/client";
import type { Category, MenuItem, Order, RegularCustomer } from "./types";
import {
  CATEGORY_STYLE,
  ORDER_STATUS_STYLE,
  PAYMENT_STATUS_STYLE,
} from "./category-style";
import {
  PDF_BRAND,
  CATEGORY_PDF_COLORS,
  ORDER_STATUS_PDF_COLORS,
  PAYMENT_STATUS_PDF_COLORS,
} from "./pdf-colors";

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Fetches this month's orders, menu, and regular-customer data fresh from
 * Supabase and builds the color-coded sales report PDF. Self-contained on
 * purpose — mirrors the queries in app/admin/dashboard/page.tsx — so it can
 * be triggered from any admin page (e.g. the sidebar) without depending on
 * props already being loaded on the current page.
 */
export async function generateSalesReportPdf(): Promise<void> {
  const supabase = createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthOrdersRes, recentOrdersRes, menuItemsRes, regularsRes] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .gte("created_at", startOfMonth.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("regular_customers").select("*"),
    ]);

  const monthOrders: Order[] = (monthOrdersRes.data ?? []).map((o) => ({
    ...o,
    items: o.order_items ?? [],
  }));
  const recentOrders: Order[] = (recentOrdersRes.data ?? []).map((o) => ({
    ...o,
    items: o.order_items ?? [],
  }));
  const menuItems: MenuItem[] = menuItemsRes.data ?? [];
  const regularCustomers: RegularCustomer[] = regularsRes.data ?? [];

  // "This month" = calendar month-to-date, matching the monthly_revenue view.
  const monthLabel = new Date().toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric",
  });

  const paidOrders = monthOrders.filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingCount = monthOrders.filter((o) => o.status === "pending").length;

  const boxesByItem = new Map<
    string,
    { name: string; category: Category; boxes: number; revenue: number }
  >();
  paidOrders
    .flatMap((o) => o.items)
    .forEach((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
      const key = item.item_name;
      const current = boxesByItem.get(key) ?? {
        name: item.item_name,
        category: menuItem?.category ?? "chicken",
        boxes: 0,
        revenue: 0,
      };
      current.boxes += item.quantity_boxes;
      current.revenue += item.subtotal;
      boxesByItem.set(key, current);
    });

  const allItemsByRevenue = [...boxesByItem.values()].sort(
    (a, b) => b.revenue - a.revenue,
  );

  const lowStockItems = menuItems.filter((m) => m.stock_boxes <= 5);

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF() as InstanceType<typeof jsPDF> & {
    lastAutoTable?: { finalY: number };
  };
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // ---- Header banner ----
  doc.setFillColor(...PDF_BRAND.terracotta);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(...PDF_BRAND.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Wan's Foodies", marginX, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Sales Report", marginX, 22);

  doc.setFontSize(9);
  doc.text(`Period: ${monthLabel}`, pageWidth - marginX, 12, {
    align: "right",
  });
  doc.text(
    `Generated: ${new Date().toLocaleString("en-MY")}`,
    pageWidth - marginX,
    18,
    { align: "right" },
  );

  let y = 40;

  function sectionTitle(title: string) {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...PDF_BRAND.terracotta);
    doc.text(title, marginX, y);
    doc.setDrawColor(...PDF_BRAND.gold);
    doc.setLineWidth(0.6);
    doc.line(marginX, y + 1.5, pageWidth - marginX, y + 1.5);
    y += 7;
  }

  function emptyStateNote(message: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BRAND.muted);
    doc.text(message, marginX, y);
    y += 10;
  }

  const sharedTableStyles = {
    theme: "grid" as const,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: PDF_BRAND.nearBlack,
    },
    headStyles: {
      fillColor: PDF_BRAND.terracotta,
      textColor: PDF_BRAND.white,
      fontStyle: "bold" as const,
    },
    alternateRowStyles: { fillColor: PDF_BRAND.cream },
  };

  // ---- Summary ----
  sectionTitle("Summary");
  autoTable(doc, {
    ...sharedTableStyles,
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Revenue (paid orders)", formatRM(totalRevenue)],
      ["Total orders", String(monthOrders.length)],
      ["Pending orders", String(pendingCount)],
      ["Regular customers (lifetime)", String(regularCustomers.length)],
    ],
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 10;

  // ---- Revenue by item ----
  sectionTitle("Revenue by Item");
  if (allItemsByRevenue.length === 0) {
    emptyStateNote("No paid orders yet this month.");
  } else {
    const totalBoxes = allItemsByRevenue.reduce((sum, i) => sum + i.boxes, 0);
    const itemRows = allItemsByRevenue.map((item) => [
      CATEGORY_STYLE[item.category].label,
      item.name,
      String(item.boxes),
      formatRM(item.revenue),
    ]);
    const totalRowIndex = itemRows.length;
    itemRows.push(["", "Total", String(totalBoxes), formatRM(totalRevenue)]);

    autoTable(doc, {
      ...sharedTableStyles,
      startY: y,
      head: [["Category", "Item", "Boxes Sold", "Revenue"]],
      body: itemRows,
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;

        if (data.row.index === totalRowIndex) {
          data.cell.styles.fillColor = PDF_BRAND.gold;
          data.cell.styles.textColor = PDF_BRAND.nearBlack;
          data.cell.styles.fontStyle = "bold";
          return;
        }

        const item = allItemsByRevenue[data.row.index];
        if (!item) return;

        if (data.column.index === 0) {
          const c = CATEGORY_PDF_COLORS[item.category];
          data.cell.styles.fillColor = c.bg;
          data.cell.styles.textColor = c.text;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 3) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 10;
  }

  // ---- Low stock alerts ----
  sectionTitle("Low Stock Alerts");
  if (lowStockItems.length === 0) {
    emptyStateNote("All items are well stocked.");
  } else {
    autoTable(doc, {
      ...sharedTableStyles,
      startY: y,
      head: [["Category", "Item", "Boxes Left"]],
      body: lowStockItems.map((item) => [
        CATEGORY_STYLE[item.category].label,
        item.name,
        String(item.stock_boxes),
      ]),
      columnStyles: { 2: { halign: "right" } },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        const item = lowStockItems[data.row.index];
        if (!item) return;

        if (data.column.index === 0) {
          const c = CATEGORY_PDF_COLORS[item.category];
          data.cell.styles.fillColor = c.bg;
          data.cell.styles.textColor = c.text;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 2) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor =
            item.stock_boxes === 0 ? [220, 38, 38] : [217, 119, 6];
        }
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 10;
  }

  // ---- Recent orders ----
  sectionTitle("Recent Orders");
  if (recentOrders.length === 0) {
    emptyStateNote("No orders yet.");
  } else {
    autoTable(doc, {
      ...sharedTableStyles,
      startY: y,
      head: [["Order", "Customer", "Status", "Payment", "Total"]],
      body: recentOrders.map((order) => [
        order.order_number,
        order.customer_name,
        ORDER_STATUS_STYLE[order.status].label,
        PAYMENT_STATUS_STYLE[order.payment_status].label,
        formatRM(order.total_amount),
      ]),
      columnStyles: { 4: { halign: "right" } },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        const order = recentOrders[data.row.index];
        if (!order) return;

        if (data.column.index === 2) {
          const c = ORDER_STATUS_PDF_COLORS[order.status];
          data.cell.styles.fillColor = c.bg;
          data.cell.styles.textColor = c.text;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 3) {
          const c = PAYMENT_STATUS_PDF_COLORS[order.payment_status];
          data.cell.styles.fillColor = c.bg;
          data.cell.styles.textColor = c.text;
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 4) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 10;
  }

  // ---- Regular customers ----
  sectionTitle("Regular Customers");
  if (regularCustomers.length === 0) {
    emptyStateNote("No repeat customers yet.");
  } else {
    const sortedCustomers = [...regularCustomers].sort(
      (a, b) => b.lifetime_spend - a.lifetime_spend,
    );

    autoTable(doc, {
      ...sharedTableStyles,
      startY: y,
      head: [
        ["Customer", "Phone", "Paid Orders", "Lifetime Spend", "Last Order"],
      ],
      body: sortedCustomers.map((c) => [
        c.customer_name,
        c.customer_phone,
        String(c.total_orders),
        formatRM(c.lifetime_spend),
        formatDate(c.last_order_at),
      ]),
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        if (data.column.index === 3) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 10;
  }

  // ---- Footer on every page ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...PDF_BRAND.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_BRAND.muted);
    doc.text("Wan's Foodies — Sales Report", marginX, pageHeight - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginX, pageHeight - 7, {
      align: "right",
    });
  }

  const filename = `wans-foodies-sales-report-${new Date()
    .toISOString()
    .slice(0, 7)}.pdf`;

  doc.save(filename);
}

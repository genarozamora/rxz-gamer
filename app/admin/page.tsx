"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_province: string | null;
  shipping_postal_code: string | null;
  shipping_company: string | null;
  tracking_number: string | null;
  receipt_path: string | null;
  payment_rejection_reason: string | null;
  created_at: string;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Pendiente de pago",
    receipt_uploaded: "Comprobante recibido",
    payment_verified: "Pago verificado",
    preparing_shipment: "Preparando despacho",
    shipped: "Despachado",
    delivered: "Entregado",
    payment_rejected: "Comprobante rechazado",
    cancelled: "Cancelado",
  };

  return labels[status] || status;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || profile?.role !== "admin") {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setAuthorized(true);
    await loadOrders();
  }

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  async function viewReceipt(order: Order) {
    setMessage("");

    if (!order.receipt_path) {
      setMessage("Este pedido todavía no tiene comprobante.");
      return;
    }

    const { data, error } = await supabase.storage
      .from("payment-receipts")
      .createSignedUrl(order.receipt_path, 300);

    if (error || !data?.signedUrl) {
      setMessage(
        error?.message || "No se pudo abrir el comprobante."
      );
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function approvePayment(order: Order) {
    const confirmed = window.confirm(
      `¿Confirmás que recibiste correctamente el pago del pedido ${order.order_number} por $${Number(
        order.total
      ).toLocaleString("es-AR")}?`
    );

    if (!confirmed) return;

    setProcessing(order.id);
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({
        status: "preparing_shipment",
        payment_rejection_reason: null,
      })
      .eq("id", order.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        `Pago del pedido ${order.order_number} aprobado. El pedido pasó a preparación de despacho.`
      );

      await loadOrders();
    }

    setProcessing(null);
  }

  async function rejectPayment(order: Order) {
    const reason = window.prompt(
      "Escribí el motivo por el que rechazás el comprobante:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      setMessage("Tenés que indicar un motivo para rechazar el comprobante.");
      return;
    }

    setProcessing(order.id);
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({
        status: "payment_rejected",
        payment_rejection_reason: reason.trim(),
      })
      .eq("id", order.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        `Comprobante del pedido ${order.order_number} rechazado.`
      );

      await loadOrders();
    }

    setProcessing(null);
  }

  async function markShipped(order: Order) {
    const company = window.prompt(
      "Empresa de transporte:",
      order.shipping_company || "OCA"
    );

    if (company === null) return;

    const tracking = window.prompt(
      "Número o código de seguimiento:",
      order.tracking_number || ""
    );

    if (tracking === null) return;

    if (!company.trim() || !tracking.trim()) {
      setMessage(
        "Para marcar el pedido como despachado necesitás indicar transporte y número de seguimiento."
      );
      return;
    }

    setProcessing(order.id);
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({
        status: "shipped",
        shipping_company: company.trim(),
        tracking_number: tracking.trim(),
      })
      .eq("id", order.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        `Pedido ${order.order_number} marcado como despachado.`
      );

      await loadOrders();
    }

    setProcessing(null);
  }

  async function markDelivered(order: Order) {
    const confirmed = window.confirm(
      `¿Marcar ${order.order_number} como entregado?`
    );

    if (!confirmed) return;

    setProcessing(order.id);
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({
        status: "delivered",
      })
      .eq("id", order.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        `Pedido ${order.order_number} marcado como entregado.`
      );

      await loadOrders();
    }

    setProcessing(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>Cargando panel...</div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main style={styles.page}>
        <div style={styles.accessCard}>
          <h1>Acceso restringido</h1>

          <p style={{ color: "#d1d5db" }}>
            Esta sección es solamente para administradores de RXZ Gamer.
          </p>

          <button
            style={styles.secondaryButton}
            onClick={() => (window.location.href = "/")}
          >
            VOLVER A RXZ GAMER
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: 0 }}>RXZ Gamer</h1>

            <p
              style={{
                marginTop: 6,
                color: "#9ca3af",
              }}
            >
              Panel de administración
            </p>
          </div>

          <div style={styles.headerButtons}>
            <button
              style={styles.secondaryButton}
              onClick={() => (window.location.href = "/")}
            >
              Ver tienda
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => (window.location.href = "/cuenta")}
            >
              Mi cuenta
            </button>

            <button style={styles.logoutButton} onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.summary}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Pedidos</span>
            <strong style={styles.summaryNumber}>
              {orders.length}
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>
              Comprobantes a revisar
            </span>

            <strong style={styles.summaryNumber}>
              {
                orders.filter(
                  (order) => order.status === "receipt_uploaded"
                ).length
              }
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>
              Preparando despacho
            </span>

            <strong style={styles.summaryNumber}>
              {
                orders.filter(
                  (order) =>
                    order.status === "preparing_shipment" ||
                    order.status === "payment_verified"
                ).length
              }
            </strong>
          </div>
        </div>

        <h2 style={{ marginTop: 30 }}>Pedidos</h2>

        {orders.length === 0 ? (
          <div style={styles.card}>
            Todavía no hay pedidos.
          </div>
        ) : (
          <div style={styles.orders}>
            {orders.map((order) => (
              <div key={order.id} style={styles.card}>
                <div style={styles.orderHeader}>
                  <div>
                    <div style={styles.orderNumber}>
                      {order.order_number}
                    </div>

                    <div style={styles.date}>
                      {new Date(order.created_at).toLocaleString(
                        "es-AR"
                      )}
                    </div>
                  </div>

                  <div style={styles.status}>
                    {statusLabel(order.status)}
                  </div>
                </div>

                <div style={styles.total}>
                  ${Number(order.total).toLocaleString("es-AR")}
                </div>

                <div style={styles.detailsGrid}>
                  <div>
                    <span style={styles.label}>Cliente</span>
                    <strong>
                      {order.customer_name || "Sin informar"}
                    </strong>
                  </div>

                  <div>
                    <span style={styles.label}>Email</span>
                    <strong>
                      {order.customer_email || "Sin informar"}
                    </strong>
                  </div>

                  <div>
                    <span style={styles.label}>Teléfono</span>
                    <strong>
                      {order.customer_phone || "Sin informar"}
                    </strong>
                  </div>

                  <div>
                    <span style={styles.label}>Código postal</span>
                    <strong>
                      {order.shipping_postal_code || "Sin informar"}
                    </strong>
                  </div>
                </div>

                <div style={styles.addressBox}>
                  <span style={styles.label}>
                    Dirección de entrega
                  </span>

                  <strong>
                    {order.shipping_address || "Sin informar"}
                    {order.shipping_city
                      ? `, ${order.shipping_city}`
                      : ""}
                    {order.shipping_province
                      ? `, ${order.shipping_province}`
                      : ""}
                  </strong>
                </div>

                {order.receipt_path && (
                  <button
                    style={styles.receiptButton}
                    onClick={() => viewReceipt(order)}
                  >
                    VER COMPROBANTE
                  </button>
                )}

                {order.status === "receipt_uploaded" && (
                  <div style={styles.actionGrid}>
                    <button
                      style={styles.approveButton}
                      disabled={processing === order.id}
                      onClick={() => approvePayment(order)}
                    >
                      {processing === order.id
                        ? "PROCESANDO..."
                        : "APROBAR PAGO"}
                    </button>

                    <button
                      style={styles.rejectButton}
                      disabled={processing === order.id}
                      onClick={() => rejectPayment(order)}
                    >
                      RECHAZAR COMPROBANTE
                    </button>
                  </div>
                )}

                {(order.status === "preparing_shipment" ||
                  order.status === "payment_verified") && (
                  <button
                    style={styles.shipButton}
                    disabled={processing === order.id}
                    onClick={() => markShipped(order)}
                  >
                    MARCAR COMO DESPACHADO
                  </button>
                )}

                {order.status === "shipped" && (
                  <>
                    <div style={styles.shippingInfo}>
                      <div>
                        Transporte:{" "}
                        <strong>
                          {order.shipping_company || "-"}
                        </strong>
                      </div>

                      <div style={{ marginTop: 7 }}>
                        Seguimiento:{" "}
                        <strong>
                          {order.tracking_number || "-"}
                        </strong>
                      </div>
                    </div>

                    <button
                      style={styles.approveButton}
                      disabled={processing === order.id}
                      onClick={() => markDelivered(order)}
                    >
                      MARCAR COMO ENTREGADO
                    </button>
                  </>
                )}

                {order.status === "payment_rejected" &&
                  order.payment_rejection_reason && (
                    <div style={styles.rejectionBox}>
                      <strong>Motivo del rechazo:</strong>

                      <div style={{ marginTop: 6 }}>
                        {order.payment_rejection_reason}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #0c3b36 0%, #071b25 45%, #02070b 100%)",
    color: "white",
    padding: "30px 20px",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
  },

  accessCard: {
    maxWidth: 500,
    margin: "100px auto",
    padding: 30,
    borderRadius: 18,
    background: "rgba(10,20,28,.96)",
    border: "1px solid rgba(255,255,255,.1)",
    textAlign: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },

  headerButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 15,
    marginTop: 30,
  },

  summaryCard: {
    background: "rgba(10,20,28,.96)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 14,
    padding: 18,
  },

  summaryLabel: {
    display: "block",
    color: "#9ca3af",
    marginBottom: 10,
  },

  summaryNumber: {
    fontSize: 30,
    color: "#22c55e",
  },

  orders: {
    display: "grid",
    gap: 18,
  },

  card: {
    padding: 22,
    borderRadius: 16,
    background: "rgba(10,20,28,.96)",
    border: "1px solid rgba(255,255,255,.1)",
  },

  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 15,
    flexWrap: "wrap",
  },

  orderNumber: {
    fontSize: 19,
    fontWeight: 800,
  },

  date: {
    marginTop: 5,
    color: "#9ca3af",
    fontSize: 14,
  },

  status: {
    color: "#22c55e",
    fontWeight: 800,
  },

  total: {
    marginTop: 18,
    fontSize: 27,
    fontWeight: 900,
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 15,
    marginTop: 20,
  },

  label: {
    display: "block",
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 5,
  },

  addressBox: {
    marginTop: 18,
    padding: 15,
    background: "#0f172a",
    borderRadius: 10,
  },

  receiptButton: {
    width: "100%",
    marginTop: 18,
    padding: 13,
    borderRadius: 10,
    border: "1px solid #3b82f6",
    background: "#172554",
    color: "#dbeafe",
    fontWeight: 800,
    cursor: "pointer",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 10,
    marginTop: 12,
  },

  approveButton: {
    width: "100%",
    marginTop: 12,
    padding: 13,
    borderRadius: 10,
    border: "none",
    background: "#22c55e",
    color: "#04110a",
    fontWeight: 900,
    cursor: "pointer",
  },

  rejectButton: {
    width: "100%",
    marginTop: 12,
    padding: 13,
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  shipButton: {
    width: "100%",
    marginTop: 18,
    padding: 13,
    borderRadius: 10,
    border: "none",
    background: "#f59e0b",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
  },

  shippingInfo: {
    marginTop: 18,
    padding: 15,
    borderRadius: 10,
    background: "#0f172a",
  },

  rejectionBox: {
    marginTop: 18,
    padding: 15,
    borderRadius: 10,
    background: "#450a0a",
    color: "#fee2e2",
  },

  message: {
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    background: "#111827",
    border: "1px solid #374151",
  },

  secondaryButton: {
    padding: "10px 15px",
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },

  logoutButton: {
    padding: "10px 15px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
};
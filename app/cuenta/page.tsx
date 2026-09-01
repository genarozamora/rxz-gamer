"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  tracking_number: string | null;
  shipping_company: string | null;
  receipt_path: string | null;
  payment_rejection_reason: string | null;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Pendiente de pago",
    receipt_uploaded: "Comprobante enviado - esperando verificación",
    payment_verified: "Pago verificado",
    preparing_shipment: "Preparando despacho",
    shipped: "Despachado",
    delivered: "Entregado",
    payment_rejected: "Comprobante rechazado",
    cancelled: "Cancelado",
  };

  return labels[status] || status;
}

export default function CuentaPage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setEmail(user.email || "");
    setUserId(user.id);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        total,
        created_at,
        tracking_number,
        shipping_company,
        receipt_path,
        payment_rejection_reason
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function uploadReceipt(order: Order, file: File) {
    setMessage("");

    if (!userId) {
      setMessage("No se pudo identificar tu cuenta.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("El comprobante debe ser JPG, PNG, WEBP o PDF.");
      return;
    }

    const maxSize = 8 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage("El archivo es demasiado grande. Máximo 8 MB.");
      return;
    }

    setUploadingOrderId(order.id);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        (file.type === "application/pdf" ? "pdf" : "jpg");

      const fileName = `comprobante-${Date.now()}.${extension}`;

      const filePath = `${userId}/${order.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          receipt_path: filePath,
          status: "receipt_uploaded",
          payment_rejection_reason: null,
        })
        .eq("id", order.id);

      if (orderError) {
        throw orderError;
      }

      setMessage(
        `Comprobante del pedido ${order.order_number} enviado correctamente.`
      );

      await loadAccount();
    } catch (error: any) {
      setMessage(
        error?.message || "Ocurrió un error al subir el comprobante."
      );
    } finally {
      setUploadingOrderId(null);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>Cargando...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: 0 }}>Mi cuenta</h1>
            <p style={{ color: "#9ca3af", marginTop: 6 }}>{email}</p>
          </div>

          <div style={styles.headerButtons}>
            <button
              onClick={() => (window.location.href = "/")}
              style={styles.secondaryButton}
            >
              Volver a la tienda
            </button>

            <button onClick={logout} style={styles.logoutButton}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        <h2>Mis pedidos</h2>

        {orders.length === 0 ? (
          <div style={styles.card}>Todavía no tenés pedidos.</div>
        ) : (
          <div style={styles.ordersGrid}>
            {orders.map((order) => (
              <div key={order.id} style={styles.card}>
                <div style={styles.orderTop}>
                  <div>
                    <strong style={{ fontSize: 18 }}>
                      {order.order_number}
                    </strong>

                    <div style={styles.date}>
                      {new Date(order.created_at).toLocaleDateString("es-AR")}
                    </div>
                  </div>

                  <div style={styles.status}>
                    {statusLabel(order.status)}
                  </div>
                </div>

                <div style={styles.total}>
                  Total: $
                  {Number(order.total).toLocaleString("es-AR")}
                </div>

                {order.status === "pending_payment" && (
                  <div style={styles.paymentBox}>
                    <div>Transferí el total al alias:</div>

                    <div style={styles.alias}>genaroperaltaz</div>

                    <div style={styles.receiptSection}>
                      <p style={styles.receiptText}>
                        Después de hacer la transferencia, adjuntá el
                        comprobante para que podamos verificar el pago.
                      </p>

                      <label
                        style={{
                          ...styles.uploadButton,
                          opacity:
                            uploadingOrderId === order.id ? 0.6 : 1,
                        }}
                      >
                        {uploadingOrderId === order.id
                          ? "SUBIENDO..."
                          : "SUBIR COMPROBANTE"}

                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                          disabled={uploadingOrderId === order.id}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];

                            if (file) {
                              uploadReceipt(order, file);
                            }

                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {order.status === "receipt_uploaded" && (
                  <div style={styles.waitingBox}>
                    <strong>Comprobante recibido</strong>

                    <p style={{ marginBottom: 0 }}>
                      Estamos verificando el pago. Cuando sea aprobado, el
                      pedido pasará a preparación de despacho.
                    </p>
                  </div>
                )}

                {order.status === "payment_rejected" && (
                  <div style={styles.rejectedBox}>
                    <strong>El comprobante fue rechazado.</strong>

                    {order.payment_rejection_reason && (
                      <p>
                        Motivo: {order.payment_rejection_reason}
                      </p>
                    )}

                    <p>
                      Podés enviar un nuevo comprobante.
                    </p>

                    <label style={styles.uploadButton}>
                      SUBIR NUEVO COMPROBANTE

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            uploadReceipt(order, file);
                          }

                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                )}

                {order.status === "payment_verified" && (
                  <div style={styles.verifiedBox}>
                    <strong>Pago verificado.</strong>
                    <p style={{ marginBottom: 0 }}>
                      Tu pedido fue aprobado y será preparado para despacho.
                    </p>
                  </div>
                )}

                {order.status === "preparing_shipment" && (
                  <div style={styles.verifiedBox}>
                    <strong>Preparando despacho.</strong>
                    <p style={{ marginBottom: 0 }}>
                      Estamos preparando tu pedido para enviarlo.
                    </p>
                  </div>
                )}

                {order.status === "shipped" && (
                  <div style={styles.shippingBox}>
                    <div>
                      Transporte:{" "}
                      <strong>
                        {order.shipping_company ||
                          "Información pendiente"}
                      </strong>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      Seguimiento:{" "}
                      <strong>
                        {order.tracking_number ||
                          "Información pendiente"}
                      </strong>
                    </div>
                  </div>
                )}

                {order.status === "delivered" && (
                  <div style={styles.verifiedBox}>
                    <strong>Pedido entregado.</strong>
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
    maxWidth: 900,
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 30,
  },

  headerButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  ordersGrid: {
    display: "grid",
    gap: 16,
    marginTop: 15,
  },

  card: {
    background: "rgba(10,20,28,.96)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 16,
    padding: 22,
  },

  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    flexWrap: "wrap",
  },

  date: {
    color: "#9ca3af",
    marginTop: 6,
  },

  status: {
    fontWeight: 800,
    color: "#22c55e",
  },

  total: {
    marginTop: 18,
    fontSize: 21,
    fontWeight: 800,
  },

  paymentBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 12,
    background: "#0f172a",
  },

  alias: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: 800,
    color: "#60a5fa",
  },

  receiptSection: {
    marginTop: 20,
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,.1)",
  },

  receiptText: {
    color: "#d1d5db",
    lineHeight: 1.5,
  },

  uploadButton: {
    display: "block",
    width: "100%",
    textAlign: "center",
    marginTop: 15,
    padding: "13px 16px",
    borderRadius: 10,
    border: "none",
    background: "#22c55e",
    color: "#04110a",
    fontWeight: 800,
    cursor: "pointer",
  },

  waitingBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    background: "#172554",
    color: "#dbeafe",
  },

  verifiedBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    background: "#052e16",
    color: "#dcfce7",
  },

  rejectedBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    background: "#450a0a",
    color: "#fee2e2",
  },

  shippingBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    background: "#0f172a",
  },

  message: {
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    background: "#111827",
    border: "1px solid #374151",
    color: "#d1d5db",
  },

  secondaryButton: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },

  logoutButton: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  },
};
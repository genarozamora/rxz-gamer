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
  order_items: { product_id: string; product_name: string }[];
};

const ORDER_STEPS = [
  {
    key: "reservation",
    title: "Reserva creada",
    description: "Recibimos tu pedido.",
    icon: "✓",
  },
  {
    key: "payment",
    title: "Pago",
    description: "Esperando comprobante y verificación.",
    icon: "$",
  },
  {
    key: "confirmed",
    title: "Pago aprobado",
    description: "Tu compra fue confirmada.",
    icon: "✓",
  },
  {
    key: "preparing",
    title: "Preparando pedido",
    description: "Estamos preparando tu compra.",
    icon: "📦",
  },
  {
    key: "shipped",
    title: "Despachado",
    description: "Tu pedido está en camino.",
    icon: "🚚",
  },
  {
    key: "delivered",
    title: "Entregado",
    description: "Pedido recibido.",
    icon: "🏠",
  },
];

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Reserva creada - pendiente de pago",
    receipt_uploaded: "Comprobante recibido",
    payment_verified: "Pago aprobado",
    preparing_shipment: "Preparando pedido",
    shipped: "Despachado",
    delivered: "Entregado",
    payment_rejected: "Comprobante rechazado",
    cancelled: "Cancelado",
  };

  return labels[status] || status;
}

function getCurrentStep(status: string) {
  const map: Record<string, number> = {
    pending_payment: 0,
    receipt_uploaded: 1,
    payment_rejected: 1,
    payment_verified: 2,
    preparing_shipment: 3,
    shipped: 4,
    delivered: 5,
  };

  return map[status] ?? 0;
}

function OrderProgress({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div style={styles.cancelledProgress}>
        <strong>Pedido cancelado</strong>
        <span>Esta reserva ya no se encuentra activa.</span>
      </div>
    );
  }

  const currentStep = getCurrentStep(status);

  return (
    <div style={styles.progressWrapper}>
      <div style={styles.progressHeader}>
        <div>
          <div style={styles.progressEyebrow}>ESTADO DE TU RESERVA</div>
          <h3 style={styles.progressTitle}>{statusLabel(status)}</h3>
        </div>
        <div style={styles.progressPercent}>
          {Math.round(((currentStep + 1) / ORDER_STEPS.length) * 100)}%
        </div>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%`,
          }}
        />
      </div>

      <div style={styles.stepsGrid}>
        {ORDER_STEPS.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;
          const pending = index > currentStep;

          return (
            <div key={step.key} style={styles.step}>
              <div
                style={{
                  ...styles.stepCircle,
                  ...(completed ? styles.stepCircleCompleted : {}),
                  ...(active ? styles.stepCircleActive : {}),
                  ...(pending ? styles.stepCirclePending : {}),
                }}
              >
                {completed ? "✓" : step.icon}
              </div>

              <div
                style={{
                  ...styles.stepTitle,
                  color: active || completed ? "#f8fafc" : "#64748b",
                }}
              >
                {step.title}
              </div>

              <div
                style={{
                  ...styles.stepDescription,
                  color: active ? "#a7f3d0" : "#64748b",
                }}
              >
                {active ? step.description : completed ? "Completado" : "Pendiente"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
        payment_rejection_reason,
        order_items (
          product_id,
          product_name
        )
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

      if (uploadError) throw uploadError;

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          receipt_path: filePath,
          status: "receipt_uploaded",
          payment_rejection_reason: null,
        })
        .eq("id", order.id);

      if (orderError) throw orderError;

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
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.brand}>
              RXZ <span style={{ color: "#22c55e" }}>GAMER</span>
            </div>
            <h1 style={{ margin: "12px 0 0" }}>Mi cuenta</h1>
            <p style={{ color: "#94a3b8", marginTop: 6 }}>{email}</p>
          </div>

          <div style={styles.headerButtons}>
            <button
              onClick={() => (window.location.href = "/")}
              style={styles.secondaryButton}
            >
              VOLVER A LA TIENDA
            </button>

            <button onClick={logout} style={styles.logoutButton}>
              CERRAR SESIÓN
            </button>
          </div>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.sectionHeading}>
          <div>
            <div style={styles.eyebrow}>TUS COMPRAS</div>
            <h2 style={{ margin: "5px 0 0" }}>Reservas y pedidos</h2>
          </div>
          <div style={styles.orderCount}>
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={{ fontSize: 42 }}>🛒</div>
            <h3>Todavía no tenés pedidos</h3>
            <p style={{ color: "#94a3b8" }}>
              Cuando hagas una compra, vas a poder seguir todo el proceso desde acá.
            </p>
          </div>
        ) : (
          <div style={styles.ordersGrid}>
            {orders.map((order) => (
              <article key={order.id} style={styles.card}>
                <div style={styles.orderTop}>
                  <div>
                    <div style={styles.orderLabel}>RESERVA</div>
                    <strong style={styles.orderNumber}>
                      {order.order_number}
                    </strong>
                    <div style={styles.date}>
                      Creada el{" "}
                      {new Date(order.created_at).toLocaleDateString("es-AR")}
                    </div>
                  </div>

                  <div style={styles.statusBadge}>
                    {statusLabel(order.status)}
                  </div>
                </div>

                <div style={styles.total}>
                  <span style={{ color: "#94a3b8", fontSize: 14 }}>TOTAL</span>
                  <strong>
                    ${Number(order.total).toLocaleString("es-AR")}
                  </strong>
                </div>

                <OrderProgress status={order.status} />

                {order.status === "pending_payment" && (
                  <div style={styles.paymentBox}>
                    <div style={styles.boxTitle}>Falta completar el pago</div>
                    <p style={styles.boxText}>
                      Transferí el total al siguiente alias y después adjuntá
                      el comprobante.
                    </p>

                    <div style={styles.alias}>genaroperaltaz</div>

                    <label
                      style={{
                        ...styles.uploadButton,
                        opacity: uploadingOrderId === order.id ? 0.6 : 1,
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
                          if (file) uploadReceipt(order, file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                )}

                {order.status === "receipt_uploaded" && (
                  <div style={styles.waitingBox}>
                    <strong>Comprobante recibido</strong>
                    <p style={styles.boxText}>
                      Estamos verificando la acreditación. No necesitás hacer
                      nada más por el momento.
                    </p>
                  </div>
                )}

                {order.status === "payment_rejected" && (
                  <div style={styles.rejectedBox}>
                    <strong>Necesitamos un nuevo comprobante</strong>

                    {order.payment_rejection_reason && (
                      <p style={styles.boxText}>
                        Motivo: {order.payment_rejection_reason}
                      </p>
                    )}

                    <label style={styles.uploadButton}>
                      SUBIR NUEVO COMPROBANTE
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadReceipt(order, file);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                )}

                {order.status === "payment_verified" && (
                  <div style={styles.verifiedBox}>
                    <strong>Pago aprobado</strong>
                    <p style={styles.boxText}>
                      Tu reserva quedó confirmada y va a pasar a preparación.
                    </p>
                  </div>
                )}

                {order.status === "preparing_shipment" && (
                  <div style={styles.verifiedBox}>
                    <strong>Estamos preparando tu pedido</strong>
                    <p style={styles.boxText}>
                      Estamos acondicionando tu compra para entregarla al transporte.
                    </p>
                  </div>
                )}

                {order.status === "shipped" && (
                  <div style={styles.shippingBox}>
                    <div style={styles.shippingTitle}>🚚 Tu pedido está en camino</div>

                    <div style={styles.shippingGrid}>
                      <div>
                        <span style={styles.shippingLabel}>TRANSPORTE</span>
                        <strong>
                          {order.shipping_company || "Información pendiente"}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.shippingLabel}>SEGUIMIENTO</span>
                        <strong>
                          {order.tracking_number || "Información pendiente"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {order.status === "delivered" && (
                  <div style={styles.deliveredBox}>
                    <strong>✓ Pedido entregado</strong>
                    <p style={styles.boxText}>
                      La compra figura como entregada. Gracias por elegir RXZ Gamer.
                    </p>
                    {order.order_items?.map((item) => (
                      <a key={item.product_id} href={`/productos/${item.product_id}?reviewOrder=${order.id}`} style={styles.reviewLink}>
                        OPINAR SOBRE {item.product_name}
                      </a>
                    ))}
                  </div>
                )}
              </article>
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
    background: "#02070b",
    color: "white",
    padding: "32px 20px 60px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  backgroundGlowOne: {
    position: "fixed",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "rgba(34,197,94,.09)",
    filter: "blur(100px)",
    top: -180,
    left: -170,
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "fixed",
    width: 550,
    height: 550,
    borderRadius: "50%",
    background: "rgba(37,99,235,.09)",
    filter: "blur(120px)",
    right: -220,
    bottom: -220,
    pointerEvents: "none",
  },

  container: {
    maxWidth: 1120,
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 42,
  },

  brand: {
    fontWeight: 950,
    letterSpacing: 2,
    fontSize: 20,
  },

  headerButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 20,
    marginBottom: 18,
    flexWrap: "wrap",
  },

  eyebrow: {
    fontSize: 12,
    color: "#22c55e",
    letterSpacing: 2.5,
    fontWeight: 900,
  },

  orderCount: {
    color: "#94a3b8",
    fontSize: 14,
  },

  ordersGrid: {
    display: "grid",
    gap: 22,
  },

  card: {
    background: "linear-gradient(145deg,rgba(12,23,31,.98),rgba(5,12,18,.98))",
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 22,
    padding: 25,
    boxShadow: "0 20px 60px rgba(0,0,0,.28)",
  },

  emptyCard: {
    background: "rgba(10,20,28,.94)",
    border: "1px solid rgba(255,255,255,.09)",
    borderRadius: 20,
    padding: 40,
    textAlign: "center",
  },

  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  orderLabel: {
    fontSize: 11,
    color: "#22c55e",
    fontWeight: 900,
    letterSpacing: 2,
    marginBottom: 7,
  },

  orderNumber: {
    fontSize: 22,
  },

  date: {
    color: "#64748b",
    marginTop: 7,
    fontSize: 14,
  },

  statusBadge: {
    padding: "9px 13px",
    borderRadius: 999,
    background: "rgba(34,197,94,.11)",
    border: "1px solid rgba(34,197,94,.30)",
    color: "#86efac",
    fontWeight: 800,
    fontSize: 13,
  },

  total: {
    marginTop: 20,
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    fontSize: 23,
  },

  progressWrapper: {
    marginTop: 24,
    padding: "22px 18px 20px",
    borderRadius: 17,
    background: "rgba(1,8,12,.72)",
    border: "1px solid rgba(255,255,255,.07)",
    overflowX: "auto",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "flex-start",
    marginBottom: 20,
  },

  progressEyebrow: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: 900,
    letterSpacing: 2,
  },

  progressTitle: {
    margin: "5px 0 0",
    fontSize: 18,
  },

  progressPercent: {
    color: "#22c55e",
    fontWeight: 900,
  },

  progressTrack: {
    height: 4,
    background: "#17202b",
    borderRadius: 99,
    margin: "0 42px",
    position: "relative",
    overflow: "hidden",
  },

  progressFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    background: "linear-gradient(90deg,#16a34a,#22c55e)",
    borderRadius: 99,
  },

  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6,minmax(105px,1fr))",
    gap: 8,
    minWidth: 720,
    marginTop: -14,
  },

  step: {
    textAlign: "center",
  },

  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    margin: "0 auto 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 900,
    border: "3px solid #02070b",
    position: "relative",
    zIndex: 2,
  },

  stepCircleCompleted: {
    background: "#22c55e",
    color: "#021006",
    boxShadow: "0 0 0 2px rgba(34,197,94,.25)",
  },

  stepCircleActive: {
    background: "#02070b",
    color: "#4ade80",
    border: "3px solid #22c55e",
    boxShadow: "0 0 20px rgba(34,197,94,.35)",
  },

  stepCirclePending: {
    background: "#101923",
    color: "#536171",
  },

  stepTitle: {
    fontSize: 12,
    fontWeight: 850,
  },

  stepDescription: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 1.35,
  },

  paymentBox: {
    marginTop: 18,
    padding: 19,
    borderRadius: 14,
    background: "#0f172a",
    border: "1px solid #25334a",
  },

  waitingBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 14,
    background: "rgba(30,58,138,.35)",
    border: "1px solid rgba(96,165,250,.25)",
    color: "#dbeafe",
  },

  verifiedBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 14,
    background: "rgba(5,46,22,.7)",
    border: "1px solid rgba(34,197,94,.20)",
    color: "#dcfce7",
  },

  rejectedBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 14,
    background: "rgba(69,10,10,.72)",
    border: "1px solid rgba(248,113,113,.25)",
    color: "#fee2e2",
  },

  shippingBox: {
    marginTop: 18,
    padding: 20,
    borderRadius: 14,
    background: "rgba(8,47,73,.58)",
    border: "1px solid rgba(56,189,248,.22)",
  },

  shippingTitle: {
    fontWeight: 900,
    fontSize: 17,
    marginBottom: 16,
  },

  shippingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 14,
  },

  shippingLabel: {
    display: "block",
    color: "#7dd3fc",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  deliveredBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 14,
    background: "rgba(20,83,45,.55)",
    border: "1px solid rgba(74,222,128,.22)",
    color: "#dcfce7",
  },

  reviewLink: {
    display: "block",
    marginTop: 12,
    padding: 11,
    borderRadius: 9,
    background: "rgba(34,197,94,.12)",
    border: "1px solid rgba(34,197,94,.3)",
    color: "#86efac",
    textAlign: "center",
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 900,
  },

  cancelledProgress: {
    marginTop: 22,
    padding: 18,
    borderRadius: 14,
    background: "rgba(69,10,10,.65)",
    border: "1px solid rgba(248,113,113,.22)",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#fecaca",
  },

  boxTitle: {
    fontWeight: 900,
    fontSize: 16,
  },

  boxText: {
    margin: "7px 0 0",
    color: "#cbd5e1",
    lineHeight: 1.5,
  },

  alias: {
    marginTop: 14,
    padding: "13px 15px",
    borderRadius: 10,
    background: "#020617",
    color: "#60a5fa",
    fontSize: 22,
    fontWeight: 900,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  uploadButton: {
    display: "block",
    width: "100%",
    textAlign: "center",
    marginTop: 16,
    padding: "14px 16px",
    borderRadius: 10,
    border: "none",
    background: "#22c55e",
    color: "#04110a",
    fontWeight: 900,
    cursor: "pointer",
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
    padding: "11px 15px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#0b1220",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },

  logoutButton: {
    padding: "11px 15px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: 850,
    fontSize: 12,
  },
};

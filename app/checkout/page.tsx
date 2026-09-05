"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: number;
  brand: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
};

type CreatedOrder = {
  id: string;
  order_number: string;
  total: number;
};

const ALIAS = "genaroperaltaz";
const PROVINCES = ["Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("Córdoba");
  const [postalCode, setPostalCode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      try {
        const saved = localStorage.getItem("rxz-cart");

        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch {
        setCart([]);
      }

      setLoading(false);
    }

    load();
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    [cart]
  );

  async function createOrder() {
    setMessage("");

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !province.trim() ||
      !postalCode.trim()
    ) {
      setMessage("Completá todos los datos de envío.");
      return;
    }

    if (cart.length === 0) {
      setMessage("Tu carrito está vacío.");
      return;
    }

    if (!/^\+?[0-9 ()-]{8,20}$/.test(phone.trim())) {
      setMessage("Ingresá un teléfono válido, incluyendo código de área.");
      return;
    }

    if (fullName.trim().length > 120 || address.trim().length > 250 || city.trim().length > 120) {
      setMessage("Uno de los datos de envío es demasiado largo.");
      return;
    }

    if (cart.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10)) {
      setMessage("La cantidad de productos del carrito no es válida.");
      return;
    }

    if (!/^[A-Za-z0-9 -]{3,10}$/.test(postalCode.trim())) {
      setMessage("Ingresá un código postal válido.");
      return;
    }

    if (!acceptedTerms) {
      setMessage("Para continuar, aceptá los términos y las políticas de compra.");
      return;
    }

    setCreating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: order, error: orderError } = await supabase
        .rpc("create_store_order", {
          p_customer_name: fullName.trim(),
          p_customer_email: user.email || "",
          p_customer_phone: phone.trim(),
          p_shipping_address: address.trim(),
          p_shipping_city: city.trim(),
          p_shipping_province: province.trim(),
          p_shipping_postal_code: postalCode.trim(),
          p_items: cart.map((item) => ({ product_id: item.id, variant_id: item.variantId || null, quantity: item.quantity })),
        })
        .single();

      if (orderError || !order) {
        throw orderError || new Error("No se pudo crear el pedido.");
      }

      const created = order as { order_id: string; order_number: string; total: number };
      setCreatedOrder({ id: created.order_id, order_number: created.order_number, total: Number(created.total) });

      void supabase.from("store_events").insert({
        event_name: "purchase",
        user_id: user.id,
        metadata: { order_id: created.order_id, total: Number(created.total) },
      });

      localStorage.removeItem("rxz-cart");

      setCart([]);
    } catch (error: any) {
      setMessage(error?.message || "Ocurrió un error al crear el pedido.");
    } finally {
      setCreating(false);
    }
  }

  function money(value: number) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  }

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>Cargando checkout...</div>
      </main>
    );
  }

  if (createdOrder) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.card, maxWidth: 650 }}>
          <h1 style={styles.title}>Pedido generado</h1>

          <p style={styles.center}>
            Tu pedido fue creado correctamente.
          </p>

          <div style={styles.orderBox}>
            <span>Número de pedido</span>
            <strong style={{ fontSize: 22 }}>
              {createdOrder.order_number}
            </strong>
            <button style={styles.copyButton} onClick={() => copy(createdOrder.order_number, "pedido")}>{copied === "pedido" ? "COPIADO" : "COPIAR"}</button>
          </div>

          <div style={styles.orderBox}>
            <span>Total a transferir</span>
            <strong style={{ fontSize: 28, color: "#22c55e" }}>
              {money(Number(createdOrder.total))}
            </strong>
          </div>

          <div style={styles.aliasBox}>
            <div style={{ color: "#9ca3af" }}>
              Transferí al alias:
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                marginTop: 8,
                color: "#60a5fa",
              }}
            >
              {ALIAS}
            </div>
            <button style={styles.copyButton} onClick={() => copy(ALIAS, "alias")}>{copied === "alias" ? "COPIADO" : "COPIAR ALIAS"}</button>
          </div>

          <p
            style={{
              color: "#d1d5db",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Después de realizar la transferencia, entrá a tu cuenta y
            adjuntá el comprobante. El pedido se despachará una vez que el
            pago sea verificado.
          </p>

          <button
            style={styles.primaryButton}
            onClick={() =>
              (window.location.href = `/cuenta`)
            }
          >
            IR A MI CUENTA
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => (window.location.href = "/")}
          >
            VOLVER A LA TIENDA
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Finalizar compra</h1>

          <h2>Datos de envío</h2>

          <input
            style={styles.input}
            placeholder="Nombre y apellido"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Ciudad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <select
            style={styles.input}
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            {PROVINCES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <input
            style={styles.input}
            placeholder="Código postal"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />

          {message && (
            <div
              style={{
                marginTop: 15,
                padding: 12,
                background: "#3f1515",
                borderRadius: 10,
                color: "#fecaca",
              }}
            >
              {message}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2>Tu pedido</h2>

          {cart.length === 0 ? (
            <p>Tu carrito está vacío.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={`${item.id}:${item.variantId || "default"}`} style={styles.itemRow}>
                  <div>
                    <strong>
                      {item.quantity}x {item.brand} {item.name}
                    </strong>
                    {item.variantLabel && <div style={{ color: "#94a3b8", marginTop: 4 }}>Color: {item.variantLabel}</div>}
                  </div>

                  <strong>
                    {money(item.price * item.quantity)}
                  </strong>
                </div>
              ))}

              <div style={styles.totalRow}>
                <span>Total productos</span>
                <strong>{money(subtotal)}</strong>
              </div>

              <div style={styles.shippingNote}>
                El costo y plazo del envío se confirman según el código postal antes del despacho. Nunca se cobrará un importe adicional sin informártelo.
              </div>

              <label style={styles.termsRow}>
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
                <span>Acepto los <a href="/legal/terminos" target="_blank">términos</a>, la <a href="/legal/privacidad" target="_blank">privacidad</a> y las condiciones de <a href="/legal/envios" target="_blank">envío</a>.</span>
              </label>

              <button
                style={styles.primaryButton}
                onClick={createOrder}
                disabled={creating}
              >
                {creating
                  ? "GENERANDO PEDIDO..."
                  : "CONFIRMAR PEDIDO"}
              </button>
            </>
          )}

          <button
            style={styles.secondaryButton}
            onClick={() => (window.location.href = "/")}
          >
            VOLVER A LA TIENDA
          </button>
        </div>
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
  },

  card: {
    width: "100%",
    background: "rgba(10,20,28,.96)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 18,
    padding: 25,
    margin: "0 auto",
  },

  title: {
    marginTop: 0,
    textAlign: "center",
  },

  center: {
    textAlign: "center",
    color: "#d1d5db",
  },

  input: {
    width: "100%",
    padding: 13,
    marginBottom: 12,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#111827",
    color: "white",
    fontSize: 15,
  },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,.08)",
  },

  totalRow: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 22,
  },

  shippingNote: {
    marginTop: 15,
    color: "#9ca3af",
    fontSize: 14,
  },

  termsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 18,
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.5,
  },

  copyButton: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 900,
  },

  primaryButton: {
    width: "100%",
    padding: 14,
    marginTop: 20,
    borderRadius: 10,
    border: "none",
    background: "#22c55e",
    color: "#04110a",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },

  aliasBox: {
    marginTop: 20,
    padding: 20,
    borderRadius: 14,
    background: "#0f172a",
    textAlign: "center",
  },

  orderBox: {
    marginTop: 15,
    padding: 16,
    borderRadius: 12,
    background: "#111827",
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    alignItems: "center",
  },
};

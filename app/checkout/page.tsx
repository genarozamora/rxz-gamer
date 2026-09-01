"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: number;
  brand: string;
  name: string;
  price: number;
  quantity: number;
};

type CreatedOrder = {
  id: string;
  order_number: string;
  total: number;
};

const ALIAS = "genaroperaltaz";

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
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending_payment",
          subtotal,
          shipping_cost: 0,
          total: subtotal,
          customer_name: fullName.trim(),
          customer_email: user.email || "",
          customer_phone: phone.trim(),
          shipping_address: address.trim(),
          shipping_city: city.trim(),
          shipping_province: province.trim(),
          shipping_postal_code: postalCode.trim(),
        })
        .select("id, order_number, total")
        .single();

      if (orderError || !order) {
        throw orderError || new Error("No se pudo crear el pedido.");
      }

      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: String(item.id),
        product_name: `${item.brand} ${item.name}`,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items);

      if (itemsError) {
        throw itemsError;
      }

      setCreatedOrder(order);

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

          <input
            style={styles.input}
            placeholder="Provincia"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          />

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
                <div key={item.id} style={styles.itemRow}>
                  <div>
                    <strong>
                      {item.quantity}x {item.brand} {item.name}
                    </strong>
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
                El envío se calcula y coordina según destino.
              </div>

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
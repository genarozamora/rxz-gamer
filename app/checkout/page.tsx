"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { trackStoreEvent } from "@/lib/store-tracking";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { SHIPPING_ORIGIN } from "@/lib/shipping";
import { ARGENTINE_PROVINCES as PROVINCES, validAddress, validArgentinePhone, validCity, validEmail, validFullName, validPostalCode } from "@/lib/checkout-validation";

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
export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("Córdoba");
  const [postalCode, setPostalCode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [copied, setCopied] = useState("");
  const trackedCheckout = useRef(false);
  const termsCheckbox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !user.is_anonymous) {
        setEmail(user.email || "");
      } else {
        if (user?.is_anonymous) await supabase.auth.signOut();
        router.replace("/login?next=/checkout");
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

  useEffect(() => {
    if (loading || cart.length === 0 || trackedCheckout.current) return;
    trackedCheckout.current = true;
    void trackStoreEvent("begin_checkout");
    trackMetaEvent("InitiateCheckout", {
      content_ids: cart.map((item) => String(item.id)),
      content_type: "product",
      currency: "ARS",
      num_items: cart.reduce((sum, item) => sum + item.quantity, 0),
      value: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    });
  }, [loading, cart]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    [cart]
  );

  async function createOrder() {
    if (creating) return;
    setMessage("");

    if (!acceptedTerms) {
      setTermsError(true);
      setMessage("Tenés que aceptar los Términos y condiciones y la Política de privacidad para confirmar el pedido.");
      window.setTimeout(() => termsCheckbox.current?.focus(), 0);
      return;
    }

    if (
      !fullName.trim() ||
      !email.trim() ||
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

    if (!validFullName(fullName)) {
      setMessage("Ingresá tu nombre y apellido reales, sin números ni caracteres inválidos.");
      return;
    }

    if (!validEmail(email)) {
      setMessage("Ingresá un email válido para recibir y recuperar la información del pedido.");
      return;
    }

    if (!validArgentinePhone(phone)) {
      setMessage("Ingresá un teléfono argentino válido de 10 dígitos, incluyendo código de área.");
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

    if (!validAddress(address)) {
      setMessage("Ingresá una dirección real con calle y altura.");
      return;
    }

    if (!validCity(city)) {
      setMessage("Ingresá una ciudad válida, sin números.");
      return;
    }

    if (!PROVINCES.includes(province)) {
      setMessage("Seleccioná una provincia válida.");
      return;
    }

    if (!validPostalCode(postalCode)) {
      setMessage("Ingresá un código postal argentino válido: 4 números o CPA completo.");
      return;
    }

    setCreating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.is_anonymous) {
        router.replace("/login?next=/checkout");
        return;
      }

      const { data: order, error: orderError } = await supabase
        .rpc("create_store_order", {
          p_accepted_terms: acceptedTerms,
          p_customer_name: fullName.trim(),
          p_customer_email: email.trim().toLowerCase(),
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

      void supabase.auth.getSession().then(({ data }) => data.session && fetch("/api/orders/notify", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ orderId: created.order_id }),
      }));



      localStorage.removeItem("rxz-cart");

      setCart([]);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Ocurrió un error al crear el pedido.");
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
              router.push("/cuenta")
            }
          >
            IR A MI CUENTA
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => router.push("/")}
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
          <div style={styles.checkoutSteps} aria-label="Progreso de compra">
            <span style={styles.activeStep}>1 · Datos</span>
            <span>2 · Confirmación</span>
            <span>3 · Pago</span>
          </div>
          <h1 style={styles.title}>Finalizar compra</h1>
          <p style={styles.intro}>Estás comprando con una cuenta verificada. Vas a ver el alias recién después de confirmar el pedido.</p>

          <h2>Datos de envío</h2>

          <input
            style={styles.input}
            placeholder="Nombre y apellido"
            aria-label="Nombre y apellido"
            autoComplete="name"
            maxLength={120}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            aria-label="Email para el pedido"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            disabled
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Teléfono"
            aria-label="Teléfono"
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Dirección"
            aria-label="Dirección de entrega"
            autoComplete="street-address"
            maxLength={250}
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Ciudad"
            aria-label="Ciudad"
            autoComplete="address-level2"
            maxLength={80}
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <select
            style={styles.input}
            aria-label="Provincia"
            autoComplete="address-level1"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            {PROVINCES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <input
            style={styles.input}
            placeholder="Código postal"
            aria-label="Código postal"
            autoComplete="postal-code"
            inputMode="text"
            maxLength={8}
            required
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
                Envío desde {SHIPPING_ORIGIN}. La empresa, modalidad, costo y plazo se confirman según el código postal antes del despacho. Nunca se cobrará un importe adicional sin informártelo.
              </div>

              <div style={styles.assuranceBox}>
                <strong>Compra acompañada por RXZ</strong>
                <span>🔒 Tus datos se usan únicamente para gestionar el pedido.</span>
                <span>📦 Revisás productos, colores y total antes de confirmar.</span>
                <span>💬 Podés consultar a soporte durante todo el proceso.</span>
              </div>

              <label style={{ ...styles.termsRow, ...(termsError ? styles.termsRowError : {}) }}>
                <input ref={termsCheckbox} type="checkbox" required checked={acceptedTerms} aria-invalid={termsError} aria-describedby={termsError ? "terms-error" : undefined} onChange={(event) => { setAcceptedTerms(event.target.checked); if (event.target.checked) setTermsError(false); }} />
                <span>Acepto los <a href="/legal/terminos" target="_blank" rel="noopener noreferrer">Términos y condiciones</a>, la <a href="/legal/privacidad" target="_blank" rel="noopener noreferrer">Política de privacidad</a> y las condiciones de <a href="/legal/envios" target="_blank" rel="noopener noreferrer">envío</a>. <strong>Podés abrir y leer cada documento antes de aceptar.</strong></span>
              </label>
              {termsError && <div id="terms-error" role="alert" style={styles.termsError}>⚠ Tenés que aceptar los términos y la privacidad para confirmar el pedido.</div>}

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
            onClick={() => router.push("/")}
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
  checkoutSteps: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
    marginBottom: 24,
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
  },
  activeStep: {
    color: "#34d399",
  },
  intro: {
    color: "#a7b2c4",
    lineHeight: 1.6,
    marginTop: -8,
    marginBottom: 24,
  },
  assuranceBox: {
    display: "grid",
    gap: 9,
    marginTop: 18,
    padding: 16,
    border: "1px solid rgba(52, 211, 153, .25)",
    borderRadius: 12,
    background: "rgba(6, 78, 59, .12)",
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 1.45,
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
    padding: 14,
    border: "1px solid #334155",
    borderRadius: 12,
  },

  termsRowError: {
    border: "2px solid #ef4444",
    background: "rgba(239,68,68,.12)",
    color: "#fecaca",
  },

  termsError: {
    marginTop: 8,
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: 900,
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

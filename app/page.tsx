"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  brand: string;
  name: string;
  category: string;
  subtitle: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  stock: number;

  weightKg: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;

  description: string;
  features: string[];
};

type CartItem = Product & {
  quantity: number;
};

type CustomerData = {
  name: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  notes: string;
};

const PAYMENT_ALIAS = "genaroperaltaz";

const WHATSAPP_NUMBER = "543512285839";
const WHATSAPP_DISPLAY = "351 228-5839";

const products: Product[] = [
  {
    id: 1,
    brand: "ATTACK SHARK",
    name: "X3 Wireless Gaming Mouse",
    category: "Mouse",
    subtitle: "PAW3395 • 26.000 DPI • 49 g",
    price: 64990,
    oldPrice: 74990,
    badge: "BEST SELLER",
    image: "/attack-shark-x3.webp",
    stock: 8,

    weightKg: 0.3,
    widthCm: 15,
    heightCm: 8,
    lengthCm: 20,

    description:
      "Mouse gamer inalámbrico ultraliviano con sensor PixArt PAW3395 y conectividad triple, pensado para gaming competitivo.",

    features: [
      "Sensor PixArt PAW3395",
      "Hasta 26.000 DPI",
      "Polling rate de hasta 1000 Hz",
      "Peso aproximado de 49 g",
      "Velocidad de seguimiento de hasta 650 IPS",
      "Aceleración de hasta 50 G",
      "Wireless 2.4 GHz",
      "Bluetooth",
      "USB-C",
      "Batería recargable",
      "Patines PTFE",
    ],
  },

  {
    id: 2,
    brand: "MCHOSE",
    name: "Ace 60 Pro",
    category: "Teclados",
    subtitle: "Hall Effect • Rapid Trigger • 8000 Hz",
    price: 89990,
    oldPrice: 109990,
    badge: "ESPORTS",
    image: "/mchose-ace60-pro.webp",
    stock: 5,

    weightKg: 0.9,
    widthCm: 35,
    heightCm: 8,
    lengthCm: 15,

    description:
      "Teclado gamer compacto con switches magnéticos Hall Effect, Rapid Trigger y polling rate de hasta 8000 Hz.",

    features: [
      "Formato compacto 60%",
      "Switches magnéticos Hall Effect",
      "Rapid Trigger",
      "Polling rate de hasta 8000 Hz",
      "Actuación configurable",
      "Switches magnéticos hot-swap",
      "RGB configurable",
      "Macros programables",
      "USB-C",
      "Software MCHOSE",
    ],
  },

  {
    id: 3,
    brand: "GAMESIR",
    name: "Nova 2 Lite",
    category: "Controles",
    subtitle: "Hall Effect • 1000 Hz • Multiplataforma",
    price: 69990,
    oldPrice: 79990,
    badge: "MULTIPLATAFORMA",
    image: "/gamesir-nova2-lite.png",
    stock: 7,

    weightKg: 0.6,
    widthCm: 20,
    heightCm: 12,
    lengthCm: 20,

    description:
      "Control inalámbrico multiplataforma con sticks Hall Effect, diseñado para ofrecer precisión, durabilidad y comodidad.",

    features: [
      "Sticks Hall Effect",
      "Gatillos Hall Effect",
      "Polling rate de hasta 1000 Hz",
      "Bluetooth",
      "Wireless mediante dongle",
      "USB-C",
      "Compatible con PC",
      "Compatible con Steam",
      "Compatible con Nintendo Switch",
      "Compatible con Android",
      "Botones programables",
      "Motores de vibración",
    ],
  },

  /*
  ==========================================================
  PARA AGREGAR OTRO PRODUCTO EN EL FUTURO
  ==========================================================

  Copiás un bloque como este y cambiás los datos:

  {
    id: 4,
    brand: "MARCA",
    name: "Nombre del producto",
    category: "Auriculares",
    subtitle: "Descripción corta",
    price: 99990,
    oldPrice: 119990,
    badge: "NUEVO",
    image: "/nombre-imagen.webp",
    stock: 10,

    weightKg: 0.5,
    widthCm: 20,
    heightCm: 15,
    lengthCm: 25,

    description: "Descripción completa.",

    features: [
      "Característica 1",
      "Característica 2",
      "Característica 3",
    ],
  },

  ==========================================================
  */
];

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function generateOrderNumber() {
  const now = new Date();

  const date =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `RXZ-${date}-${random}`;
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");

  const [receiptName, setReceiptName] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("Todos");

  const [shippingMessage, setShippingMessage] = useState("");

  const [cartLoaded, setCartLoaded] = useState(false);

  const [notification, setNotification] = useState("");

  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
    province: "",
    city: "",
    postalCode: "",
    address: "",
    notes: "",
  });

  const categories = useMemo(() => {
    return [
      "Todos",
      ...Array.from(
        new Set(products.map((product) => product.category))
      ),
    ];
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("rxz-gamer-cart");

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      localStorage.removeItem("rxz-gamer-cart");
    } finally {
      setCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;

    localStorage.setItem("rxz-gamer-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  useEffect(() => {
    if (!notification) return;

    const timer = window.setTimeout(() => setNotification(""), 3500);

    return () => window.clearTimeout(timer);
  }, [notification]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "Todos" ||
        product.category === category;

      const text =
        `${product.brand} ${product.name} ${product.subtitle}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [cart]
  );

  const productsTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [cart]
  );

  function addToCart(product: Product) {
    const currentQuantity =
      cart.find((item) => item.id === product.id)?.quantity ?? 0;

    if (currentQuantity >= product.stock) {
      setNotification(`No hay más unidades disponibles de ${product.name}.`);
      setCartOpen(true);
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setNotification(`✓ ${product.name} agregado al carrito`);
    setCartOpen(true);
  }

  function decreaseQuantity(productId: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseQuantity(productId: number) {
    setCart((current) =>
      current.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, item.stock),
            }
          : item
      )
    );
  }

  function removeFromCart(productId: number) {
    setCart((current) =>
      current.filter(
        (item) => item.id !== productId
      )
    );
  }

  function clearCart() {
    setCart([]);
    setNotification("Carrito vaciado.");
  }

  async function copyAlias() {
    try {
      await navigator.clipboard.writeText(PAYMENT_ALIAS);

      alert("Alias copiado.");
    } catch {
      alert(`Alias: ${PAYMENT_ALIAS}`);
    }
  }

  function handleCustomerChange(
    field: keyof CustomerData,
    value: string
  ) {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startCheckout() {
    if (cart.length === 0) return;

    setCartOpen(false);
    setCheckoutOpen(true);
    setOrderConfirmed(false);
  }

  function prepareOcaQuote() {
    if (!customer.postalCode.trim()) {
      setShippingMessage(
        "Ingresá primero el código postal de destino."
      );

      return;
    }

    setShippingMessage(
      "Destino cargado correctamente. La cotización automática de OCA se activará cuando OCA nos entregue las credenciales de e-Pak."
    );
  }

  function confirmOrder() {
    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.email.trim() ||
      !customer.province.trim() ||
      !customer.city.trim() ||
      !customer.postalCode.trim() ||
      !customer.address.trim()
    ) {
      alert("Completá todos los datos obligatorios.");

      return;
    }

    if (!receiptName) {
      alert("Adjuntá el comprobante de transferencia.");

      return;
    }

    const newOrderNumber = generateOrderNumber();

    setOrderNumber(newOrderNumber);
    setOrderConfirmed(true);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        fontFamily: "Arial, Helvetica, sans-serif",
        position: "relative",
        overflow: "hidden",
        background: "#02050c",
      }}
    >
      {/* FONDO DINÁMICO */}

      <div className="dynamic-background">
        <div className="grid-background" />

        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />

        <div className="light-beam beam-one" />
        <div className="light-beam beam-two" />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* HEADER */}

        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            padding: "17px 6%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            background: "rgba(2,5,12,.75)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <div
            style={{
              fontSize: "29px",
              fontWeight: 950,
              letterSpacing: "2px",
            }}
          >
            RXZ{" "}
            <span style={{ color: "#22c55e" }}>
              GAMER
            </span>
          </div>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "22px",
              flexWrap: "wrap",
            }}
          >
            <a href="#inicio" style={navStyle}>
              Inicio
            </a>

            <a href="#productos" style={navStyle}>
              Productos
            </a>

            <a href="#envios" style={navStyle}>
              Envíos
            </a>

            <a href="#contacto" style={navStyle}>
              Contacto
            </a>

            <button
              onClick={() => setCartOpen(true)}
              style={cartButton}
            >
              🛒 Carrito ({totalItems})
            </button>
          </nav>
        </header>

        {/* HERO */}

        <section
          id="inicio"
          style={{
            minHeight: "650px",
            padding: "80px 20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "950px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "9px 15px",
                borderRadius: "100px",
                background: "rgba(34,197,94,.1)",
                border: "1px solid rgba(34,197,94,.35)",
                color: "#5df38a",
                fontWeight: 900,
                letterSpacing: "3px",
                marginBottom: "26px",
              }}
            >
              GAMING • PERFORMANCE • TECNOLOGÍA
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(65px, 10vw, 130px)",
                fontWeight: 1000,
                lineHeight: 0.85,
                letterSpacing: "-5px",
              }}
            >
              RXZ
              <span
                style={{
                  color: "#22c55e",
                  textShadow: "0 0 45px rgba(34,197,94,.4)",
                }}
              >
                {" "}
                GAMER
              </span>
            </h1>

            <p
              style={{
                maxWidth: "760px",
                margin: "40px auto",
                color: "#a9b5ca",
                fontSize: "21px",
                lineHeight: 1.7,
              }}
            >
              Periféricos y tecnología gamer
              seleccionados por rendimiento,
              prestaciones y relación precio-calidad.
            </p>

            <a
              href="#productos"
              style={{
                display: "inline-block",
                padding: "18px 36px",
                background: "#22c55e",
                color: "#021006",
                textDecoration: "none",
                borderRadius: "11px",
                fontWeight: 950,
                boxShadow: "0 0 35px rgba(34,197,94,.25)",
              }}
            >
              EXPLORAR PRODUCTOS
            </a>
          </div>
        </section>

        {/* PRODUCTOS */}

        <section
          id="productos"
          style={{
            maxWidth: "1450px",
            margin: "0 auto",
            padding: "70px 5%",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                color: "#22c55e",
                fontWeight: 900,
                letterSpacing: "3px",
              }}
            >
              RXZ SELECTION
            </div>

            <h2
              style={{
                fontSize: "clamp(36px,5vw,52px)",
                margin: "10px 0",
              }}
            >
              Productos destacados
            </h2>
          </div>

          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto 25px",
            }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar mouse, teclado, control..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "17px 20px",
                borderRadius: "13px",
                border: "1px solid #28374f",
                background: "rgba(8,14,25,.85)",
                color: "white",
                fontSize: "16px",
                outline: "none",
                backdropFilter: "blur(15px)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "45px",
            }}
          >
            {categories.map((currentCategory) => (
              <button
                key={currentCategory}
                onClick={() => setCategory(currentCategory)}
                style={{
                  border:
                    category === currentCategory
                      ? "1px solid #22c55e"
                      : "1px solid #334155",

                  background:
                    category === currentCategory
                      ? "#22c55e"
                      : "rgba(15,23,42,.85)",

                  color:
                    category === currentCategory
                      ? "#021006"
                      : "#cbd5e1",

                  padding: "10px 17px",
                  borderRadius: "100px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                {currentCategory}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(290px, 1fr))",
              gap: "30px",
            }}
          >
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="product-card"
              >
                <div
                  onClick={() => setSelectedProduct(product)}
                  style={{
                    height: "330px",
                    padding: "25px",
                    background:
                      "radial-gradient(circle at center,#263a62,#0a101d 75%)",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <img
                    src={product.image}
                    alt={`${product.brand} ${product.name}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transition: "transform .3s ease",
                    }}
                  />

                  {product.badge && (
                    <div
                      style={{
                        position: "absolute",
                        top: "17px",
                        left: "17px",
                        background: "#22c55e",
                        color: "#021006",
                        fontSize: "11px",
                        fontWeight: 950,
                        padding: "8px 11px",
                        borderRadius: "7px",
                      }}
                    >
                      {product.badge}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "26px",
                  }}
                >
                  <div
                    style={{
                      color: "#22c55e",
                      fontSize: "12px",
                      letterSpacing: "2px",
                      fontWeight: 900,
                    }}
                  >
                    {product.brand}
                  </div>

                  <h3
                    style={{
                      fontSize: "25px",
                      margin: "9px 0",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      color: "#91a0b5",
                      minHeight: "25px",
                    }}
                  >
                    {product.subtitle}
                  </p>

                  {product.oldPrice && (
                    <div
                      style={{
                        marginTop: "22px",
                        color: "#64748b",
                        textDecoration: "line-through",
                      }}
                    >
                      {money(product.oldPrice)}
                    </div>
                  )}

                  <div
                    style={{
                      color: "#22c55e",
                      fontWeight: 950,
                      fontSize: "30px",
                      marginTop: "3px",
                      marginBottom: "23px",
                    }}
                  >
                    {money(product.price)}
                  </div>

                  <div
                    style={{
                      color: product.stock <= 5 ? "#facc15" : "#94a3b8",
                      fontSize: "13px",
                      fontWeight: 800,
                      margin: "-14px 0 18px",
                    }}
                  >
                    {product.stock <= 5
                      ? `Últimas ${product.stock} unidades`
                      : "Stock disponible"}
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    style={secondaryButton}
                  >
                    VER DETALLES
                  </button>

                  <button
                    onClick={() => addToCart(product)}
                    style={primaryButton}
                  >
                    AGREGAR AL CARRITO
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* BENEFICIOS */}

        <section
          id="envios"
          style={{
            maxWidth: "1250px",
            margin: "60px auto",
            padding: "30px 5%",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
          }}
        >
          <InfoBox
            icon="🚚"
            title="Envíos por OCA"
            text="Origen Villa Allende, Córdoba. Cotización automática próximamente."
          />

          <InfoBox
            icon="🏦"
            title="Transferencia"
            text={`Transferencias al alias ${PAYMENT_ALIAS}.`}
          />

          <InfoBox
            icon="🔐"
            title="Verificación"
            text="El pedido se aprueba cuando verificamos que el pago esté acreditado."
          />

          <InfoBox
            icon="🎮"
            title="Gaming seleccionado"
            text="Productos seleccionados por tecnología y prestaciones."
          />
        </section>

        {/* CONTACTO */}

        <section
          id="contacto"
          style={{
            marginTop: "80px",
            padding: "100px 20px",
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <div
            style={{
              color: "#22c55e",
              fontWeight: 900,
              letterSpacing: "3px",
              marginBottom: "10px",
            }}
          >
            CONTACTO RXZ
          </div>

          <h2
            style={{
              fontSize: "40px",
              marginBottom: "15px",
            }}
          >
            ¿Tenés alguna consulta?
          </h2>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "18px",
              lineHeight: 1.7,
              maxWidth: "650px",
              margin: "0 auto 28px",
            }}
          >
            Consultanos por productos, disponibilidad,
            medios de pago y envíos.
          </p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20RXZ%20Gamer,%20tengo%20una%20consulta.`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "17px 30px",
              background: "#22c55e",
              color: "#021006",
              textDecoration: "none",
              borderRadius: "11px",
              fontWeight: 900,
              fontSize: "17px",
              boxShadow: "0 0 30px rgba(34,197,94,.25)",
            }}
          >
            💬 WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </section>

        <footer
          style={{
            padding: "32px",
            borderTop: "1px solid rgba(255,255,255,.08)",
            textAlign: "center",
            color: "#56647a",
          }}
        >
          © 2026 RXZ Gamer
        </footer>
      </div>

      {/* WHATSAPP FLOTANTE */}

      {notification && (
        <div className="cart-notification" role="status" aria-live="polite">
          <span>{notification}</span>

          {cart.length > 0 && (
            <button
              onClick={() => {
                setNotification("");
                setCartOpen(true);
              }}
            >
              VER CARRITO
            </button>
          )}
        </div>
      )}

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20RXZ%20Gamer,%20tengo%20una%20consulta.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consultar por WhatsApp"
        title={`WhatsApp ${WHATSAPP_DISPLAY}`}
        className="whatsapp-floating"
      >
        💬
      </a>

      {/* MODAL PRODUCTO */}

      {selectedProduct && (
        <ModalOverlay
          onClose={() => setSelectedProduct(null)}
        >
          <button
            onClick={() => setSelectedProduct(null)}
            style={closeButton}
          >
            ×
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(320px,1fr))",
              gap: "45px",
            }}
          >
            <div
              style={{
                minHeight: "430px",
                padding: "25px",
                borderRadius: "18px",
                background:
                  "radial-gradient(circle,#293b60,#101827)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{
                  width: "100%",
                  maxHeight: "420px",
                  objectFit: "contain",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  color: "#22c55e",
                  fontWeight: 900,
                  letterSpacing: "2px",
                }}
              >
                {selectedProduct.brand}
              </div>

              <h2
                style={{
                  fontSize: "39px",
                  margin: "9px 0",
                }}
              >
                {selectedProduct.name}
              </h2>

              <p
                style={{
                  color: "#c1cada",
                  lineHeight: 1.75,
                }}
              >
                {selectedProduct.description}
              </p>

              <h3>Características</h3>

              <ul
                style={{
                  paddingLeft: "20px",
                  color: "#cbd5e1",
                  lineHeight: 1.9,
                }}
              >
                {selectedProduct.features.map((feature) => (
                  <li key={feature}>
                    {feature}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  color: "#22c55e",
                  fontWeight: 950,
                  fontSize: "35px",
                  marginTop: "20px",
                }}
              >
                {money(selectedProduct.price)}
              </div>

              <p
                style={{
                  color: selectedProduct.stock <= 5 ? "#facc15" : "#94a3b8",
                  fontWeight: 800,
                }}
              >
                {selectedProduct.stock <= 5
                  ? `Últimas ${selectedProduct.stock} unidades disponibles`
                  : `${selectedProduct.stock} unidades disponibles`}
              </p>

              <button
                onClick={() => addToCart(selectedProduct)}
                style={{
                  ...primaryButton,
                  marginTop: "20px",
                }}
              >
                AGREGAR AL CARRITO
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* CARRITO */}

      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.85)",
            zIndex: 300,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "470px",
              height: "100%",
              background: "rgba(8,14,25,.97)",
              padding: "30px",
              boxSizing: "border-box",
              overflowY: "auto",
              borderLeft: "1px solid #26334a",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>Tu carrito</h2>

              <button
                onClick={() => setCartOpen(false)}
                style={closeButtonNormal}
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "70px 15px" }}>
                <div style={{ fontSize: "58px" }}>🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
                  Agregá productos para ver aquí el resumen de tu compra.
                </p>
                <button
                  onClick={() => setCartOpen(false)}
                  style={{ ...primaryButton, marginTop: "15px" }}
                >
                  VER PRODUCTOS
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "18px 0",
                      borderBottom: "1px solid #253147",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "contain",
                          background: "#172033",
                          borderRadius: "8px",
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <strong>
                          {item.name}
                        </strong>

                        <div
                          style={{
                            marginTop: "8px",
                            color: "#22c55e",
                            fontWeight: 900,
                          }}
                        >
                          {money(item.price)}
                        </div>

                        <div
                          style={{
                            marginTop: "5px",
                            color: "#94a3b8",
                            fontSize: "13px",
                          }}
                        >
                          Subtotal: {money(item.price * item.quantity)}
                        </div>

                        <div
                          style={{
                            marginTop: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <button
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                            style={quantityButton}
                          >
                            −
                          </button>

                          <strong>
                            {item.quantity}
                          </strong>

                          <button
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                            disabled={item.quantity >= item.stock}
                            title={
                              item.quantity >= item.stock
                                ? "Alcanzaste el stock disponible"
                                : "Agregar una unidad"
                            }
                            style={{
                              ...quantityButton,
                              opacity: item.quantity >= item.stock ? 0.4 : 1,
                            }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                          style={{
                            marginTop: "10px",
                            border: "none",
                            background: "transparent",
                            color: "#f87171",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "23px",
                    fontWeight: 900,
                  }}
                >
                  <span>Productos</span>

                  <span
                    style={{
                      color: "#22c55e",
                    }}
                  >
                    {money(productsTotal)}
                  </span>
                </div>

                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  El envío OCA se agregará según el
                  código postal del comprador.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    onClick={() => setCartOpen(false)}
                    style={{ ...secondaryButton, marginBottom: 0 }}
                  >
                    SEGUIR COMPRANDO
                  </button>

                  <button
                    onClick={clearCart}
                    style={{
                      ...secondaryButton,
                      marginBottom: 0,
                      color: "#fca5a5",
                    }}
                  >
                    VACIAR CARRITO
                  </button>
                </div>

                <button
                  onClick={startCheckout}
                  style={{
                    ...primaryButton,
                    marginTop: "20px",
                    fontSize: "16px",
                  }}
                >
                  FINALIZAR COMPRA
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT */}

      {checkoutOpen && (
        <ModalOverlay
          onClose={() => setCheckoutOpen(false)}
        >
          <button
            onClick={() => setCheckoutOpen(false)}
            style={closeButton}
          >
            ×
          </button>

          {!orderConfirmed ? (
            <>
              <h2
                style={{
                  fontSize: "35px",
                  marginTop: 0,
                }}
              >
                Finalizar compra
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.7,
                }}
              >
                Completá tus datos para calcular el envío
                y preparar el pedido.
              </p>

              <h3>Datos del comprador</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(250px,1fr))",
                  gap: "15px",
                }}
              >
                <Input
                  label="Nombre y apellido *"
                  value={customer.name}
                  onChange={(value) =>
                    handleCustomerChange("name", value)
                  }
                />

                <Input
                  label="Teléfono / WhatsApp *"
                  value={customer.phone}
                  onChange={(value) =>
                    handleCustomerChange("phone", value)
                  }
                />

                <Input
                  label="Email *"
                  value={customer.email}
                  onChange={(value) =>
                    handleCustomerChange("email", value)
                  }
                />

                <Input
                  label="Provincia *"
                  value={customer.province}
                  onChange={(value) =>
                    handleCustomerChange("province", value)
                  }
                />

                <Input
                  label="Ciudad / Localidad *"
                  value={customer.city}
                  onChange={(value) =>
                    handleCustomerChange("city", value)
                  }
                />

                <Input
                  label="Código postal *"
                  value={customer.postalCode}
                  onChange={(value) => {
                    handleCustomerChange("postalCode", value);
                    setShippingMessage("");
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "15px",
                }}
              >
                <Input
                  label="Dirección completa *"
                  value={customer.address}
                  onChange={(value) =>
                    handleCustomerChange("address", value)
                  }
                />
              </div>

              {/* OCA */}

              <div
                style={{
                  marginTop: "30px",
                  padding: "25px",
                  background: "rgba(15,23,42,.85)",
                  border: "1px solid #29374d",
                  borderRadius: "15px",
                }}
              >
                <div
                  style={{
                    color: "#22c55e",
                    fontWeight: 900,
                    letterSpacing: "2px",
                  }}
                >
                  ENVÍO OCA
                </div>

                <h3
                  style={{
                    marginBottom: "7px",
                  }}
                >
                  Calcular envío
                </h3>

                <p
                  style={{
                    color: "#94a3b8",
                    lineHeight: 1.6,
                  }}
                >
                  Origen: Villa Allende, Córdoba.
                </p>

                <button
                  onClick={prepareOcaQuote}
                  style={secondaryButton}
                >
                  CALCULAR ENVÍO
                </button>

                {shippingMessage && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "14px",
                      borderRadius: "9px",
                      background: "#172033",
                      color: "#cbd5e1",
                      lineHeight: 1.6,
                    }}
                  >
                    {shippingMessage}
                  </div>
                )}
              </div>

              {/* PAGO */}

              <div
                style={{
                  margin: "30px 0",
                  padding: "25px",
                  borderRadius: "16px",
                  background: "rgba(17,24,39,.9)",
                  border: "1px solid #26334a",
                }}
              >
                <div
                  style={{
                    color: "#94a3b8",
                  }}
                >
                  Productos
                </div>

                <div
                  style={{
                    fontSize: "30px",
                    color: "#22c55e",
                    fontWeight: 950,
                  }}
                >
                  {money(productsTotal)}
                </div>

                <p
                  style={{
                    color: "#facc15",
                    lineHeight: 1.6,
                  }}
                >
                  El costo de OCA todavía no está incluido
                  hasta activar las credenciales e-Pak.
                </p>

                <div
                  style={{
                    marginTop: "25px",
                    color: "#94a3b8",
                  }}
                >
                  Alias para transferencia
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "8px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      padding: "14px",
                      borderRadius: "9px",
                      background: "#060b13",
                      border: "1px solid #334155",
                      fontSize: "20px",
                      fontWeight: 900,
                    }}
                  >
                    {PAYMENT_ALIAS}
                  </div>

                  <button
                    onClick={copyAlias}
                    style={{
                      border: "none",
                      background: "#22c55e",
                      color: "#021006",
                      padding: "0 18px",
                      borderRadius: "9px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    COPIAR
                  </button>
                </div>
              </div>

              <label
                style={{
                  display: "block",
                  marginTop: "18px",
                  color: "#cbd5e1",
                  fontWeight: 700,
                }}
              >
                Observaciones
              </label>

              <textarea
                value={customer.notes}
                onChange={(event) =>
                  handleCustomerChange(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Departamento, piso, referencias para la entrega..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  marginTop: "8px",
                  boxSizing: "border-box",
                  background: "#060b13",
                  border: "1px solid #334155",
                  borderRadius: "9px",
                  color: "white",
                  padding: "13px",
                }}
              />

              <h3
                style={{
                  marginTop: "30px",
                }}
              >
                Comprobante de transferencia
              </h3>

              <div
                style={{
                  padding: "22px",
                  borderRadius: "12px",
                  border: "1px dashed #475569",
                  background: "#090f19",
                }}
              >
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      setReceiptName(file.name);
                    }
                  }}
                  style={{
                    width: "100%",
                    color: "#cbd5e1",
                  }}
                />

                {receiptName && (
                  <p
                    style={{
                      color: "#22c55e",
                    }}
                  >
                    Archivo: {receiptName}
                  </p>
                )}
              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "17px",
                  background: "#2a2107",
                  border: "1px solid #6b5412",
                  borderRadius: "10px",
                  color: "#facc15",
                  lineHeight: 1.6,
                }}
              >
                El pedido se confirma solamente cuando la
                transferencia se encuentra efectivamente
                acreditada.
              </div>

              <button
                onClick={confirmOrder}
                style={{
                  ...primaryButton,
                  marginTop: "25px",
                  fontSize: "17px",
                }}
              >
                ENVIAR PEDIDO
              </button>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 10px",
              }}
            >
              <div
                style={{
                  fontSize: "70px",
                }}
              >
                ✅
              </div>

              <h2
                style={{
                  fontSize: "36px",
                }}
              >
                Pedido recibido
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "18px",
                }}
              >
                Pedido pendiente de verificación.
              </p>

              <div
                style={{
                  maxWidth: "500px",
                  margin: "30px auto",
                  padding: "25px",
                  borderRadius: "14px",
                  background: "#111827",
                  border: "1px solid #26334a",
                }}
              >
                <div
                  style={{
                    color: "#94a3b8",
                  }}
                >
                  Número de pedido
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "28px",
                    color: "#22c55e",
                    fontWeight: 900,
                  }}
                >
                  {orderNumber}
                </div>

                <div
                  style={{
                    marginTop: "22px",
                    color: "#facc15",
                    fontWeight: 900,
                  }}
                >
                  PENDIENTE DE VERIFICACIÓN
                </div>
              </div>

              <button
                onClick={() => {
                  setCheckoutOpen(false);
                  setCart([]);
                  setReceiptName("");
                  setShippingMessage("");
                }}
                style={{
                  ...primaryButton,
                  maxWidth: "400px",
                }}
              >
                VOLVER A LA TIENDA
              </button>
            </div>
          )}
        </ModalOverlay>
      )}

      {/* ANIMACIONES */}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #02050c;
        }

        .dynamic-background {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .grid-background {
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.018) 1px,
              transparent 1px
            );

          background-size: 60px 60px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 95%
            );
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.25;
        }

        .orb-one {
          width: 520px;
          height: 520px;
          background: #22c55e;
          left: -160px;
          top: 5%;
          animation: floatOne 18s ease-in-out infinite alternate;
        }

        .orb-two {
          width: 650px;
          height: 650px;
          background: #2563eb;
          right: -220px;
          top: 25%;
          animation: floatTwo 22s ease-in-out infinite alternate;
        }

        .orb-three {
          width: 500px;
          height: 500px;
          background: #7c3aed;
          left: 35%;
          bottom: -300px;
          opacity: 0.15;
          animation: floatThree 25s ease-in-out infinite alternate;
        }

        .light-beam {
          position: absolute;
          width: 700px;
          height: 2px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(34,197,94,.5),
              transparent
            );
          filter: blur(2px);
        }

        .beam-one {
          top: 20%;
          left: -500px;
          animation: beamMove 14s linear infinite;
        }

        .beam-two {
          top: 72%;
          left: -700px;
          animation: beamMove 19s linear infinite;
          animation-delay: 4s;
        }

        .product-card {
          overflow: hidden;
          border-radius: 20px;

          background:
            linear-gradient(
              180deg,
              rgba(17,24,39,.94),
              rgba(7,12,21,.96)
            );

          border:
            1px solid rgba(71,85,105,.55);

          box-shadow:
            0 25px 65px rgba(0,0,0,.35);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .product-card:hover {
          transform: translateY(-7px);
          border-color: rgba(34,197,94,.55);

          box-shadow:
            0 32px 80px rgba(0,0,0,.48);
        }

        .product-card:hover img {
          transform: scale(1.05);
        }

        .whatsapp-floating {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 500;

          width: 64px;
          height: 64px;

          border-radius: 50%;

          background: #22c55e;
          color: #021006;

          display: flex;
          justify-content: center;
          align-items: center;

          text-decoration: none;
          font-size: 29px;

          border: 2px solid rgba(255,255,255,.15);

          box-shadow:
            0 10px 40px rgba(34,197,94,.4);

          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .whatsapp-floating:hover {
          transform: scale(1.1);

          box-shadow:
            0 12px 50px rgba(34,197,94,.6);
        }

        .cart-notification {
          position: fixed;
          top: 92px;
          right: 24px;
          z-index: 650;
          width: min(420px, calc(100vw - 48px));
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 17px 18px;
          border-radius: 13px;
          border: 1px solid rgba(34,197,94,.55);
          background: rgba(8,14,25,.97);
          color: #e2e8f0;
          box-shadow: 0 20px 55px rgba(0,0,0,.48);
          backdrop-filter: blur(18px);
          animation: notificationIn .25s ease-out;
          font-weight: 800;
        }

        .cart-notification button {
          flex-shrink: 0;
          border: 0;
          border-radius: 8px;
          padding: 10px 12px;
          background: #22c55e;
          color: #021006;
          cursor: pointer;
          font-size: 12px;
          font-weight: 950;
        }

        @keyframes notificationIn {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 700px) {
          .cart-notification {
            top: auto;
            right: 14px;
            bottom: 94px;
            width: calc(100vw - 28px);
          }

          .whatsapp-floating {
            right: 16px;
            bottom: 16px;
            width: 56px;
            height: 56px;
          }
        }

        @keyframes floatOne {
          from {
            transform: translate(0,0) scale(1);
          }

          to {
            transform:
              translate(280px,180px)
              scale(1.18);
          }
        }

        @keyframes floatTwo {
          from {
            transform: translate(0,0) scale(1);
          }

          to {
            transform:
              translate(-300px,180px)
              scale(.85);
          }
        }

        @keyframes floatThree {
          from {
            transform: translate(0,0);
          }

          to {
            transform:
              translate(-200px,-250px);
          }
        }

        @keyframes beamMove {
          from {
            transform: translateX(0);
          }

          to {
            transform:
              translateX(calc(100vw + 1400px));
          }
        }
      `}</style>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      style={{
        display: "block",
        color: "#cbd5e1",
        fontWeight: 700,
      }}
    >
      {label}

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          width: "100%",
          marginTop: "8px",
          boxSizing: "border-box",
          background: "#060b13",
          border: "1px solid #334155",
          borderRadius: "9px",
          color: "white",
          padding: "13px",
          outline: "none",
        }}
      />
    </label>
  );
}

function InfoBox({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "rgba(13,20,33,.85)",
        backdropFilter: "blur(15px)",
        border: "1px solid #223047",
        padding: "25px",
        borderRadius: "14px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "30px" }}>
        {icon}
      </div>

      <h3>{title}</h3>

      <p
        style={{
          color: "#8796ad",
          lineHeight: 1.6,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(0,0,0,.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: "100%",
          maxWidth: "1050px",
          maxHeight: "92vh",
          overflowY: "auto",
          position: "relative",
          padding: "40px",
          boxSizing: "border-box",
          borderRadius: "22px",
          background:
            "linear-gradient(145deg,#111827,#060a12)",
          border: "1px solid #29364d",
          boxShadow: "0 40px 100px rgba(0,0,0,.6)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const navStyle: React.CSSProperties = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontWeight: 600,
};

const cartButton: React.CSSProperties = {
  border: "none",
  background: "#22c55e",
  color: "#021006",
  borderRadius: "9px",
  padding: "11px 17px",
  fontWeight: 900,
  cursor: "pointer",
};

const primaryButton: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "#22c55e",
  color: "#021006",
  padding: "14px",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: 900,
};

const secondaryButton: React.CSSProperties = {
  width: "100%",
  border: "1px solid #334155",
  background: "#172033",
  color: "white",
  padding: "13px",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: 800,
  marginBottom: "11px",
};

const closeButton: React.CSSProperties = {
  position: "absolute",
  right: "20px",
  top: "20px",
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  border: "none",
  background: "#253249",
  color: "white",
  fontSize: "23px",
  cursor: "pointer",
  zIndex: 10,
};

const closeButtonNormal: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  border: "none",
  background: "#253249",
  color: "white",
  fontSize: "23px",
  cursor: "pointer",
};

const quantityButton: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "7px",
  border: "1px solid #334155",
  background: "#172033",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

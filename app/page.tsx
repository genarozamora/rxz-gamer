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
  description: string;
  features: string[];
};

type CartItem = Product & {
  quantity: number;
};

const WHATSAPP = "543512285839";
const ALIAS = "genaroperaltaz";

const PRODUCTS: Product[] = [
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
    description:
      "Mouse gamer inalámbrico ultraliviano pensado para gaming competitivo, precisión y respuesta rápida.",
    features: [
      "Sensor PixArt PAW3395",
      "Hasta 26.000 DPI",
      "Polling rate de hasta 1000 Hz",
      "Peso aproximado de 49 g",
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
    description:
      "Teclado gamer compacto con switches magnéticos Hall Effect, Rapid Trigger y altas prestaciones para gaming competitivo.",
    features: [
      "Formato compacto 60%",
      "Switches magnéticos Hall Effect",
      "Rapid Trigger",
      "Polling rate de hasta 8000 Hz",
      "Actuación configurable",
      "RGB configurable",
      "Macros programables",
      "USB-C",
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
    description:
      "Control inalámbrico multiplataforma diseñado para ofrecer precisión, durabilidad y comodidad.",
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
    ],
  },
];

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rxz-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("rxz-cart", JSON.stringify(cart));
    }
  }, [cart, loaded]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const categories = [
    "Todos",
    ...Array.from(new Set(PRODUCTS.map((p) => p.category))),
  ];

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const categoryOK = category === "Todos" || p.category === category;

      const text = `${p.brand} ${p.name} ${p.subtitle}`.toLowerCase();

      return categoryOK && text.includes(search.toLowerCase());
    });
  }, [search, category]);

  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  const total = cart.reduce(
    (a, b) => a + b.price * b.quantity,
    0
  );

  function add(product: Product) {
    const existing = cart.find((p) => p.id === product.id);

    if (existing && existing.quantity >= product.stock) {
      setToast("Alcanzaste el stock disponible.");
      return;
    }

    setCart((current) => {
      const item = current.find((p) => p.id === product.id);

      if (item) {
        return current.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setToast(`✓ ${product.name} agregado al carrito`);
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;

          return {
            ...item,
            quantity: Math.min(
              item.stock,
              Math.max(0, item.quantity + amount)
            ),
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function remove(id: number) {
    setCart((current) => current.filter((p) => p.id !== id));
  }

  function checkoutWhatsApp() {
    const products = cart
      .map(
        (p) =>
          `${p.quantity}x ${p.brand} ${p.name} - ${money(
            p.price * p.quantity
          )}`
      )
      .join("\n");

    const message = encodeURIComponent(
      `Hola RXZ Gamer, quiero realizar este pedido:\n\n${products}\n\nTotal productos: ${money(
        total
      )}\n\nQuiero coordinar pago y envío por OCA.`
    );

    window.open(`https://wa.me/${WHATSAPP}?text=${message}`, "_blank");
  }

  return (
    <main>
      <div className="background">
        <div className="grid" />
        <div className="glow glow1" />
        <div className="glow glow2" />
      </div>

      <div className="announcement">
        🚚 ENVÍOS A TODO EL PAÍS · OCA · ATENCIÓN PERSONALIZADA
      </div>

      <header>
        <a href="#inicio" className="logo">
          RXZ <span>GAMER</span>
        </a>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#beneficios">Envíos</a>
          <a href="#contacto">Contacto</a>

          <button className="cartBtn" onClick={() => setCartOpen(true)}>
            🛒
            <span>Carrito</span>

            {totalItems > 0 && (
              <b className="counter">{totalItems}</b>
            )}
          </button>
        </nav>
      </header>

      <section id="inicio" className="hero">
        <div className="heroBadge">
          GAMING · PERFORMANCE · TECNOLOGÍA
        </div>

        <h1>
          EQUIPATE PARA
          <br />
          <span>JUGAR MEJOR.</span>
        </h1>

        <p>
          Hardware y periféricos gamer seleccionados por
          rendimiento, tecnología y relación precio-calidad.
        </p>

        <div className="heroButtons">
          <a href="#productos" className="primary">
            VER PRODUCTOS
          </a>

          <a
            className="secondary"
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
          >
            CONSULTAR POR WHATSAPP
          </a>
        </div>

        <div className="trust">
          <div>
            <strong>🚚</strong>
            <span>
              <b>Envíos nacionales</b>
              <small>Por OCA</small>
            </span>
          </div>

          <div>
            <strong>🔒</strong>
            <span>
              <b>Compra segura</b>
              <small>Pago verificado</small>
            </span>
          </div>

          <div>
            <strong>💬</strong>
            <span>
              <b>Atención directa</b>
              <small>Por WhatsApp</small>
            </span>
          </div>
        </div>
      </section>

      <section id="productos" className="products">
        <div className="sectionHead">
          <span>RXZ SELECTION</span>
          <h2>Productos destacados</h2>
          <p>
            Tecnología seleccionada para mejorar tu setup.
          </p>
        </div>

        <div className="tools">
          <div className="search">
            🔎
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
            />
          </div>

          <div className="categories">
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="productGrid">
          {filtered.map((product) => {
            const discount = product.oldPrice
              ? Math.round(
                  (1 - product.price / product.oldPrice) * 100
                )
              : 0;

            return (
              <article className="card" key={product.id}>
                <div
                  className="imageBox"
                  onClick={() => setSelected(product)}
                >
                  {product.badge && (
                    <span className="badge">{product.badge}</span>
                  )}

                  {discount > 0 && (
                    <span className="discount">
                      -{discount}%
                    </span>
                  )}

                  <img
                    src={product.image}
                    alt={`${product.brand} ${product.name}`}
                  />
                </div>

                <div className="cardBody">
                  <div className="brand">{product.brand}</div>

                  <h3>{product.name}</h3>

                  <p>{product.subtitle}</p>

                  <div className="stock">
                    <span className="stockDot" />
                    {product.stock > 5
                      ? "Stock disponible"
                      : `Últimas ${product.stock} unidades`}
                  </div>

                  {product.oldPrice && (
                    <div className="old">
                      {money(product.oldPrice)}
                    </div>
                  )}

                  <div className="price">
                    {money(product.price)}
                  </div>

                  <small className="transfer">
                    Precio especial por transferencia
                  </small>

                  <button
                    className="details"
                    onClick={() => setSelected(product)}
                  >
                    VER DETALLES
                  </button>

                  <button
                    className="buy"
                    onClick={() => add(product)}
                  >
                    AGREGAR AL CARRITO
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="beneficios" className="benefits">
        <div>
          <span>🚚</span>
          <h3>Envíos a todo el país</h3>
          <p>
            Despachamos desde Villa Allende, Córdoba, mediante
            OCA.
          </p>
        </div>

        <div>
          <span>🏦</span>
          <h3>Transferencia bancaria</h3>
          <p>
            Precio especial abonando mediante transferencia.
          </p>
        </div>

        <div>
          <span>🔐</span>
          <h3>Pago verificado</h3>
          <p>
            Confirmamos cada pedido luego de verificar la
            acreditación.
          </p>
        </div>

        <div>
          <span>🎮</span>
          <h3>Selección RXZ</h3>
          <p>
            Elegimos productos por rendimiento y relación
            precio-calidad.
          </p>
        </div>
      </section>

      <section className="payment">
        <span>COMPRA SIMPLE</span>
        <h2>¿Cómo comprar?</h2>

        <div className="steps">
          <div>
            <b>01</b>
            <h3>Elegí</h3>
            <p>Agregá tus productos al carrito.</p>
          </div>

          <div>
            <b>02</b>
            <h3>Confirmá</h3>
            <p>Revisá cantidades y total.</p>
          </div>

          <div>
            <b>03</b>
            <h3>Pagá</h3>
            <p>
              Transferí al alias <strong>{ALIAS}</strong>.
            </p>
          </div>

          <div>
            <b>04</b>
            <h3>Recibí</h3>
            <p>Coordinamos tu envío por OCA.</p>
          </div>
        </div>
      </section>

      <section id="contacto" className="contact">
        <span>¿NECESITÁS AYUDA?</span>

        <h2>Estamos para ayudarte.</h2>

        <p>
          Consultanos sobre productos, stock, pagos o envíos.
        </p>

        <a
          href={`https://wa.me/${WHATSAPP}?text=Hola%20RXZ%20Gamer,%20tengo%20una%20consulta.`}
          target="_blank"
        >
          💬 HABLAR POR WHATSAPP
        </a>
      </section>

      <footer>
        <div className="footerLogo">
          RXZ <span>GAMER</span>
        </div>

        <p>
          Gaming · Performance · Tecnología
        </p>

        <small>
          © 2026 RXZ Gamer · Todos los derechos reservados.
        </small>
      </footer>

      <a
        className="whatsapp"
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        aria-label="WhatsApp RXZ Gamer"
      >
        💬
      </a>

      {toast && (
        <div className="toast">
          <span>{toast}</span>

          <button onClick={() => setCartOpen(true)}>
            VER CARRITO
          </button>
        </div>
      )}

      {selected && (
        <div
          className="overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>

            <div className="modalGrid">
              <div className="modalImage">
                <img
                  src={selected.image}
                  alt={selected.name}
                />
              </div>

              <div>
                <div className="brand">
                  {selected.brand}
                </div>

                <h2>{selected.name}</h2>

                <p className="description">
                  {selected.description}
                </p>

                <h4>Características principales</h4>

                <ul>
                  {selected.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>

                <div className="modalPrice">
                  {money(selected.price)}
                </div>

                <button
                  className="buy"
                  onClick={() => {
                    add(selected);
                    setSelected(null);
                  }}
                >
                  AGREGAR AL CARRITO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div
          className="overlay cartOverlay"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cartHeader">
              <div>
                <small>RXZ GAMER</small>
                <h2>Tu carrito</h2>
              </div>

              <button
                className="closeNormal"
                onClick={() => setCartOpen(false)}
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty">
                <div>🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p>
                  Agregá un producto para comenzar tu compra.
                </p>

                <button
                  className="buy"
                  onClick={() => setCartOpen(false)}
                >
                  VER PRODUCTOS
                </button>
              </div>
            ) : (
              <>
                <div className="cartItems">
                  {cart.map((item) => (
                    <div className="cartItem" key={item.id}>
                      <img src={item.image} alt={item.name} />

                      <div className="cartInfo">
                        <b>{item.name}</b>

                        <span>{money(item.price)}</span>

                        <div className="quantity">
                          <button
                            onClick={() =>
                              changeQuantity(item.id, -1)
                            }
                          >
                            −
                          </button>

                          <strong>{item.quantity}</strong>

                          <button
                            onClick={() =>
                              changeQuantity(item.id, 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="remove"
                          onClick={() => remove(item.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary">
                  <div>
                    <span>Productos</span>
                    <strong>{totalItems}</strong>
                  </div>

                  <div className="total">
                    <span>Total</span>
                    <strong>{money(total)}</strong>
                  </div>

                  <small>
                    El costo del envío se coordina según
                    destino.
                  </small>
                </div>

                <button
                  className="buy checkout"
                  onClick={checkoutWhatsApp}
                >
                  CONTINUAR COMPRA POR WHATSAPP
                </button>

                <button
                  className="continue"
                  onClick={() => setCartOpen(false)}
                >
                  SEGUIR COMPRANDO
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #03060b;
          color: white;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        main {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #03060b;
        }

        .background {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size: 65px 65px;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(130px);
          opacity: .17;
        }

        .glow1 {
          width: 650px;
          height: 650px;
          background: #16a34a;
          top: 50px;
          left: -300px;
          animation: move1 15s infinite alternate ease-in-out;
        }

        .glow2 {
          width: 750px;
          height: 750px;
          background: #1d4ed8;
          right: -350px;
          top: 350px;
          animation: move2 20s infinite alternate ease-in-out;
        }

        .announcement,
        header,
        section,
        footer {
          position: relative;
          z-index: 2;
        }

        .announcement {
          background: #22c55e;
          color: #031008;
          text-align: center;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1.8px;
          padding: 9px 15px;
        }

        header {
          min-height: 76px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(3,6,11,.84);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .logo,
        .footerLogo {
          color: white;
          text-decoration: none;
          font-weight: 1000;
          font-size: 26px;
          letter-spacing: 1px;
        }

        .logo span,
        .footerLogo span {
          color: #22c55e;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        nav > a {
          color: #aab5c7;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition: .2s;
        }

        nav > a:hover {
          color: white;
        }

        .cartBtn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(34,197,94,.45);
          border-radius: 9px;
          padding: 10px 14px;
          color: white;
          background: rgba(34,197,94,.08);
          font-weight: 800;
        }

        .counter {
          position: absolute;
          top: -9px;
          right: -9px;
          background: #22c55e;
          color: #031008;
          min-width: 22px;
          height: 22px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          font-size: 11px;
        }

        .hero {
          min-height: 760px;
          padding: 130px 20px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .heroBadge {
          color: #64f18d;
          border: 1px solid rgba(34,197,94,.3);
          background: rgba(34,197,94,.08);
          padding: 9px 15px;
          border-radius: 50px;
          font-size: 11px;
          letter-spacing: 2.5px;
          font-weight: 900;
        }

        .hero h1 {
          margin: 28px 0 0;
          max-width: 1100px;
          font-size: clamp(55px, 8vw, 105px);
          line-height: .91;
          letter-spacing: -5px;
          font-weight: 1000;
        }

        .hero h1 span {
          color: #22c55e;
          text-shadow: 0 0 55px rgba(34,197,94,.3);
        }

        .hero > p {
          max-width: 720px;
          color: #9aa7bb;
          font-size: 19px;
          line-height: 1.7;
          margin: 32px auto;
        }

        .heroButtons {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .primary,
        .secondary {
          text-decoration: none;
          padding: 16px 25px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 950;
        }

        .primary {
          background: #22c55e;
          color: #031008;
          box-shadow: 0 0 35px rgba(34,197,94,.25);
        }

        .secondary {
          color: white;
          border: 1px solid #344154;
          background: rgba(15,23,42,.75);
        }

        .trust {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 15px;
          width: min(850px,100%);
          margin-top: 70px;
        }

        .trust > div {
          display: flex;
          align-items: center;
          text-align: left;
          gap: 13px;
          padding: 18px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          background: rgba(12,18,29,.65);
        }

        .trust strong {
          font-size: 24px;
        }

        .trust span {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .trust b {
          font-size: 13px;
        }

        .trust small {
          color: #7e8ca1;
        }

        .products {
          max-width: 1450px;
          margin: auto;
          padding: 90px 5%;
        }

        .sectionHead {
          text-align: center;
          margin-bottom: 40px;
        }

        .sectionHead > span,
        .payment > span,
        .contact > span {
          color: #22c55e;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 3px;
        }

        .sectionHead h2,
        .payment h2,
        .contact h2 {
          font-size: clamp(35px,5vw,55px);
          margin: 10px 0;
        }

        .sectionHead p {
          color: #8794a8;
        }

        .tools {
          max-width: 900px;
          margin: 0 auto 45px;
        }

        .search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(9,14,24,.9);
          border: 1px solid #29364a;
          padding: 0 17px;
          border-radius: 12px;
        }

        .search input {
          flex: 1;
          border: 0;
          outline: 0;
          padding: 16px 5px;
          background: transparent;
          color: white;
        }

        .categories {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 15px;
        }

        .categories button {
          border: 1px solid #29364a;
          border-radius: 50px;
          background: rgba(15,23,42,.8);
          color: #9eabbe;
          padding: 9px 15px;
          font-size: 12px;
          font-weight: 800;
        }

        .categories .active {
          background: #22c55e;
          color: #031008;
          border-color: #22c55e;
        }

        .productGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(290px,1fr));
          gap: 25px;
        }

        .card {
          overflow: hidden;
          border: 1px solid rgba(72,85,105,.45);
          border-radius: 18px;
          background: linear-gradient(180deg,rgba(17,24,39,.95),rgba(6,10,17,.98));
          transition: .25s;
          box-shadow: 0 25px 60px rgba(0,0,0,.25);
        }

        .card:hover {
          transform: translateY(-6px);
          border-color: rgba(34,197,94,.45);
          box-shadow: 0 30px 80px rgba(0,0,0,.45);
        }

        .imageBox {
          height: 320px;
          padding: 30px;
          position: relative;
          cursor: pointer;
          background: radial-gradient(circle,#233556,#090f19 70%);
        }

        .imageBox img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: .3s;
        }

        .card:hover .imageBox img {
          transform: scale(1.05);
        }

        .badge,
        .discount {
          position: absolute;
          z-index: 2;
          top: 15px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 950;
          padding: 7px 9px;
        }

        .badge {
          left: 15px;
          background: #22c55e;
          color: #031008;
        }

        .discount {
          right: 15px;
          background: #ef4444;
        }

        .cardBody {
          padding: 24px;
        }

        .brand {
          color: #22c55e;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .card h3 {
          margin: 8px 0;
          font-size: 23px;
        }

        .cardBody > p {
          color: #8897ab;
          min-height: 40px;
          line-height: 1.5;
        }

        .stock {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #a7b3c5;
          font-size: 12px;
          margin: 18px 0;
        }

        .stockDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
        }

        .old {
          color: #66758b;
          text-decoration: line-through;
          font-size: 13px;
        }

        .price {
          color: #22c55e;
          font-size: 29px;
          font-weight: 950;
          margin: 3px 0;
        }

        .transfer {
          color: #77869b;
        }

        .details,
        .buy {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          font-weight: 900;
        }

        .details {
          margin-top: 22px;
          border: 1px solid #344154;
          background: #131d2c;
          color: white;
        }

        .buy {
          margin-top: 9px;
          border: 0;
          background: #22c55e;
          color: #031008;
        }

        .benefits {
          max-width: 1250px;
          margin: 60px auto;
          padding: 0 5%;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
        }

        .benefits > div {
          padding: 28px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          background: rgba(12,18,29,.7);
        }

        .benefits > div > span {
          font-size: 29px;
        }

        .benefits h3 {
          margin-bottom: 7px;
        }

        .benefits p {
          color: #8190a5;
          line-height: 1.6;
          font-size: 14px;
        }

        .payment {
          max-width: 1250px;
          margin: 120px auto;
          padding: 0 5%;
          text-align: center;
        }

        .steps {
          margin-top: 45px;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
          text-align: left;
        }

        .steps > div {
          padding: 27px;
          background: rgba(11,17,27,.8);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
        }

        .steps b {
          color: #22c55e;
          font-size: 25px;
        }

        .steps p {
          color: #8190a5;
          line-height: 1.6;
        }

        .contact {
          padding: 120px 20px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,.07);
          border-bottom: 1px solid rgba(255,255,255,.07);
          background: radial-gradient(circle at center,rgba(34,197,94,.08),transparent 55%);
        }

        .contact p {
          color: #8c9aaf;
          font-size: 17px;
        }

        .contact a {
          display: inline-block;
          margin-top: 20px;
          padding: 16px 25px;
          border-radius: 9px;
          background: #22c55e;
          color: #031008;
          text-decoration: none;
          font-weight: 950;
        }

        footer {
          padding: 50px 5%;
          text-align: center;
          color: #69778b;
        }

        footer p {
          font-size: 13px;
        }

        .whatsapp {
          position: fixed;
          right: 23px;
          bottom: 23px;
          z-index: 500;
          width: 60px;
          height: 60px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #22c55e;
          text-decoration: none;
          font-size: 27px;
          box-shadow: 0 10px 40px rgba(34,197,94,.35);
        }

        .toast {
          position: fixed;
          z-index: 600;
          right: 22px;
          top: 110px;
          max-width: 430px;
          padding: 15px 17px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(7,12,20,.97);
          border: 1px solid rgba(34,197,94,.5);
          box-shadow: 0 20px 60px rgba(0,0,0,.5);
        }

        .toast button {
          border: 0;
          background: #22c55e;
          color: #031008;
          border-radius: 7px;
          padding: 8px;
          font-size: 11px;
          font-weight: 950;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 700;
          background: rgba(0,0,0,.88);
          backdrop-filter: blur(8px);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal {
          position: relative;
          width: min(1050px,100%);
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 20px;
          padding: 40px;
          background: linear-gradient(145deg,#111827,#060a12);
          border: 1px solid #2b384d;
        }

        .close,
        .closeNormal {
          border: 0;
          background: #263449;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 23px;
        }

        .close {
          position: absolute;
          right: 18px;
          top: 18px;
        }

        .modalGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 45px;
        }

        .modalImage {
          min-height: 430px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          padding: 25px;
          background: radial-gradient(circle,#293b60,#0c1320);
        }

        .modalImage img {
          width: 100%;
          max-height: 420px;
          object-fit: contain;
        }

        .modal h2 {
          font-size: 37px;
          margin: 8px 0 15px;
        }

        .description {
          color: #a7b2c4;
          line-height: 1.7;
        }

        .modal ul {
          padding: 0;
          list-style: none;
          color: #b7c1d0;
          line-height: 1.9;
        }

        .modal li::first-letter {
          color: #22c55e;
        }

        .modalPrice {
          color: #22c55e;
          font-size: 34px;
          font-weight: 950;
          margin-top: 20px;
        }

        .cartOverlay {
          justify-content: flex-end;
          padding: 0;
        }

        .cart {
          width: min(480px,100%);
          height: 100%;
          overflow-y: auto;
          background: #080e18;
          border-left: 1px solid #28364a;
          padding: 28px;
        }

        .cartHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #253247;
        }

        .cartHeader small {
          color: #22c55e;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .cartHeader h2 {
          margin: 5px 0;
        }

        .empty {
          text-align: center;
          padding: 80px 10px;
        }

        .empty > div {
          font-size: 55px;
        }

        .empty p {
          color: #8492a7;
        }

        .cartItem {
          display: flex;
          gap: 15px;
          padding: 20px 0;
          border-bottom: 1px solid #222f42;
        }

        .cartItem img {
          width: 85px;
          height: 85px;
          object-fit: contain;
          border-radius: 9px;
          background: #131d2d;
        }

        .cartInfo {
          flex: 1;
        }

        .cartInfo > b {
          display: block;
        }

        .cartInfo > span {
          display: block;
          color: #22c55e;
          font-weight: 900;
          margin: 7px 0;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
        }

        .quantity button {
          width: 31px;
          height: 31px;
          border-radius: 6px;
          border: 1px solid #344154;
          background: #172234;
          color: white;
        }

        .remove {
          border: 0;
          padding: 0;
          margin-top: 11px;
          background: transparent;
          color: #f87171;
          font-size: 12px;
        }

        .summary {
          padding: 25px 0;
        }

        .summary > div {
          display: flex;
          justify-content: space-between;
          margin: 9px 0;
        }

        .summary .total {
          font-size: 24px;
          padding-top: 15px;
          border-top: 1px solid #29364a;
        }

        .summary .total strong {
          color: #22c55e;
        }

        .summary small {
          display: block;
          margin-top: 15px;
          color: #7e8ca1;
        }

        .checkout {
          font-size: 14px;
          padding: 16px;
        }

        .continue {
          width: 100%;
          margin-top: 10px;
          padding: 13px;
          border: 1px solid #344154;
          background: transparent;
          color: #b9c3d2;
          border-radius: 8px;
          font-weight: 800;
        }

        @keyframes move1 {
          to {
            transform: translate(300px,180px);
          }
        }

        @keyframes move2 {
          to {
            transform: translate(-300px,150px);
          }
        }

        @media(max-width:850px) {
          nav > a {
            display: none;
          }

          .trust,
          .benefits,
          .steps,
          .modalGrid {
            grid-template-columns: 1fr;
          }

          .hero {
            padding-top: 100px;
          }

          .hero h1 {
            letter-spacing: -3px;
          }

          .modal {
            padding: 25px;
          }

          .modalImage {
            min-height: 300px;
          }
        }

        @media(max-width:550px) {
          header {
            padding: 0 16px;
          }

          .logo {
            font-size: 20px;
          }

          .cartBtn span {
            display: none;
          }

          .announcement {
            font-size: 9px;
          }

          .hero {
            min-height: 650px;
          }

          .hero h1 {
            font-size: 52px;
          }

          .trust {
            margin-top: 45px;
          }

          .products {
            padding-left: 15px;
            padding-right: 15px;
          }

          .toast {
            left: 14px;
            right: 14px;
            top: auto;
            bottom: 90px;
          }
        }
      `}</style>
    </main>
  );
}
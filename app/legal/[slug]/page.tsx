import Link from "next/link";
import { notFound } from "next/navigation";

const pages = {
  terminos: {
    title: "Términos y condiciones",
    sections: [
      ["Alcance", "Estas condiciones regulan las compras realizadas en RXZ Gamer. Al confirmar un pedido, el cliente declara haber revisado el producto, precio y datos de entrega."],
      ["Precios y disponibilidad", "Los precios se expresan en pesos argentinos. La disponibilidad está sujeta a confirmación de stock y la reserva se completa cuando RXZ Gamer verifica el pago."],
      ["Pagos", "Los pagos por transferencia se verifican antes de preparar el pedido. RXZ Gamer nunca solicitará contraseñas, códigos de seguridad ni acceso a cuentas bancarias."],
      ["Envíos", "El costo y plazo se informan según destino. El seguimiento estará disponible en Mi cuenta cuando el pedido sea despachado."],
      ["Contacto", "Las consultas relacionadas con compras pueden enviarse desde el chat interno de Ayuda."],
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    sections: [
      ["Datos que utilizamos", "Tratamos los datos necesarios para crear la cuenta, gestionar pedidos, coordinar entregas, verificar pagos y responder consultas."],
      ["Finalidad", "La información se utiliza exclusivamente para prestar el servicio, prevenir fraudes, cumplir obligaciones aplicables y mejorar la experiencia de compra."],
      ["Proveedores", "Podemos compartir los datos indispensables con servicios de alojamiento, base de datos y transporte que intervienen en la operación."],
      ["Seguridad y conservación", "Aplicamos controles de acceso y conservamos la información durante el tiempo necesario para gestionar la relación comercial y cumplir obligaciones."],
      ["Tus derechos", "Podés solicitar acceso, corrección o eliminación de tus datos desde Ayuda. Algunas constancias pueden conservarse cuando exista una obligación legal."],
    ],
  },
  garantias: {
    title: "Cambios, devoluciones y garantías",
    sections: [
      ["Recepción", "Revisá el estado del paquete al recibirlo y conservá el embalaje, accesorios y comprobante de compra."],
      ["Producto con inconvenientes", "Si el producto presenta una falla, escribinos desde Ayuda indicando el número de pedido y adjuntando fotografías o video cuando sea posible."],
      ["Garantía", "La cobertura y el procedimiento dependen del producto y del fabricante. Te informaremos los pasos y plazos correspondientes a tu caso."],
      ["Devoluciones", "Las solicitudes se evalúan según el estado del producto y la normativa aplicable. Para ejercer el derecho de arrepentimiento utilizá el acceso específico disponible en el sitio."],
    ],
  },
  envios: {
    title: "Información sobre envíos",
    sections: [
      ["Cobertura", "Realizamos envíos dentro de Argentina. La disponibilidad, costo y modalidad dependen del código postal y del producto."],
      ["Preparación", "El pedido comienza a prepararse después de verificar el pago. Podés seguir cada etapa desde Mi cuenta."],
      ["Seguimiento", "Cuando entreguemos el paquete al transporte, mostraremos la empresa y el código de seguimiento en el detalle del pedido."],
      ["Recepción", "Verificá que los datos de entrega sean correctos. Si advertís daños visibles en el paquete, dejá constancia ante el transportista y contactanos desde Ayuda."],
    ],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) notFound();

  return (
    <main className="min-h-screen bg-[#03070c] px-5 py-12 text-white">
      <article className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#09131e] p-6 shadow-2xl sm:p-10">
        <Link href="/" className="text-sm font-bold text-emerald-400 no-underline">← VOLVER A RXZ GAMER</Link>
        <p className="mt-8 text-xs font-black tracking-[.25em] text-emerald-400">INFORMACIÓN IMPORTANTE</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{page.title}</h1>
        <p className="mt-3 text-sm text-slate-400">Última actualización: septiembre de 2026</p>
        <div className="mt-9 space-y-8">
          {page.sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-2 leading-7 text-slate-300">{body}</p>
            </section>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-sm text-slate-300">
          ¿Necesitás ayuda? <Link href="/ayuda" className="font-bold text-emerald-400">Abrí una consulta</Link>.
        </div>
      </article>
    </main>
  );
}

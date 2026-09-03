# Seguridad de RXZ Gamer

La seguridad depende tanto del código como de la configuración de las cuentas.

## Activación obligatoria

1. Ejecutar `supabase/migrations/20260902_security_hardening.sql` en el SQL Editor de Supabase.
2. Publicar el proyecto únicamente después de que la migración termine sin errores.
3. En Supabase Auth activar confirmación de correo, protección contra contraseñas filtradas y CAPTCHA.
4. Configurar como URL del sitio solamente el dominio de producción y eliminar redirecciones comodín innecesarias.
5. Activar MFA en las cuentas de Supabase, GitHub y Vercel. La cuenta administradora de la tienda debe usar una contraseña única.
6. Revisar que `payment-receipts` permanezca privado.
7. Nunca copiar a código, GitHub ni variables `NEXT_PUBLIC_*` una `service_role` o clave secreta.

## Operación segura

- Mantener Next.js, Supabase y dependencias actualizadas.
- Revisar periódicamente los asesores de seguridad y logs de Supabase y Vercel.
- Eliminar inmediatamente de `support_staff` cualquier cuenta que ya no deba administrar la tienda.
- No aprobar comprobantes basándose solo en la imagen: confirmar la acreditación en la cuenta bancaria.
- Conservar copias de seguridad y probar la recuperación periódicamente.
- Rotar claves ante cualquier sospecha de filtración y cerrar las sesiones activas.

## Qué protege la migración

- Aísla pedidos, conversaciones, mensajes y comprobantes por usuario.
- Impide que clientes cambien estados, precios, stock o datos administrativos.
- Calcula precios y descuenta stock dentro de una única operación de base de datos.
- Bloquea carritos manipulados, cantidades excesivas y productos repetidos usados para sobreventa.
- Limita solicitudes públicas abusivas y genera sus códigos del lado seguro.
- Mantiene archivos de pago privados, con tipo, tamaño y ruta controlados.
- Evita reabrir pedidos cancelados para que el stock no pueda duplicarse.

export const ARGENTINE_PROVINCES = ["Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"];

export function validFullName(value: string) {
  const words = value.trim().replace(/\s+/g, " ").split(" ");
  return words.length >= 2 && words.every((word) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.-]{2,}$/.test(word));
}

export function validArgentinePhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^00/, "");
  const national = digits.startsWith("54") ? digits.slice(2).replace(/^9/, "") : digits;
  return national.length === 10 && !/^(\d)\1+$/.test(national) && !["0123456789", "1234567890", "9876543210", "0000000000"].includes(national);
}

export function validAddress(value: string) {
  const clean = value.trim();
  return clean.length >= 6 && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(clean) && /\d/.test(clean);
}

export function validCity(value: string) {
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'. -]{2,80}$/.test(value.trim());
}

export function validPostalCode(value: string) {
  return /^(?:\d{4}|[A-HJ-NP-Z]\d{4}[A-Z]{3})$/i.test(value.trim());
}

export function validEmail(value: string) {
  const clean = value.trim();
  return clean.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(clean);
}

export const SHIPPING = {
  provider: "Andreani",
  originCity: "Villa Allende",
  originProvince: "Córdoba",
  coverage: "todo el país",
  quoteMode: "pending_api_credentials",
} as const;

export const SHIPPING_PROVIDER = SHIPPING.provider;
export const SHIPPING_ORIGIN = `${SHIPPING.originCity}, ${SHIPPING.originProvince}`;


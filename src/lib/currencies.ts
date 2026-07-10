export const CURRENCY_CODES = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
  "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD",
  "GNF", "GTQ", "GYD", "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR",
  "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF",
  "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL",
  "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR",
  "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR",
  "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR",
  "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD",
  "SHP", "SLE", "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS",
  "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD",
  "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF",
  "YER", "ZAR", "ZMW", "ZWL",
] as const;

const POPULAR_CURRENCY_CODES: Array<(typeof CURRENCY_CODES)[number]> = [
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "CAD",
  "AUD",
  "AED",
  "ZAR",
  "GHS",
  "KES",
];

const CURRENCY_NAMES: Partial<Record<(typeof CURRENCY_CODES)[number], string>> = {
  AED: "United Arab Emirates Dirham",
  AUD: "Australian Dollar",
  BRL: "Brazilian Real",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  DKK: "Danish Krone",
  EGP: "Egyptian Pound",
  EUR: "Euro",
  GBP: "British Pound",
  GHS: "Ghanaian Cedi",
  HKD: "Hong Kong Dollar",
  IDR: "Indonesian Rupiah",
  ILS: "Israeli New Shekel",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  KES: "Kenyan Shilling",
  KRW: "South Korean Won",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  NGN: "Nigerian Naira",
  NOK: "Norwegian Krone",
  NZD: "New Zealand Dollar",
  PLN: "Polish Zloty",
  QAR: "Qatari Riyal",
  SAR: "Saudi Riyal",
  SEK: "Swedish Krona",
  SGD: "Singapore Dollar",
  THB: "Thai Baht",
  TRY: "Turkish Lira",
  TZS: "Tanzanian Shilling",
  UGX: "Ugandan Shilling",
  USD: "US Dollar",
  XAF: "Central African CFA Franc",
  XOF: "West African CFA Franc",
  ZAR: "South African Rand",
};

export const currencyOptions = [
  ...POPULAR_CURRENCY_CODES,
  ...CURRENCY_CODES.filter((code) => !POPULAR_CURRENCY_CODES.includes(code)),
].map((code) => ({
  code,
  name: CURRENCY_NAMES[code] ?? code,
}));

export function isCurrencyCode(value: string) {
  return /^[A-Z]{3}$/.test(value);
}

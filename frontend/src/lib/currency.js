export const money = (n) =>
  "₹" + (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 0 });

export const moneyPlain = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const CURRENCY_SYMBOL = "₹";

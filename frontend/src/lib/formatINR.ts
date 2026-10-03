export function formatINR(amount: number, showDecimals: boolean = false): string {
  const rounded = showDecimals ? amount.toFixed(2) : Math.round(amount).toString();
  const parts = rounded.split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : "";

  // Indian numbering system formatting
  const isNegative = integerPart.startsWith("-");
  if (isNegative) integerPart = integerPart.slice(1);

  let lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  const sign = isNegative ? "-" : "";

  return `${sign}₹${formatted}${decimalPart}`;
}

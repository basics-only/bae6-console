const SUFFIXES = ["", "k", "M", "B"];

export function compact(n: number): string {
  let scaled = n;
  let step = 0;
  while (Math.abs(scaled) >= 1000 && step < SUFFIXES.length - 1) {
    scaled /= 1000;
    step++;
  }
  if (step === 0) return String(n);
  let rounded = Math.round(scaled * 10) / 10;
  if (Math.abs(rounded) >= 1000 && step < SUFFIXES.length - 1) {
    rounded = Math.round(rounded) / 1000;
    step++;
  }
  return `${rounded}${SUFFIXES[step]}`;
}

export function usd(amount: number | string): string {
  const n = Number(amount);
  if (n === 0) return "$0.00";
  if (Math.abs(n) < 0.01) return "<$0.01";
  if (Math.abs(n) < 1000) return `$${n.toFixed(2)}`;
  return `$${compact(n)}`;
}

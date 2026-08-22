/** "9:04" → "PT9M4S", "1:02:03" → "PT1H2M3S". Neplatný tvar vynechá. */
export function isoDuration(mmss) {
  if (typeof mmss !== "string") return undefined;
  const parts = mmss.split(":");
  if (parts.length !== 2 && parts.length !== 3) return undefined;
  if (parts.some((part) => !/^\d+$/.test(part))) return undefined;

  const numbers = parts.map(Number);
  const hours = numbers.length === 3 ? numbers[0] : 0;
  const minutes = numbers.length === 3 ? numbers[1] : numbers[0];
  const seconds = numbers.length === 3 ? numbers[2] : numbers[1];
  if (minutes > 59 || seconds > 59) return undefined;

  return `PT${hours ? `${hours}H` : ""}${minutes}M${seconds}S`;
}

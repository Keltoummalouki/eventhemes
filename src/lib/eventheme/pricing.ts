import type { Basket, Entry, EstimateLine, InquiryInput } from "./types";
export function estimate(
  entries: Entry[],
  input: Pick<InquiryInput, "event" | "rentalDays">,
  basket: Basket,
) {
  let total = 0;
  let hasUnpriced = false;
  const summary: string[] = [];
  const lines: EstimateLine[] = [];
  const add = (
    entry: Entry | undefined,
    quantity = 1,
    price = entry?.price,
    detail = "",
  ) => {
    if (!entry) return;
    const amount = price == null || entry.pricing === "request" ? null : price * quantity;
    lines.push({ kind: entry.kind, label: `${entry.title}${detail ? ` · ${detail}` : ""}`, quantity, amount, from: entry.pricing === "from" });
    summary.push(`${entry.title}${quantity > 1 ? ` × ${quantity}` : ""}`);
    if (price == null || entry.pricing === "request") hasUnpriced = true;
    else total += price * quantity;
  };
  add(entries.find((e) => e.id === input.event && e.kind === "events"));
  basket.services.forEach((id) =>
    add(entries.find((e) => e.id === id && e.kind === "services")),
  );
  // Le matériel se loue à la journée : une journée au minimum.
  const days = Math.max(1, Math.floor(input.rentalDays) || 1);
  for (const item of basket.products) {
    const product = entries.find(
      (e) => e.id === item.id && e.kind === "products",
    );
    const variant = product?.variants?.find((v) => v.name === item.variant);
    add(
      product,
      item.quantity * (product?.pricing === "daily" ? days : 1),
      variant ? variant.price : product?.price,
      [variant?.name, product?.pricing === "daily" ? `${item.quantity} unité(s) × ${days} jour(s)` : ""].filter(Boolean).join(" · "),
    );
    if (variant) summary.push(`Finition : ${variant.name}`);
  }
  return { total, hasUnpriced, summary, lines };
}

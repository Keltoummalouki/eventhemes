"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { Basket, Entry, QuoteState } from "@/lib/eventheme/types";
const empty: Basket = { services: [], products: [] };
let memory = "";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("eventheme-basket", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("eventheme-basket", callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem("eventheme-basket") || memory;
  } catch {
    return memory;
  }
}
const Context = createContext<{
  entries: Entry[];
  basket: Basket;
  setBasket: (basket: Basket) => void;
  add: (entry: Entry, variant?: string) => void;
  notice: string;
  local: boolean;
} | null>(null);
export function EventhemeProvider({
  entries,
  local,
  children,
}: {
  entries: Entry[];
  local: boolean;
  children: ReactNode;
}) {
  const stored = useSyncExternalStore(subscribe, snapshot, () => "");
  const basket = useMemo<Basket>(() => {
    try {
      const value = JSON.parse(stored);
      if (Array.isArray(value?.services) && Array.isArray(value?.products))
        return {
          services: value.services.filter(
            (id: unknown) => typeof id === "string",
          ),
          products: value.products.filter(
            (item: unknown) =>
              item &&
              typeof item === "object" &&
              "id" in item &&
              "quantity" in item &&
              typeof item.id === "string" &&
              Number.isInteger(item.quantity),
          ),
        };
    } catch {}
    return empty;
  }, [stored]);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);
  function setBasket(value: Basket) {
    memory = JSON.stringify(value);
    try {
      localStorage.setItem("eventheme-basket", memory);
    } catch {}
    window.dispatchEvent(new Event("eventheme-basket"));
  }
  function add(entry: Entry, variant = "") {
    if (entry.kind === "services")
      setBasket({
        ...basket,
        services: [...new Set([...basket.services, entry.id])],
      });
    else {
      const selected = variant || entry.variants?.[0]?.name || "";
      const existing = basket.products.find(
        (p) => p.id === entry.id && p.variant === selected,
      );
      setBasket({
        ...basket,
        products: existing
          ? basket.products.map((p) =>
              p === existing
                ? { ...p, quantity: Math.min(1000, p.quantity + 1) }
                : p,
            )
          : [
              ...basket.products,
              { id: entry.id, quantity: 1, variant: selected },
            ],
      });
    }
    setNotice(`${entry.title} ajouté à votre devis`);
  }
  return (
    <Context.Provider
      value={{ entries, basket, setBasket, add, notice, local }}
    >
      <QuoteProvider>{children}</QuoteProvider>
    </Context.Provider>
  );
}
export function useEventheme() {
  const value = useContext(Context);
  if (!value) throw new Error("EventhemeProvider missing");
  return value;
}

export const initialQuote = (): QuoteState => ({
  phase: "lead",
  step: 0,
  contact: { name: "", phone: "", email: "", contactMethod: "Téléphone", consent: false },
  details: {
    event: "",
    date: "",
    duration: 0,
    rentalDays: 1,
    city: "",
    address: "",
    guests: 50,
    message: "",
  },
  lead: null,
  result: null,
});
const QuoteContext = createContext<{
  quote: QuoteState;
  setQuote: Dispatch<SetStateAction<QuoteState>>;
  /** Choisit l’occasion depuis n’importe quelle section (types d’événements…). */
  pickEvent: (id: string) => void;
} | null>(null);
/**
 * Parcours « Mon devis » en cours, conservé pendant la navigation entre les
 * pages. Contexte séparé : la saisie ne fait pas se re-rendre tout le site.
 */
function QuoteProvider({ children }: { children: ReactNode }) {
  const [quote, setQuote] = useState(initialQuote);
  const pickEvent = useCallback(
    (id: string) => setQuote((q) => ({ ...q, details: { ...q.details, event: id } })),
    [],
  );
  const value = useMemo(() => ({ quote, setQuote, pickEvent }), [quote, pickEvent]);
  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}
export function useQuote() {
  const value = useContext(QuoteContext);
  if (!value) throw new Error("QuoteProvider missing");
  return value;
}

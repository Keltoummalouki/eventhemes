"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import MobileMenu from "@/components/layout/MobileMenu";
import { navigation } from "@/data/eventheme";
import { useScrolled } from "@/hooks/useScrolled";
import { cx } from "@/lib/cx";
import { findSocial } from "@/lib/eventheme/types";
import { gsap, motionSafe, useGSAP } from "@/lib/motion";
import { useEventheme } from "./Provider";
import Button from "@/components/ui/Button";
import s from "./Eventheme.module.css";
import { ArrowUpRightIcon } from "@/components/ui/icons";
export function Logo() {
  return (
    <img
      src="/eventheme_logo_png.webp"
      alt="Eventheme — accueil"
      className={s.logo}
      width={150}
      height={68}
    />
  );
}
export function Arrow() {
  return <ArrowUpRightIcon className="inline-icon" />;
}
export default function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const home = path === "/";
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(40);
  const header = useRef<HTMLElement>(null);
  const { entries, basket, notice } = useEventheme();
  const socials = entries.filter((e) => e.kind === "socials");
  const services = entries.filter((e) => e.kind === "services");
  const count =
    basket.services.length +
    basket.products.reduce((n, p) => n + p.quantity, 0);
  // Sur l'accueil, « Mon devis » mène à la section ; ailleurs, à sa page.
  const quoteHref = home ? "#devis" : "/devis";

  // Menu ouvert : la page ne défile plus, Échap le referme.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      document.getElementById("menu-toggle")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Filet doré de progression de lecture, sous l'en-tête.
  useGSAP(
    () =>
      motionSafe(header, () => {
        gsap.fromTo(
          `.${s.progress}`,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
          },
        );
      }),
    { scope: header, dependencies: [path], revertOnUpdate: true },
  );

  const quoteButton = (
    <Button
      href={quoteHref}
      variant="outline"
      size="sm"
      icon={<ArrowUpRightIcon />}
      className={s.quoteButton}
      onClick={() => setOpen(false)}
    >
      Mon devis {count > 0 && <span className={s.count}>{count}</span>}
    </Button>
  );

  return (
    <div className={s.site}>
      <a className={s.skip} href="#main">
        Aller au contenu
      </a>
      <header
        ref={header}
        className={cx(
          s.header,
          home && s.overlay,
          scrolled && s.scrolled,
          open && s.menuOpen,
        )}
      >
        <Link href="/" onClick={() => setOpen(false)} className={s.brand}>
          <Logo />
        </Link>
        <nav className={s.nav} aria-label="Navigation principale">
          {navigation.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={path === href ? s.active : ""}
              aria-current={path === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        {quoteButton}
        <button
          id="menu-toggle"
          type="button"
          className={cx(s.menuToggle, open && s.menuToggleOpen)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>
        <span className={s.progress} aria-hidden="true" />
      </header>
      <MobileMenu
        id="menu-mobile"
        open={open}
        links={navigation}
        current={path}
        socials={socials}
        onNavigate={() => setOpen(false)}
        action={
          <Button href={quoteHref} icon={<ArrowUpRightIcon />} onClick={() => setOpen(false)}>
            Mon devis {count > 0 && `(${count})`}
          </Button>
        }
      />
      <main id="main">{children}</main>
      <footer className={s.footer}>
        <div className={s.footerSignature}>
          <p>
            Votre événement. Votre vision.
            <br />
            <em>Notre savoir-faire.</em>
          </p>
          <Button href={quoteHref} icon={<ArrowUpRightIcon />}>
            Demander un devis
          </Button>
        </div>
        <div className={s.footerTop}>
          <div>
            <Link href="/">
              <Logo />
            </Link>
            <p>
              EVENTHEME — Organisation, animation et location événementielle.
            </p>
            <span className={s.eyebrow}>
              ORGANISATION · ANIMATION · DÉCORATION · LOCATION
            </span>
          </div>
          <div>
            <h3>Explorer</h3>
            {navigation.slice(1).map(([title, href]) => (
              <Link key={href} href={href}>
                {title}
              </Link>
            ))}
          </div>
          <div>
            <h3>Services</h3>
            {services.map((service) => (
              <Link key={service.id} href="/services">
                {service.title}
              </Link>
            ))}
            <Link href="/location">Catalogue de location</Link>
          </div>
          <div>
            <h3>Rencontrons-nous</h3>
            <Link href="/contact">Parlons de votre projet</Link>
            <Link href={quoteHref}>Mon devis</Link>
            {socials.map((e) => (
              <a
                key={e.id}
                href={e.url}
                target={e.url?.startsWith("https") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {e.title} <ArrowUpRightIcon className="inline-icon" />
              </a>
            ))}
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>
            © {new Date().getFullYear()} EVENTHEME. Tous droits réservés.
          </span>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/politique-de-confidentialite">Confidentialité</Link>
          <Link href="/admin">
            Administration <ArrowUpRightIcon className="inline-icon" />
          </Link>
        </div>
      </footer>
      <div
        className={`${s.toast} ${notice ? s.toastVisible : ""}`}
        role="status"
      >
        {notice} {notice && <Link href={quoteHref}>Voir mon devis →</Link>}
      </div>
    </div>
  );
}
export function CTA() {
  const { entries } = useEventheme();
  const whatsapp = findSocial(entries, "whatsapp");
  return (
    <section className={s.cta}>
      <span className={s.eyebrow}>IMAGINONS LA SUITE, ENSEMBLE</span>
      <h2>
        Parlons de votre
        <br />
        <em>prochain événement.</em>
      </h2>
      <div className={s.actions}>
        <Button href="/devis" icon={<ArrowUpRightIcon />} magnetic>
          Demander un devis
        </Button>
        {whatsapp?.url && (
          <Button
            variant="link"
            href={whatsapp.url}
            target="_blank"
            rel="noreferrer"
            icon={<ArrowUpRightIcon />}
          >
            Nous contacter sur WhatsApp
          </Button>
        )}
      </div>
    </section>
  );
}

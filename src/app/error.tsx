"use client";
import Link from "next/link";
import s from "@/components/eventheme/Eventheme.module.css";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className={`${s.site} ${s.success}`}><span className={s.eyebrow}>EVENTHEME</span><h1>Un instant, s’il vous plaît.</h1><p>La page est momentanément indisponible. Réessayez dans quelques instants.</p><div className={s.actions}><button className={s.button} onClick={reset}>Réessayer ↻</button><Link className={s.textLink} href="/">Retour à l’accueil →</Link></div></main>;
}

import Shell from "@/components/eventheme/Shell";
import Button from "@/components/ui/Button";
import s from "@/components/eventheme/Eventheme.module.css";
export default function NotFound() {
  return (
    <Shell>
      <section className={s.success}>
        <span className={s.eyebrow}>404 — PAGE INTROUVABLE</span>
        <h1>Reprenons le fil.</h1>
        <p>Cette page n’existe pas ou n’est plus publiée.</p>
        <Button href="/" icon="→" className={s.successAction}>
          Retour à l’accueil
        </Button>
      </section>
    </Shell>
  );
}

import Button from '@/components/ui/Button';
import Eyebrow from '@/components/ui/Eyebrow';
import Reveal from '@/components/ui/Reveal';
import SmartImage from '@/components/ui/SmartImage';
import { unsplashPhoto } from '@/lib/images';
import styles from './CTA.module.css';

const CTA_IMAGE = unsplashPhoto('1519741497674-611481863552', 1800);

/** Dernière invitation à passer à l'action : « Demander un devis ». */
export default function CTA() {
  return (
    <section className={styles.cta} id="contact-cta">
      <SmartImage
        src={CTA_IMAGE}
        alt=""
        fallbackSeed="aurelys-cta"
        fallbackWidth={1800}
        fallbackHeight={1000}
      />
      <Reveal className={styles.content}>
        <Eyebrow centered>Prochaine étape</Eyebrow>
        <h2>Votre événement mérite l&apos;exceptionnel.</h2>
        <p>Confiez-nous votre projet et transformons votre vision en une expérience inoubliable.</p>
        <Button href="#contact" variant="fill" className={styles.ctaBtn}>
          Demander un devis
        </Button>
      </Reveal>
    </section>
  );
}

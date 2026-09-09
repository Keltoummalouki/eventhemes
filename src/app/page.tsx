import Curtain from '@/components/layout/Curtain';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MotionRoot from '@/components/layout/MotionRoot';
import CTA from '@/components/sections/CTA';
import Equipment from '@/components/sections/Equipment';
import EventCalculator from '@/components/sections/EventCalculator';
import Gallery from '@/components/sections/Gallery';
import Hero from '@/components/sections/Hero';
import ProcessTimeline from '@/components/sections/ProcessTimeline';
import Services from '@/components/sections/Services';
import Stats from '@/components/sections/Stats';
import Testimonials from '@/components/sections/Testimonials';
import Divider from '@/components/ui/Divider';
import Marquee from '@/components/ui/Marquee';

/**
 * Page vitrine AURÉLYS.
 *
 * L'ordre des sections suit exactement le parcours défini par la maquette :
 * découverte → preuve → offre → capacité technique → méthode → réalisations →
 * confiance → projection budgétaire → demande de devis.
 *
 * Le bandeau défilant s'intercale entre les savoir-faire et le parc technique :
 * il annonce d'un regard le vocabulaire de production, juste avant la traversée
 * horizontale qui en montre le détail.
 */
export default function Home() {
  return (
    <>
      <MotionRoot />
      <Curtain />
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>

      <Header />

      <main id="contenu">
        <Hero />
        <Stats />
        <Services />
        <Divider />
        <Marquee />
        <Equipment />
        <ProcessTimeline />
        <Gallery />
        <Testimonials />
        <EventCalculator />
        <CTA />
      </main>

      <Footer />
    </>
  );
}

"use client";
import Curtain from "@/components/layout/Curtain";
import MotionRoot from "@/components/layout/MotionRoot";
import CTA from "@/components/sections/CTA";
import EventTypes from "@/components/sections/EventTypes";
import Gallery from "@/components/sections/Gallery";
import Hero from "@/components/sections/Hero";
import Presentation from "@/components/sections/Presentation";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import Rental from "@/components/sections/Rental";
import Services from "@/components/sections/Services";
import QuoteStudio from "./QuoteStudio";

/**
 * Accueil : tout EVENTHEME sur une seule page.
 *
 * Le parcours suit le cahier des charges : découvrir la marque, choisir un
 * service, une occasion, du matériel, s'inspirer, puis demander son devis.
 * Chaque section mène aussi à sa page détaillée, qui reste disponible.
 */
export default function Home() {
  return (
    <>
      <MotionRoot />
      <Curtain />
      <Hero />
      <Presentation />
      <Services />
      <EventTypes />
      <Rental />
      <ProcessTimeline />
      <Gallery />
      <QuoteStudio />
      <CTA />
    </>
  );
}

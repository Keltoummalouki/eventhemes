import SectionHeader from '@/components/ui/SectionHeader';
import { SERVICES } from '@/data/services';
import ServiceCard from './ServiceCard';
import styles from './Services.module.css';

export default function Services() {
  return (
    <section className="section-pad" id="services">
      <div className="container">
        <SectionHeader
          eyebrow="Nos savoir-faire"
          title="Nos services"
          description="Tout ce dont vous avez besoin pour créer un événement exceptionnel."
        />
      </div>

      <div className={styles.grid}>
        {SERVICES.map((service, index) => (
          <ServiceCard key={service.title} service={service} position={index + 1} />
        ))}
      </div>
    </section>
  );
}

import { SocialIcon } from '@/components/ui/icons';
import { FOOTER_COLUMNS, FOOTER_COPY, FOOTER_TAGLINE, SITE, SOCIAL_ICONS } from '@/data/site';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <div className={styles.logo}>
              AUR<span>É</span>LYS
            </div>
            <p className={styles.tagline}>{SITE.description}</p>
            <div className={styles.social}>
              {SOCIAL_ICONS.map((social) => (
                <a key={social.key} href={social.href} aria-label={social.label}>
                  <SocialIcon name={social.key} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className={styles.col}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>{FOOTER_TAGLINE}</p>
          <p className={styles.copy}>{FOOTER_COPY}</p>
        </div>
      </div>
    </footer>
  );
}

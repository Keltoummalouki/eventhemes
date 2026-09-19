"use client";

import Button from "@/components/ui/Button";
import { BarList, Columns, Meter } from "@/components/ui/Chart";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { parseIsoDate } from "@/lib/dates";
import {
  STALE_DAYS,
  UPCOMING_DAYS,
  compactMoney,
  count,
  daysCount,
  percent,
  trendNote,
  withDelta,
  type Analytics,
} from "@/lib/eventheme/analytics";
import {
  daysLabel,
  hoursLabel,
  labels,
  money,
  type Inquiry,
} from "@/lib/eventheme/types";
import s from "./Eventheme.module.css";

/** Vignette d'indicateur : un intitulé, un chiffre, une précision facultative. */
export function Tile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className={s.statTile}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

/** Liste de mesures : intitulé à gauche, valeur à droite. */
function Measures({ rows }: { rows: [string, string][] }) {
  return (
    <dl className={s.statList}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Demandes listées par date d'événement : le planning des prochaines semaines. */
function EventTable({
  inquiries,
  select,
  empty,
}: {
  inquiries: Inquiry[];
  select: (inquiry: Inquiry) => void;
  empty: string;
}) {
  if (!inquiries.length) return <p className={s.caption}>{empty}</p>;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Date de l’événement</th>
            <th>Client</th>
            <th>Lieu</th>
            <th>Invités</th>
            <th>Statut</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <td>{parseIsoDate(inquiry.date)?.toLocaleDateString("fr-FR") ?? inquiry.date}</td>
              <td>
                <strong>{inquiry.name}</strong>
                <small>{inquiry.phone}</small>
              </td>
              <td>
                {inquiry.city || "—"}
                {inquiry.address && <small>{inquiry.address}</small>}
              </td>
              <td>{inquiry.guests ? count(inquiry.guests) : "—"}</td>
              <td>
                <span className={s.status}>{inquiry.status}</span>
              </td>
              <td>
                <Button
                  variant="link"
                  size="sm"
                  icon={<ArrowUpRightIcon />}
                  onClick={() => select(inquiry)}
                >
                  Ouvrir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tableau de bord chiffré de l'administration : activité, suivi des demandes,
 * valeur estimée, planning des événements, attentes des clients et santé du
 * catalogue. Tout provient des demandes reçues ; rien n'est extrapolé.
 */
export default function Statistics({
  stats,
  select,
}: {
  stats: Analytics;
  select: (inquiry: Inquiry) => void;
}) {
  const { volume, pipeline, handling, conversion, value, events, demand, catalogue } = stats;
  return (
    <>
      <div className={s.statGrid}>
        <Tile
          label="Demandes reçues (30 jours)"
          value={count(volume.month.value)}
          note={trendNote(volume.month, "sur les 30 jours précédents")}
        />
        <Tile
          label="Demandes ouvertes"
          value={count(handling.open)}
          note={`${count(handling.pending)} à traiter · ${count(handling.active)} en cours de traitement`}
        />
        <Tile
          label="Taux de concrétisation"
          value={percent(conversion.winRate)}
          note={`${count(conversion.won)} confirmées ou terminées sur ${count(conversion.decided)} demandes décidées`}
        />
        <Tile
          label="Valeur du portefeuille"
          value={compactMoney(value.pipeline)}
          note={`Demandes ouvertes · panier moyen ${value.average == null ? "—" : compactMoney(value.average)}`}
        />
      </div>
      <div className={s.statGrid}>
        <Tile
          label="Demandes de devis"
          value={count(volume.quotes)}
          note={`${percent(volume.withProductsShare)} comportent du matériel en location`}
        />
        <Tile
          label="Messages de contact"
          value={count(volume.messages)}
          note={`${count(volume.today)} demande(s), tous formulaires confondus, reçue(s) aujourd’hui`}
        />
        <Tile
          label="Rappels en attente"
          value={count(volume.callbacks)}
          note={`${percent(conversion.callbackRate)} des rappels aboutissent à un devis détaillé`}
        />
        <Tile
          label={`Événements dans ${UPCOMING_DAYS} jours`}
          value={count(events.upcoming30)}
          note={`${count(events.thisMonth)} ce mois-ci · ${count(events.upcoming.length)} à venir au total`}
        />
      </div>

      <div className={s.adminPanel}>
        <h2>Activité</h2>
        <div className={s.chartGrid}>
          <div className={s.chartCard}>
            <h3>Demandes reçues</h3>
            <p>Douze derniers mois, tous formulaires confondus.</p>
            <Columns
              points={stats.months}
              label="demandes"
              detail={(point) => (point.amount ? `${money(point.amount)} estimés` : undefined)}
            />
          </div>
          <div className={s.chartCard}>
            <h3>Origine des demandes</h3>
            <p>Par formulaire, depuis la mise en ligne.</p>
            <BarList
              showShare
              items={[
                { id: "quote", label: "Devis détaillés", value: volume.quotes },
                { id: "contact", label: "Messages de contact", value: volume.messages },
                { id: "callback", label: "Demandes de rappel", value: volume.callbacks },
              ].map((item) => ({
                ...item,
                share: volume.total ? item.value / volume.total : 0,
              }))}
            />
            <Measures
              rows={[
                ["7 derniers jours", withDelta(volume.week)],
                ["30 derniers jours", withDelta(volume.month)],
                ["Aujourd’hui", count(volume.today)],
                ["Total reçu", count(volume.total)],
              ]}
            />
          </div>
        </div>
      </div>

      <div className={s.adminPanel}>
        <h2>Suivi des demandes</h2>
        <div className={s.chartGrid}>
          <div className={s.chartCard}>
            <h3>Répartition par statut</h3>
            <p>Mettez les statuts à jour depuis la fiche d’une demande.</p>
            <BarList
              showShare
              items={pipeline.map((line) => ({
                id: line.status,
                label: line.status,
                value: line.count,
                share: line.share,
                muted: line.status === "Annulé",
              }))}
            />
          </div>
          <div className={s.chartCard}>
            <h3>Taux clés</h3>
            <p>Calculés sur les demandes déjà décidées.</p>
            <div className={s.meterRow}>
              <Meter
                label="Concrétisation"
                value={conversion.winRate}
                caption="Confirmées ou terminées, parmi les demandes décidées."
              />
              <Meter
                label="Devis envoyés"
                value={conversion.quoteSentRate}
                caption="Demandes de devis ayant au moins reçu une proposition."
              />
              <Meter
                label="Annulations"
                value={conversion.cancelRate}
                caption={`${count(conversion.lost)} demande(s) annulée(s) sur ${count(volume.total)}.`}
              />
              <Meter
                label="Rappels transformés"
                value={conversion.callbackRate}
                caption={`${count(conversion.callbacksCompleted)} rappel(s) complété(s) en devis détaillé.`}
              />
            </div>
          </div>
        </div>
        <Measures
          rows={[
            ["Ancienneté moyenne des demandes ouvertes", daysCount(handling.averageOpenAgeDays)],
            ["Plus ancienne demande non traitée", daysCount(handling.oldestPendingDays)],
            ["Délai moyen entre la demande et l’événement", daysCount(events.leadTimeDays)],
          ]}
        />
        <h3>À relancer</h3>
        <p className={s.caption}>
          Demandes encore au statut « Nouvelle demande » depuis {STALE_DAYS} jours ou plus.
        </p>
        {handling.stale.length ? (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Reçue le</th>
                  <th>Montant indicatif</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {handling.stale.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td>
                      <strong>{inquiry.name}</strong>
                      <small>{inquiry.email || inquiry.phone}</small>
                    </td>
                    <td>{new Date(inquiry.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>{inquiry.estimate ? money(inquiry.estimate) : "—"}</td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        icon={<ArrowUpRightIcon />}
                        onClick={() => select(inquiry)}
                      >
                        Ouvrir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={s.caption}>Aucune demande en attente. Tout est à jour.</p>
        )}
      </div>

      <div className={s.adminPanel}>
        <h2>Valeur estimée</h2>
        <p className={s.caption}>
          Montants issus du configurateur, à titre indicatif : ils ne constituent pas un devis.
        </p>
        <div className={s.statGrid}>
          <Tile label="Portefeuille ouvert" value={compactMoney(value.pipeline)} />
          <Tile label="Confirmé et terminé" value={compactMoney(value.won)} />
          <Tile label="Total demandé" value={compactMoney(value.total)} />
          <Tile
            label="Panier moyen"
            value={value.average == null ? "—" : compactMoney(value.average)}
            note={`Sur ${count(volume.quotes)} demande(s) de devis`}
          />
        </div>
        <div className={s.chartGrid}>
          <div className={s.chartCard}>
            <Meter
              label="Demandes comportant des postes à chiffrer"
              value={value.unpricedShare}
              caption={`${count(value.unpriced)} demande(s) contiennent au moins une prestation « sur devis » : le montant affiché y est incomplet.`}
            />
          </div>
          <div className={s.chartCard}>
            {value.largest ? (
              <Measures
                rows={[
                  ["Demande la plus élevée", money(value.largest.estimate)],
                  ["Client", value.largest.name],
                  ["Ville", value.largest.city || "—"],
                ]}
              />
            ) : (
              <p className={s.caption}>Aucun montant estimé pour le moment.</p>
            )}
          </div>
        </div>
      </div>

      <div className={s.adminPanel}>
        <h2>Événements</h2>
        <div className={s.chartGrid}>
          <div className={s.chartCard}>
            <h3>Saisonnalité</h3>
            <p>
              Dates d’événement demandées, du mois en cours aux onze suivants.
              Annulations exclues.
            </p>
            <Columns points={stats.season} label="événements" />
          </div>
          <div className={s.chartCard}>
            <h3>Profil des événements</h3>
            <p>Moyennes calculées sur les demandes de devis renseignées.</p>
            <Measures
              rows={[
                [
                  "Invités en moyenne",
                  events.averageGuests == null ? "—" : count(events.averageGuests),
                ],
                [
                  "Durée moyenne",
                  events.averageDuration == null ? "—" : hoursLabel(events.averageDuration),
                ],
                [
                  "Location moyenne",
                  events.averageRentalDays == null
                    ? "—"
                    : daysLabel(Math.round(events.averageRentalDays)),
                ],
                ["Invités attendus au total", count(events.totalGuests)],
              ]}
            />
          </div>
        </div>
        <h3>Prochains événements</h3>
        <EventTable
          inquiries={events.upcoming.slice(0, 8)}
          select={select}
          empty="Aucun événement daté à venir."
        />
        <h3>À clôturer</h3>
        <p className={s.caption}>
          Événements dont la date est passée alors que la demande reste ouverte.
        </p>
        <EventTable
          inquiries={events.toClose}
          select={select}
          empty="Aucun événement en retard de clôture."
        />
      </div>

      <div className={s.adminPanel}>
        <h2>Ce que vos clients demandent</h2>
        <div className={s.chartGrid}>
          <div className={s.chartCard}>
            <h3>Types d’événement</h3>
            <p>Nombre de demandes par type choisi.</p>
            <BarList showShare items={demand.eventTypes.slice(0, 8)} />
          </div>
          <div className={s.chartCard}>
            <h3>Services les plus demandés</h3>
            <p>Ajouts au devis depuis la page Services.</p>
            <BarList showShare items={demand.services.slice(0, 8)} />
          </div>
          <div className={s.chartCard}>
            <h3>Matériel le plus demandé</h3>
            <p>Quantités cumulées sur toutes les demandes.</p>
            <BarList
              items={demand.products.slice(0, 8)}
              format={(quantity) => `${count(quantity)} unité(s)`}
            />
          </div>
          <div className={s.chartCard}>
            <h3>Villes</h3>
            <p>Lieux des événements demandés.</p>
            <BarList showShare items={demand.cities.slice(0, 8)} />
          </div>
          <div className={s.chartCard}>
            <h3>Contact préféré</h3>
            <p>Canal choisi par le client pour être recontacté.</p>
            <BarList showShare items={demand.contactMethods} />
          </div>
        </div>
      </div>

      <div className={s.adminPanel}>
        <h2>Catalogue et contenus</h2>
        <div className={s.statGrid}>
          <Tile
            label="Articles au catalogue"
            value={count(catalogue.products)}
            note={`${count(catalogue.unavailable)} indisponible(s)`}
          />
          <Tile
            label="Articles sur devis"
            value={count(catalogue.onRequest)}
            note="Sans tarif indicatif : le montant estimé reste incomplet."
          />
          <Tile
            label="Prix moyen du matériel"
            value={catalogue.averagePrice == null ? "—" : compactMoney(catalogue.averagePrice)}
          />
          <Tile
            label="Contenus sans photo"
            value={count(catalogue.missingImage)}
            note="Services, matériel, types d’événement et réalisations."
          />
        </div>
        <div className={s.chartGrid}>
          <div className={s.chartCard}>
            <h3>Contenus par rubrique</h3>
            <p>Publiés et brouillons.</p>
            <BarList
              items={catalogue.counts.map((line) => ({
                id: line.kind,
                label: labels[line.kind],
                value: line.total,
                caption: `${count(line.published)} publié(s) · ${count(line.total - line.published)} brouillon(s)`,
              }))}
            />
          </div>
          <div className={s.chartCard}>
            <h3>Matériel jamais demandé</h3>
            <p>Articles publiés qui n’ont encore figuré dans aucune demande.</p>
            {catalogue.dormant.length ? (
              <ul className={s.tagList}>
                {catalogue.dormant.slice(0, 15).map((product) => (
                  <li key={product.id}>{product.label}</li>
                ))}
                {catalogue.dormant.length > 15 && (
                  <li>+ {count(catalogue.dormant.length - 15)} autres</li>
                )}
              </ul>
            ) : (
              <p className={s.caption}>Chaque article publié a déjà été demandé.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

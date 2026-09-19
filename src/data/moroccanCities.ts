/**
 * Villes du Maroc proposées dans « Mon devis » (champ « Ville », obligatoire).
 *
 * Classées par région pour l'entretien, exportées par ordre alphabétique.
 * Le serveur refuse toute ville absente de cette liste : pour un lieu hors
 * ville, le visiteur choisit la plus proche et précise l'adresse.
 */
const citiesByRegion: Record<string, readonly string[]> = {
  'Tanger-Tétouan-Al Hoceïma': [
    'Tanger', 'Tétouan', 'Al Hoceïma', 'Larache', 'Ksar El Kébir', 'Chefchaouen', 'Asilah',
    'M’diq', 'Fnideq', 'Martil', 'Ouazzane', 'Imzouren', 'Targuist', 'Bni Bouayach', 'Oued Laou',
  ],
  'L’Oriental': [
    'Oujda', 'Nador', 'Berkane', 'Taourirt', 'Guercif', 'Jerada', 'Figuig', 'Bouarfa', 'Driouch',
    'Saïdia', 'Zaïo', 'Ahfir', 'Selouane', 'El Aïoun Sidi Mellouk', 'Beni Ansar', 'Midar',
    'Al Aroui', 'Aïn Béni Mathar', 'Debdou',
  ],
  'Fès-Meknès': [
    'Fès', 'Meknès', 'Taza', 'Sefrou', 'Ifrane', 'Azrou', 'El Hajeb', 'Moulay Yacoub', 'Taounate',
    'Missour', 'Boulemane', 'Outat El Haj', 'Imouzzer Kandar', 'Bhalil', 'Aïn Taoujdate',
    'Ribate El Kheir', 'Tahla', 'Karia Ba Mohamed', 'Moulay Idriss Zerhoun', 'Tissa', 'Aknoul',
    'Ghafsaï', 'Sabaa Aïyoun', 'Agouraï',
  ],
  'Rabat-Salé-Kénitra': [
    'Rabat', 'Salé', 'Kénitra', 'Témara', 'Skhirat', 'Harhoura', 'Aïn Attig', 'Aïn El Aouda',
    'Sidi Bouknadel', 'Khémisset', 'Tiflet', 'Rommani', 'Oulmès', 'Sidi Allal El Bahraoui',
    'Sidi Kacem', 'Mechra Bel Ksiri', 'Jorf El Melha', 'Sidi Slimane', 'Sidi Yahya El Gharb',
    'Mehdia', 'Sidi Taïbi', 'Souk El Arbaa', 'Moulay Bousselham',
  ],
  'Béni Mellal-Khénifra': [
    'Béni Mellal', 'Khouribga', 'Khénifra', 'Fquih Ben Salah', 'Azilal', 'Kasba Tadla', 'Oued Zem',
    'Souk Sebt Oulad Nemma', 'Boujniba', 'Boujad', 'Demnate', 'M’rirt', 'Zaouiat Cheikh',
    'El Ksiba', 'Ouled Ayad', 'Ouaouizeght', 'Bzou',
  ],
  'Casablanca-Settat': [
    'Casablanca', 'Mohammédia', 'Aïn Harrouda', 'Bouskoura', 'Dar Bouazza', 'Nouaceur', 'Médiouna',
    'Tit Mellil', 'Lahraouyine', 'Bouznika', 'Benslimane', 'El Mansouria', 'Berrechid',
    'Had Soualem', 'Deroua', 'Sidi Rahal Chatai', 'El Gara', 'Settat', 'Ben Ahmed', 'El Borouj',
    'El Jadida', 'Azemmour', 'Bir Jdid', 'Moulay Abdallah', 'Oualidia', 'Sidi Bennour',
    'Zemamra', 'Oulad Frej', 'Sidi Smaïl',
  ],
  'Marrakech-Safi': [
    'Marrakech', 'Tamansourt', 'Tahannaout', 'Amizmiz', 'Aït Ourir', 'Ourika', 'Asni',
    'Lalla Takerkoust', 'Safi', 'Jemâa Shaim', 'Sebt Gzoula', 'Essaouira', 'Tamanar',
    'El Kelaâ des Sraghna', 'El Attaouia', 'Tamellalt', 'Sidi Rahhal', 'Youssoufia', 'Chemaïa',
    'Ben Guerir', 'Chichaoua', 'Imintanoute',
  ],
  'Drâa-Tafilalet': [
    'Errachidia', 'Erfoud', 'Rissani', 'Merzouga', 'Goulmima', 'Tinejdad', 'Er-Rich', 'Midelt',
    'Tinghir', 'Boumalne Dadès', 'Kelaât M’Gouna', 'Ouarzazate', 'Skoura', 'Tazenakht', 'Zagora',
    'Agdz', 'M’Hamid El Ghizlane',
  ],
  'Souss-Massa': [
    'Agadir', 'Inezgane', 'Aït Melloul', 'Dcheira El Jihadia', 'Temsia', 'Leqliâa', 'Drarga',
    'Aourir', 'Taghazout', 'Biougra', 'Aït Baha', 'Taroudant', 'Oulad Teïma', 'Ouled Berhil',
    'Aoulouz', 'Taliouine', 'Tiznit', 'Mirleft', 'Tafraout', 'Tata', 'Akka', 'Foum Zguid',
  ],
  'Guelmim-Oued Noun': ['Guelmim', 'Tan-Tan', 'El Ouatia', 'Sidi Ifni', 'Assa', 'Zag', 'Bouizakarne'],
  'Laâyoune-Sakia El Hamra': ['Laâyoune', 'El Marsa', 'Boujdour', 'Tarfaya', 'Es-Semara'],
  'Dakhla-Oued Ed-Dahab': ['Dakhla'],
};

export const moroccanCities: readonly string[] = Object.values(citiesByRegion)
  .flat()
  .sort((a, b) => a.localeCompare(b, 'fr'));

export function isMoroccanCity(value: string): boolean {
  return moroccanCities.includes(value);
}

import { useEffect, useState } from 'react';

export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  rateFromEur: number; // Reference conversion rate from 1 EUR
}

export interface WorldCountry {
  code: string;
  name: string;
  dial: string;
  currency: string;
}

export const CURRENCIES: Record<string, CurrencyMeta> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromEur: 1 },
  XOF: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (BCEAO)', rateFromEur: 655.957 },
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (BEAC)', rateFromEur: 655.957 },
  USD: { code: 'USD', symbol: '$', name: 'Dollar américain', rateFromEur: 1.09 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Dollar canadien', rateFromEur: 1.5 },
  GBP: { code: 'GBP', symbol: '£', name: 'Livre sterling', rateFromEur: 0.85 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Franc suisse', rateFromEur: 0.96 },
  MAD: { code: 'MAD', symbol: 'MAD', name: 'Dirham marocain', rateFromEur: 10.85 },
  TND: { code: 'TND', symbol: 'DT', name: 'Dinar tunisien', rateFromEur: 3.38 },
  DZD: { code: 'DZD', symbol: 'DA', name: 'Dinar algérien', rateFromEur: 145.5 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Naira nigérian', rateFromEur: 1720 },
  GHS: { code: 'GHS', symbol: '₵', name: 'Cedi ghanéen', rateFromEur: 16.5 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain', rateFromEur: 19.8 },
  AED: { code: 'AED', symbol: 'AED', name: 'Dirham des Émirats', rateFromEur: 4.0 },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Riyal saoudien', rateFromEur: 4.09 },
  QAR: { code: 'QAR', symbol: 'QAR', name: 'Riyal qatarien', rateFromEur: 3.97 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Dollar australien', rateFromEur: 1.66 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'Dollar néo-zélandais', rateFromEur: 1.81 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Yen japonais', rateFromEur: 166 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Yuan chinois', rateFromEur: 7.85 },
  INR: { code: 'INR', symbol: '₹', name: 'Roupie indienne', rateFromEur: 91.5 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Réal brésilien', rateFromEur: 6.2 },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Peso mexicain', rateFromEur: 21.5 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Couronne suédoise', rateFromEur: 11.4 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Couronne norvégienne', rateFromEur: 11.7 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Couronne danoise', rateFromEur: 7.46 },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Zloty polonais', rateFromEur: 4.32 },
  TRY: { code: 'TRY', symbol: '₺', name: 'Livre turque', rateFromEur: 37.5 },
  KRW: { code: 'KRW', symbol: '₩', name: 'Won sud-coréen', rateFromEur: 1500 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Dollar de Singapour', rateFromEur: 1.45 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Dollar de Hong Kong', rateFromEur: 8.48 },
};

export const POPULAR_CURRENCY_CODES = ['EUR', 'XOF', 'USD', 'CAD', 'GBP', 'CHF', 'MAD', 'NGN', 'AED'];

// Liste complète des pays du monde (triés par ordre alphabétique français)
const RAW_COUNTRIES: Array<[string, string, string, string]> = [
  ['AF', 'Afghanistan', '+93', 'USD'],
  ['ZA', 'Afrique du Sud', '+27', 'ZAR'],
  ['AL', 'Albanie', '+355', 'EUR'],
  ['DZ', 'Algérie', '+213', 'DZD'],
  ['DE', 'Allemagne', '+49', 'EUR'],
  ['AD', 'Andorre', '+376', 'EUR'],
  ['AO', 'Angola', '+244', 'USD'],
  ['AG', 'Antigua-et-Barbuda', '+1', 'USD'],
  ['SA', 'Arabie saoudite', '+966', 'SAR'],
  ['AR', 'Argentine', '+54', 'USD'],
  ['AM', 'Arménie', '+374', 'USD'],
  ['AU', 'Australie', '+61', 'AUD'],
  ['AT', 'Autriche', '+43', 'EUR'],
  ['AZ', 'Azerbaïdjan', '+994', 'USD'],
  ['BS', 'Bahamas', '+1', 'USD'],
  ['BH', 'Bahreïn', '+973', 'USD'],
  ['BD', 'Bangladesh', '+880', 'USD'],
  ['BB', 'Barbade', '+1', 'USD'],
  ['BE', 'Belgique', '+32', 'EUR'],
  ['BZ', 'Belize', '+501', 'USD'],
  ['BJ', 'Bénin', '+229', 'XOF'],
  ['BT', 'Bhoutan', '+975', 'INR'],
  ['BY', 'Biélorussie', '+375', 'EUR'],
  ['MM', 'Birmanie (Myanmar)', '+95', 'USD'],
  ['BO', 'Bolivie', '+591', 'USD'],
  ['BA', 'Bosnie-Herzégovine', '+387', 'EUR'],
  ['BW', 'Botswana', '+267', 'USD'],
  ['BR', 'Brésil', '+55', 'BRL'],
  ['BN', 'Brunei', '+673', 'SGD'],
  ['BG', 'Bulgarie', '+359', 'EUR'],
  ['BF', 'Burkina Faso', '+226', 'XOF'],
  ['BI', 'Burundi', '+257', 'USD'],
  ['KH', 'Cambodge', '+855', 'USD'],
  ['CM', 'Cameroun', '+237', 'XAF'],
  ['CA', 'Canada', '+1', 'CAD'],
  ['CV', 'Cap-Vert', '+238', 'EUR'],
  ['CF', 'Centrafrique', '+236', 'XAF'],
  ['CL', 'Chili', '+56', 'USD'],
  ['CN', 'Chine', '+86', 'CNY'],
  ['CY', 'Chypre', '+357', 'EUR'],
  ['CO', 'Colombie', '+57', 'USD'],
  ['KM', 'Comores', '+269', 'EUR'],
  ['CG', 'Congo-Brazzaville', '+242', 'XAF'],
  ['CD', 'Congo-Kinshasa (RDC)', '+243', 'USD'],
  ['KP', 'Corée du Nord', '+850', 'USD'],
  ['KR', 'Corée du Sud', '+82', 'KRW'],
  ['CR', 'Costa Rica', '+506', 'USD'],
  ['CI', "Côte d'Ivoire", '+225', 'XOF'],
  ['HR', 'Croatie', '+385', 'EUR'],
  ['CU', 'Cuba', '+53', 'USD'],
  ['DK', 'Danemark', '+45', 'DKK'],
  ['DJ', 'Djibouti', '+253', 'USD'],
  ['DM', 'Dominique', '+1', 'USD'],
  ['EG', 'Égypte', '+20', 'USD'],
  ['AE', 'Émirats arabes unis', '+971', 'AED'],
  ['EC', 'Équateur', '+593', 'USD'],
  ['ER', 'Érythrée', '+291', 'USD'],
  ['ES', 'Espagne', '+34', 'EUR'],
  ['EE', 'Estonie', '+372', 'EUR'],
  ['SZ', 'Eswatini', '+268', 'ZAR'],
  ['US', 'États-Unis', '+1', 'USD'],
  ['ET', 'Éthiopie', '+251', 'USD'],
  ['FJ', 'Fidji', '+679', 'AUD'],
  ['FI', 'Finlande', '+358', 'EUR'],
  ['FR', 'France', '+33', 'EUR'],
  ['GA', 'Gabon', '+241', 'XAF'],
  ['GM', 'Gambie', '+220', 'USD'],
  ['GE', 'Géorgie', '+995', 'EUR'],
  ['GH', 'Ghana', '+233', 'GHS'],
  ['GR', 'Grèce', '+30', 'EUR'],
  ['GD', 'Grenade', '+1', 'USD'],
  ['GT', 'Guatemala', '+502', 'USD'],
  ['GN', 'Guinée', '+224', 'USD'],
  ['GQ', 'Guinée équatoriale', '+240', 'XAF'],
  ['GW', 'Guinée-Bissau', '+245', 'XOF'],
  ['GY', 'Guyana', '+592', 'USD'],
  ['HT', 'Haïti', '+509', 'USD'],
  ['HN', 'Honduras', '+504', 'USD'],
  ['HK', 'Hong Kong', '+852', 'HKD'],
  ['HU', 'Hongrie', '+36', 'EUR'],
  ['IN', 'Inde', '+91', 'INR'],
  ['ID', 'Indonésie', '+62', 'USD'],
  ['IQ', 'Irak', '+964', 'USD'],
  ['IR', 'Iran', '+98', 'USD'],
  ['IE', 'Irlande', '+353', 'EUR'],
  ['IS', 'Islande', '+354', 'EUR'],
  ['IL', 'Israël', '+972', 'USD'],
  ['IT', 'Italie', '+39', 'EUR'],
  ['JM', 'Jamaïque', '+1', 'USD'],
  ['JP', 'Japon', '+81', 'JPY'],
  ['JO', 'Jordanie', '+962', 'USD'],
  ['KZ', 'Kazakhstan', '+7', 'USD'],
  ['KE', 'Kenya', '+254', 'USD'],
  ['KG', 'Kirghizistan', '+996', 'USD'],
  ['KI', 'Kiribati', '+686', 'AUD'],
  ['KW', 'Koweït', '+965', 'USD'],
  ['LA', 'Laos', '+856', 'USD'],
  ['LS', 'Lesotho', '+266', 'ZAR'],
  ['LV', 'Lettonie', '+371', 'EUR'],
  ['LB', 'Liban', '+961', 'USD'],
  ['LR', 'Liberia', '+231', 'USD'],
  ['LY', 'Libye', '+218', 'USD'],
  ['LI', 'Liechtenstein', '+423', 'CHF'],
  ['LT', 'Lituanie', '+370', 'EUR'],
  ['LU', 'Luxembourg', '+352', 'EUR'],
  ['MK', 'Macédoine du Nord', '+389', 'EUR'],
  ['MG', 'Madagascar', '+261', 'EUR'],
  ['MY', 'Malaisie', '+60', 'USD'],
  ['MW', 'Malawi', '+265', 'USD'],
  ['MV', 'Maldives', '+960', 'USD'],
  ['ML', 'Mali', '+223', 'XOF'],
  ['MT', 'Malte', '+356', 'EUR'],
  ['MA', 'Maroc', '+212', 'MAD'],
  ['MH', 'Marshall (Îles)', '+692', 'USD'],
  ['MU', 'Maurice', '+230', 'EUR'],
  ['MR', 'Mauritanie', '+222', 'EUR'],
  ['MX', 'Mexique', '+52', 'MXN'],
  ['FM', 'Micronésie', '+691', 'USD'],
  ['MD', 'Moldavie', '+373', 'EUR'],
  ['MC', 'Monaco', '+377', 'EUR'],
  ['MN', 'Mongolie', '+976', 'USD'],
  ['ME', 'Monténégro', '+382', 'EUR'],
  ['MZ', 'Mozambique', '+258', 'USD'],
  ['NA', 'Namibie', '+264', 'ZAR'],
  ['NR', 'Nauru', '+674', 'AUD'],
  ['NP', 'Népal', '+977', 'INR'],
  ['NI', 'Nicaragua', '+505', 'USD'],
  ['NE', 'Niger', '+227', 'XOF'],
  ['NG', 'Nigeria', '+234', 'NGN'],
  ['NO', 'Norvège', '+47', 'NOK'],
  ['NZ', 'Nouvelle-Zélande', '+64', 'NZD'],
  ['OM', 'Oman', '+968', 'USD'],
  ['UG', 'Ouganda', '+256', 'USD'],
  ['UZ', 'Ouzbékistan', '+998', 'USD'],
  ['PK', 'Pakistan', '+92', 'USD'],
  ['PW', 'Palaos', '+680', 'USD'],
  ['PS', 'Palestine', '+970', 'USD'],
  ['PA', 'Panama', '+507', 'USD'],
  ['PG', 'Papouasie-Nouvelle-Guinée', '+675', 'AUD'],
  ['PY', 'Paraguay', '+595', 'USD'],
  ['NL', 'Pays-Bas', '+31', 'EUR'],
  ['PE', 'Pérou', '+51', 'USD'],
  ['PH', 'Philippines', '+63', 'USD'],
  ['PL', 'Pologne', '+48', 'PLN'],
  ['PT', 'Portugal', '+351', 'EUR'],
  ['QA', 'Qatar', '+974', 'QAR'],
  ['DO', 'République dominicaine', '+1', 'USD'],
  ['CZ', 'République tchèque', '+420', 'EUR'],
  ['RO', 'Roumanie', '+40', 'EUR'],
  ['GB', 'Royaume-Uni', '+44', 'GBP'],
  ['RU', 'Russie', '+7', 'USD'],
  ['RW', 'Rwanda', '+250', 'USD'],
  ['KN', 'Saint-Christophe-et-Niévès', '+1', 'USD'],
  ['SM', 'Saint-Marin', '+378', 'EUR'],
  ['VC', 'Saint-Vincent-et-les-Grenadines', '+1', 'USD'],
  ['LC', 'Sainte-Lucie', '+1', 'USD'],
  ['SV', 'Salvador', '+503', 'USD'],
  ['WS', 'Samoa', '+685', 'AUD'],
  ['ST', 'Sao Tomé-et-Principe', '+239', 'EUR'],
  ['SN', 'Sénégal', '+221', 'XOF'],
  ['RS', 'Serbie', '+381', 'EUR'],
  ['SC', 'Seychelles', '+248', 'EUR'],
  ['SL', 'Sierra Leone', '+232', 'USD'],
  ['SG', 'Singapour', '+65', 'SGD'],
  ['SK', 'Slovaquie', '+421', 'EUR'],
  ['SI', 'Slovénie', '+386', 'EUR'],
  ['SO', 'Somalie', '+252', 'USD'],
  ['SD', 'Soudan', '+249', 'USD'],
  ['SS', 'Soudan du Sud', '+211', 'USD'],
  ['LK', 'Sri Lanka', '+94', 'USD'],
  ['SE', 'Suède', '+46', 'SEK'],
  ['CH', 'Suisse', '+41', 'CHF'],
  ['SR', 'Suriname', '+597', 'USD'],
  ['SY', 'Syrie', '+963', 'USD'],
  ['TJ', 'Tadjikistan', '+992', 'USD'],
  ['TW', 'Taïwan', '+886', 'USD'],
  ['TZ', 'Tanzanie', '+255', 'USD'],
  ['TD', 'Tchad', '+235', 'XAF'],
  ['TH', 'Thaïlande', '+66', 'USD'],
  ['TL', 'Timor oriental', '+670', 'USD'],
  ['TG', 'Togo', '+228', 'XOF'],
  ['TO', 'Tonga', '+676', 'AUD'],
  ['TT', 'Trinité-et-Tobago', '+1', 'USD'],
  ['TN', 'Tunisie', '+216', 'TND'],
  ['TM', 'Turkménistan', '+993', 'USD'],
  ['TR', 'Turquie', '+90', 'TRY'],
  ['TV', 'Tuvalu', '+688', 'AUD'],
  ['UA', 'Ukraine', '+380', 'EUR'],
  ['UY', 'Uruguay', '+598', 'USD'],
  ['VU', 'Vanuatu', '+678', 'AUD'],
  ['VA', 'Vatican', '+39', 'EUR'],
  ['VE', 'Venezuela', '+58', 'USD'],
  ['VN', 'Viêt Nam', '+84', 'USD'],
  ['YE', 'Yémen', '+967', 'USD'],
  ['ZM', 'Zambie', '+260', 'USD'],
  ['ZW', 'Zimbabwe', '+263', 'USD'],
];

export const WORLD_COUNTRIES: WorldCountry[] = RAW_COUNTRIES.map(([code, name, dial, currency]) => ({
  code,
  name,
  dial,
  currency,
}));

export function findCountryByName(name?: string): WorldCountry {
  if (name) {
    const normalized = name.trim().toLowerCase();
    const match = WORLD_COUNTRIES.find((c) => c.name.toLowerCase() === normalized);
    if (match) return match;
  }
  return WORLD_COUNTRIES.find((c) => c.code === 'FR') || WORLD_COUNTRIES[0];
}

const CURRENCY_STORAGE_KEY = 'benilink_currency';
const CURRENCY_EVENT = 'benilink-currency-change';

export function getUserCurrency(): string {
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved && CURRENCIES[saved]) return saved;
  } catch {
    // Ignore storage error
  }
  return 'EUR';
}

export function setUserCurrency(code: string): void {
  const safe = CURRENCIES[code] ? code : 'EUR';
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, safe);
  } catch {
    // Ignore storage error
  }
  window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: safe }));
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<string>(() => getUserCurrency());

  useEffect(() => {
    const sync = () => setCurrencyState(getUserCurrency());
    window.addEventListener(CURRENCY_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CURRENCY_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    currency,
    meta: CURRENCIES[currency] || CURRENCIES.EUR,
    setCurrency: setUserCurrency,
  };
}

export function formatConvertedMoney(amountEur: number, currencyCode?: string): string {
  const code = currencyCode && CURRENCIES[currencyCode] ? currencyCode : getUserCurrency();
  const meta = CURRENCIES[code] || CURRENCIES.EUR;
  const converted = Math.round(amountEur * meta.rateFromEur);
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: meta.code,
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    return `${converted.toLocaleString('fr-FR')} ${meta.symbol}`;
  }
}

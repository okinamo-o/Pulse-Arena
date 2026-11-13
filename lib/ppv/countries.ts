export interface CountryInfo {
  code: string;
  name: string;
}

export function normalizeLookupKey(value?: string): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function countryFlagUrl(code?: string): string {
  if (!code) return "";
  const clean = code.trim().toLowerCase();
  if (!/^[a-z]{2}(?:-[a-z]{3})?$/.test(clean)) return "";
  return `https://flagcdn.com/w160/${clean}.png`;
}

// [iso2-or-subdivision-code, canonical display name, ...aliases]
const RAW_COUNTRIES: ReadonlyArray<readonly [string, string, ...string[]]> = [
  ["af", "Afghanistan"],
  ["al", "Albania"],
  ["dz", "Algeria"],
  ["as", "American Samoa"],
  ["ad", "Andorra"],
  ["ao", "Angola"],
  ["ai", "Anguilla"],
  ["ag", "Antigua and Barbuda"],
  ["ar", "Argentina"],
  ["am", "Armenia"],
  ["aw", "Aruba"],
  ["au", "Australia"],
  ["at", "Austria"],
  ["az", "Azerbaijan"],
  ["bs", "Bahamas", "The Bahamas"],
  ["bh", "Bahrain"],
  ["bd", "Bangladesh"],
  ["bb", "Barbados"],
  ["by", "Belarus"],
  ["be", "Belgium"],
  ["bz", "Belize"],
  ["bj", "Benin"],
  ["bm", "Bermuda"],
  ["bt", "Bhutan"],
  ["bo", "Bolivia"],
  ["ba", "Bosnia and Herzegovina", "Bosnia-Herzegovina", "Bosnia Herzegovina", "Bosnia"],
  ["bw", "Botswana"],
  ["br", "Brazil", "Brasil"],
  ["vg", "British Virgin Islands"],
  ["bn", "Brunei", "Brunei Darussalam"],
  ["bg", "Bulgaria"],
  ["bf", "Burkina Faso"],
  ["bi", "Burundi"],
  ["kh", "Cambodia"],
  ["cm", "Cameroon"],
  ["ca", "Canada"],
  ["cv", "Cape Verde", "Cabo Verde"],
  ["ky", "Cayman Islands"],
  ["cf", "Central African Republic", "CAR"],
  ["td", "Chad"],
  ["cl", "Chile"],
  ["cn", "China", "China PR"],
  ["tw", "Chinese Taipei", "Taiwan"],
  ["co", "Colombia"],
  ["km", "Comoros"],
  ["cg", "Congo", "Republic of the Congo", "Congo Republic", "Congo-Brazzaville"],
  ["cd", "DR Congo", "Congo DR", "Democratic Republic of the Congo", "D.R. Congo", "Congo Kinshasa"],
  ["ck", "Cook Islands"],
  ["cr", "Costa Rica"],
  ["hr", "Croatia"],
  ["cu", "Cuba"],
  ["cw", "Curacao", "Curaçao"],
  ["cy", "Cyprus"],
  ["cz", "Czechia", "Czech Republic"],
  ["dk", "Denmark"],
  ["dj", "Djibouti"],
  ["dm", "Dominica"],
  ["do", "Dominican Republic"],
  ["ec", "Ecuador"],
  ["eg", "Egypt"],
  ["sv", "El Salvador"],
  ["gb-eng", "England"],
  ["gq", "Equatorial Guinea"],
  ["er", "Eritrea"],
  ["ee", "Estonia"],
  ["sz", "Eswatini", "Swaziland"],
  ["et", "Ethiopia"],
  ["fo", "Faroe Islands"],
  ["fj", "Fiji"],
  ["fi", "Finland"],
  ["fr", "France"],
  ["gf", "French Guiana"],
  ["ga", "Gabon"],
  ["gm", "Gambia", "The Gambia"],
  ["ge", "Georgia"],
  ["de", "Germany"],
  ["gh", "Ghana"],
  ["gi", "Gibraltar"],
  ["gb", "Great Britain", "United Kingdom", "UK", "Britain"],
  ["gr", "Greece"],
  ["gd", "Grenada"],
  ["gp", "Guadeloupe"],
  ["gu", "Guam"],
  ["gt", "Guatemala"],
  ["gn", "Guinea"],
  ["gw", "Guinea-Bissau", "Guinea Bissau"],
  ["gy", "Guyana"],
  ["ht", "Haiti"],
  ["hn", "Honduras"],
  ["hk", "Hong Kong", "Hong Kong SAR"],
  ["hu", "Hungary"],
  ["is", "Iceland"],
  ["in", "India"],
  ["id", "Indonesia"],
  ["ir", "Iran", "IR Iran"],
  ["iq", "Iraq"],
  ["ie", "Ireland", "Republic of Ireland"],
  ["il", "Israel"],
  ["it", "Italy"],
  ["ci", "Ivory Coast", "Cote d'Ivoire", "Côte d'Ivoire", "Cote d Ivoire"],
  ["jm", "Jamaica"],
  ["jp", "Japan"],
  ["jo", "Jordan"],
  ["kz", "Kazakhstan"],
  ["ke", "Kenya"],
  ["ki", "Kiribati"],
  ["xk", "Kosovo"],
  ["kw", "Kuwait"],
  ["kg", "Kyrgyzstan", "Kyrgyz Republic"],
  ["la", "Laos"],
  ["lv", "Latvia"],
  ["lb", "Lebanon"],
  ["ls", "Lesotho"],
  ["lr", "Liberia"],
  ["ly", "Libya"],
  ["li", "Liechtenstein"],
  ["lt", "Lithuania"],
  ["lu", "Luxembourg"],
  ["mo", "Macau", "Macao"],
  ["mg", "Madagascar"],
  ["mw", "Malawi"],
  ["my", "Malaysia"],
  ["mv", "Maldives"],
  ["ml", "Mali"],
  ["mt", "Malta"],
  ["mq", "Martinique"],
  ["mr", "Mauritania"],
  ["mu", "Mauritius"],
  ["mx", "Mexico"],
  ["md", "Moldova", "Republic of Moldova"],
  ["mc", "Monaco"],
  ["mn", "Mongolia"],
  ["me", "Montenegro"],
  ["ms", "Montserrat"],
  ["ma", "Morocco"],
  ["mz", "Mozambique"],
  ["mm", "Myanmar", "Burma"],
  ["na", "Namibia"],
  ["np", "Nepal"],
  ["nl", "Netherlands", "Holland", "The Netherlands"],
  ["nc", "New Caledonia"],
  ["nz", "New Zealand"],
  ["ni", "Nicaragua"],
  ["ne", "Niger"],
  ["ng", "Nigeria"],
  ["kp", "North Korea", "Korea DPR", "DPR Korea"],
  ["mk", "North Macedonia", "Macedonia", "FYR Macedonia"],
  ["gb-nir", "Northern Ireland"],
  ["no", "Norway"],
  ["om", "Oman"],
  ["pk", "Pakistan"],
  ["ps", "Palestine"],
  ["pa", "Panama"],
  ["pg", "Papua New Guinea"],
  ["py", "Paraguay"],
  ["pe", "Peru"],
  ["ph", "Philippines"],
  ["pl", "Poland"],
  ["pt", "Portugal"],
  ["pr", "Puerto Rico"],
  ["qa", "Qatar"],
  ["re", "Reunion", "Réunion"],
  ["ro", "Romania"],
  ["ru", "Russia"],
  ["rw", "Rwanda"],
  ["kn", "Saint Kitts and Nevis", "St. Kitts and Nevis", "St Kitts and Nevis"],
  ["lc", "Saint Lucia", "St. Lucia", "St Lucia"],
  ["vc", "Saint Vincent and the Grenadines", "St. Vincent and the Grenadines", "St Vincent"],
  ["ws", "Samoa"],
  ["sm", "San Marino"],
  ["st", "Sao Tome and Principe", "São Tomé and Príncipe"],
  ["sa", "Saudi Arabia", "KSA"],
  ["gb-sct", "Scotland"],
  ["sn", "Senegal"],
  ["rs", "Serbia"],
  ["sc", "Seychelles"],
  ["sl", "Sierra Leone"],
  ["sg", "Singapore"],
  ["sk", "Slovakia", "Slovak Republic"],
  ["si", "Slovenia"],
  ["sb", "Solomon Islands"],
  ["so", "Somalia"],
  ["za", "South Africa"],
  ["kr", "South Korea", "Korea Republic", "Republic of Korea"],
  ["ss", "South Sudan"],
  ["es", "Spain"],
  ["lk", "Sri Lanka"],
  ["sd", "Sudan"],
  ["sr", "Suriname"],
  ["se", "Sweden"],
  ["ch", "Switzerland"],
  ["sy", "Syria"],
  ["pf", "Tahiti", "French Polynesia"],
  ["tj", "Tajikistan"],
  ["tz", "Tanzania"],
  ["th", "Thailand"],
  ["tl", "Timor-Leste", "East Timor"],
  ["tg", "Togo"],
  ["to", "Tonga"],
  ["tt", "Trinidad and Tobago"],
  ["tn", "Tunisia"],
  ["tr", "Turkey", "Turkiye", "Türkiye"],
  ["tm", "Turkmenistan"],
  ["tc", "Turks and Caicos Islands", "Turks and Caicos"],
  ["ug", "Uganda"],
  ["ua", "Ukraine"],
  ["ae", "United Arab Emirates", "UAE"],
  ["us", "United States", "USA", "US", "United States of America", "USMNT", "USWNT"],
  ["uy", "Uruguay"],
  ["vi", "US Virgin Islands", "U.S. Virgin Islands"],
  ["uz", "Uzbekistan"],
  ["vu", "Vanuatu"],
  ["ve", "Venezuela"],
  ["vn", "Vietnam", "Viet Nam"],
  ["gb-wls", "Wales"],
  ["ye", "Yemen"],
  ["zm", "Zambia"],
  ["zw", "Zimbabwe"],
];

const COUNTRY_BY_KEY = new Map<string, CountryInfo>();
const COUNTRY_BY_CODE = new Map<string, string>();

for (const [code, name, ...aliases] of RAW_COUNTRIES) {
  const info: CountryInfo = { code, name };
  COUNTRY_BY_CODE.set(code, name);
  COUNTRY_BY_KEY.set(normalizeLookupKey(name), info);
  for (const alias of aliases) {
    COUNTRY_BY_KEY.set(normalizeLookupKey(alias), info);
  }
}

export function getCountryNameByCode(code?: string): string | undefined {
  if (!code) return undefined;
  return COUNTRY_BY_CODE.get(code.trim().toLowerCase());
}

/**
 * Resolves a participant or country label to its CountryInfo (handling youth/women suffixes like "U21", "Women").
 */
export function resolveCountry(rawName?: string): CountryInfo | undefined {
  const clean = normalizeLookupKey(rawName);
  if (!clean) return undefined;

  const direct = COUNTRY_BY_KEY.get(clean);
  if (direct) return direct;

  const withoutQualifier = clean
    .replace(/\b(u\d{2}|under \d{2}|women|womens|men|mens|national team|wnt|mnt|xi|a team)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (withoutQualifier && withoutQualifier !== clean) {
    return COUNTRY_BY_KEY.get(withoutQualifier);
  }

  return undefined;
}


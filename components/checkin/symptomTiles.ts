export interface SymptomTileData {
  key: string;
  label: string;
  sub: string;
  icon: string;
}

export const BASE_TILES: SymptomTileData[] = [
  { key: 'Fever',     label: 'Fever',     sub: 'High temperature, chills',  icon: 'thermometer-outline' },
  { key: 'Sleep',     label: 'Sleep',     sub: 'Restless, waking up',       icon: 'moon-outline' },
  { key: 'Appetite',  label: 'Appetite',  sub: 'Low intake, refusal',       icon: 'nutrition-outline' },
  { key: 'Energy',    label: 'Energy',    sub: 'Lethargic, quiet',          icon: 'flash-outline' },
  { key: 'Cough',     label: 'Cough',     sub: 'Dry or chesty',             icon: 'medical-outline' },
  { key: 'Skin',      label: 'Skin',      sub: 'Rash, redness, spots',      icon: 'body-outline' },
  { key: 'Stomach',   label: 'Stomach',   sub: 'Pain, nausea, vomiting',    icon: 'sad-outline' },
  { key: 'Breathing', label: 'Breathing', sub: 'Fast or laboured',          icon: 'pulse-outline' },
];

export const BRACKET_TILES: Record<string, string[]> = {
  NEWBORN:       ['Fever', 'Appetite', 'Breathing', 'Skin', 'Sleep', 'Energy'],
  EARLY_INFANT:  ['Fever', 'Appetite', 'Cough', 'Skin', 'Sleep', 'Stomach'],
  INFANT:        ['Fever', 'Appetite', 'Cough', 'Skin', 'Sleep', 'Stomach'],
  TODDLER_EARLY: ['Fever', 'Appetite', 'Cough', 'Stomach', 'Sleep', 'Skin'],
  TODDLER:       ['Fever', 'Stomach', 'Cough', 'Skin', 'Appetite', 'Sleep'],
  PRESCHOOL:     ['Fever', 'Stomach', 'Cough', 'Sleep', 'Appetite', 'Energy'],
  SCHOOL_EARLY:  ['Fever', 'Stomach', 'Energy', 'Sleep', 'Cough', 'Skin'],
  SCHOOL_MID:    ['Fever', 'Stomach', 'Energy', 'Sleep', 'Cough', 'Skin'],
  ADOLESCENT:    ['Energy', 'Stomach', 'Fever', 'Sleep', 'Cough', 'Skin'],
};

export function getTiles(bracket: string | null): SymptomTileData[] {
  const keys = BRACKET_TILES[bracket ?? 'TODDLER'] ?? BRACKET_TILES.TODDLER;
  return keys.map((k) => BASE_TILES.find((t) => t.key === k)!).filter(Boolean);
}

export type WageRow = {
  occupation: string;
  occupation_alt?: string[];
  group?: string;
  stats: Record<string, number | null>;
  source: { sheet: string; row: number };
  year: number;
}

export type SearchIndex = {
  occupation: string;
  tokens: string[];
  rowIndex: number;
}

export type SearchResult = {
  item: WageRow;
  score: number;
}

export type SearchSuggestion = {
  occupation: string;
  score: number;
  rowIndex: number;
}

export type IngestConfig = {
  requiredTokens: string[];
  synonyms: Record<string, string[]>;
}

export type ExcelCell = {
  v?: any;
  t?: string;
  f?: string;
  h?: string;
  w?: string;
}

export type ExcelWorksheet = {
  [key: string]: ExcelCell | any;
}

export type MultiYearWageData = {
  occupation: string;
  group?: string;
  yearlyData: {
    year: number;
    stats: Record<string, number | null>;
    source: { sheet: string; row: number };
  }[];
}

export type WageTrendPoint = {
  year: number;
  wage: number | null;
  formattedWage: string;
}

export type WageGrowthStats = {
  totalChange: number;
  totalChangePercent: number;
  averageAnnualGrowth: number;
  bestYear: number;
  worstYear: number;
}
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import type { WageRow, SearchIndex, ExcelWorksheet } from '../lib/types';

const WAGE_TOKENS = ['gross', 'wage', 'income', 'median', 'p25', 'p75', 'mean', 'monthly', 'hourly'];
const EXCEL_PATH = path.join(process.cwd(), 'data', 'Median Wage 2024.xlsx');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const WAGES_OUTPUT = path.join(OUTPUT_DIR, 'wages.json');
const INDEX_OUTPUT = path.join(OUTPUT_DIR, 'index.json');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function hasWageTokens(text: string): boolean {
  const lowerText = text.toLowerCase();
  return WAGE_TOKENS.some(token => lowerText.includes(token));
}

function getCellValue(cell: any): string {
  if (!cell) return '';
  if (cell.v !== undefined) return String(cell.v).trim();
  if (cell.w !== undefined) return String(cell.w).trim();
  return '';
}

function parseNumber(value: string): number | null {
  if (!value || value === '') return null;
  
  const cleaned = value.toString()
    .replace(/[$,\s]/g, '')
    .replace(/[^\d.-]/g, '');
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function buildColumnName(headerRows: string[][], colIndex: number): string {
  const parts: string[] = [];
  
  for (let rowIndex = headerRows.length - 2; rowIndex < headerRows.length; rowIndex++) {
    if (rowIndex >= 0 && headerRows[rowIndex] && headerRows[rowIndex][colIndex]) {
      const value = headerRows[rowIndex][colIndex].trim();
      if (value && !value.startsWith('Unnamed') && !parts.includes(value)) {
        parts.push(value);
      }
    }
  }
  
  return parts.join(' – ') || `Column ${colIndex + 1}`;
}

function detectHeaderRows(worksheet: ExcelWorksheet): { headerRows: string[][]; dataStartRow: number } {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
  const headerRows: string[][] = [];
  let dataStartRow = 1;
  
  for (let row = 0; row <= Math.min(5, range.e.r); row++) {
    const rowData: string[] = [];
    let hasContent = false;
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellRef];
      const value = getCellValue(cell);
      rowData[col] = value;
      if (value) hasContent = true;
    }
    
    if (hasContent) {
      headerRows.push(rowData);
      if (rowData.some(cell => hasWageTokens(cell))) {
        dataStartRow = row + 1;
      }
    }
  }
  
  return { headerRows, dataStartRow };
}

function generateTokens(occupation: string): string[] {
  const tokens = new Set<string>();
  const normalized = occupation.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = normalized.split(' ').filter(w => w.length > 1);
  
  words.forEach(word => {
    tokens.add(word);
    
    if (word.endsWith('s') && word.length > 3) {
      tokens.add(word.slice(0, -1));
    }
    if (!word.endsWith('s') && word.length > 2) {
      tokens.add(word + 's');
    }
  });
  
  for (let i = 0; i < words.length - 1; i++) {
    tokens.add(words[i] + ' ' + words[i + 1]);
  }
  
  for (let i = 0; i < words.length - 2; i++) {
    tokens.add(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
  }
  
  return Array.from(tokens);
}

function generateSynonyms(): Record<string, string[]> {
  return {
    'software engineer': ['developer', 'programmer', 'software developer', 'coder'],
    'developer': ['software engineer', 'programmer', 'software developer'],
    'salesperson': ['sales associate', 'sales representative', 'sales rep'],
    'sales associate': ['salesperson', 'sales representative', 'sales rep'],
    'nurse': ['registered nurse', 'nursing professional', 'rn'],
    'teacher': ['educator', 'instructor', 'professor'],
    'manager': ['supervisor', 'team lead', 'team leader'],
    'analyst': ['data analyst', 'business analyst', 'research analyst'],
    'consultant': ['advisor', 'specialist', 'expert'],
    'technician': ['tech', 'specialist', 'support specialist']
  };
}

async function processExcelFile(): Promise<{ wages: WageRow[]; index: SearchIndex[] }> {
  console.log('Reading Excel file:', EXCEL_PATH);
  
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Excel file not found: ${EXCEL_PATH}`);
  }
  
  const workbook = XLSX.readFile(EXCEL_PATH);
  const wages: WageRow[] = [];
  const occupationMap = new Map<string, WageRow>();
  
  console.log('Processing sheets:', workbook.SheetNames);
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const { headerRows, dataStartRow } = detectHeaderRows(worksheet);
    
    if (headerRows.length === 0) continue;
    
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
    const columnHeaders: string[] = [];
    const grossColumns: number[] = [];
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const columnName = buildColumnName(headerRows, col);
      columnHeaders[col] = columnName;
      
      if (hasWageTokens(columnName)) {
        grossColumns.push(col);
      }
    }
    
    if (grossColumns.length === 0) {
      console.log(`Skipping sheet ${sheetName}: no wage columns found`);
      continue;
    }
    
    console.log(`Processing sheet ${sheetName} with ${grossColumns.length} wage columns`);
    
    for (let row = dataStartRow; row <= range.e.r; row++) {
      let occupationCol = -1;
      let occupation = '';
      
      for (let col = range.s.c; col <= Math.min(range.s.c + 3, range.e.c); col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellRef];
        const value = getCellValue(cell);
        
        if (value && value.length > 3 && !hasWageTokens(value)) {
          const numValue = parseNumber(value);
          if (numValue === null || numValue < 10) {
            occupation = value;
            occupationCol = col;
            break;
          }
        }
      }
      
      if (!occupation) continue;
      
      const stats: Record<string, number | null> = {};
      let hasValidStats = false;
      
      for (const col of grossColumns) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellRef];
        const value = getCellValue(cell);
        const numValue = parseNumber(value);
        
        stats[columnHeaders[col]] = numValue;
        if (numValue !== null) hasValidStats = true;
      }
      
      if (!hasValidStats) continue;
      
      const normalizedOccupation = occupation.toLowerCase().trim();
      const existingWage = occupationMap.get(normalizedOccupation);
      
      if (existingWage) {
        const existingStatsCount = Object.values(existingWage.stats).filter(v => v !== null).length;
        const newStatsCount = Object.values(stats).filter(v => v !== null).length;
        
        if (newStatsCount > existingStatsCount) {
          occupationMap.set(normalizedOccupation, {
            occupation,
            stats,
            source: { sheet: sheetName, row: row + 1 }
          });
        }
      } else {
        occupationMap.set(normalizedOccupation, {
          occupation,
          stats,
          source: { sheet: sheetName, row: row + 1 }
        });
      }
    }
  }
  
  const wagesArray = Array.from(occupationMap.values());
  console.log(`Processed ${wagesArray.length} unique occupations`);
  
  const index: SearchIndex[] = wagesArray.map((wage, index) => ({
    occupation: wage.occupation,
    tokens: generateTokens(wage.occupation),
    rowIndex: index
  }));
  
  return { wages: wagesArray, index };
}

async function main() {
  try {
    console.log('Starting Excel ingestion...');
    ensureOutputDir();
    
    const { wages, index } = await processExcelFile();
    
    console.log('Writing output files...');
    fs.writeFileSync(WAGES_OUTPUT, JSON.stringify(wages, null, 2));
    fs.writeFileSync(INDEX_OUTPUT, JSON.stringify(index, null, 2));
    
    console.log(`✅ Successfully processed ${wages.length} wage records`);
    console.log(`📁 Output files:`);
    console.log(`   - ${WAGES_OUTPUT}`);
    console.log(`   - ${INDEX_OUTPUT}`);
    
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
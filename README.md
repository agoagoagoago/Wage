# Gross Wage Lookup

A modern, minimalist web application for looking up gross wage statistics by occupation. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Smart Search**: Fuzzy search with autocomplete suggestions and synonym support
- **Excel Integration**: Automatically ingests data from Excel files with intelligent header detection
- **Responsive Design**: Clean, minimalist UI that works on all devices
- **Dark Mode**: Automatic dark/light mode based on system preference with manual toggle
- **Export Options**: Copy to clipboard and CSV download functionality
- **Accessibility**: Full keyboard navigation and screen reader support

## Quick Start

```bash
# Install dependencies
npm install

# Place your Excel file at /data/Median Wage 2024.xlsx

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Prepare Your Data

Place your Excel file containing wage data at:
```
/data/Median Wage 2024.xlsx
```

The ingestion script will automatically:
- Detect sheets containing wage data (looks for keywords: gross, wage, income, median, p25, p75, mean, monthly, hourly)
- Handle merged headers and multi-row headers
- Extract occupation names and wage statistics
- Generate search indices for fast lookup

### 3. Run Data Ingestion

```bash
npm run ingest
```

This will generate:
- `/public/data/wages.json` - Main wage data
- `/public/data/index.json` - Search index for fast lookups

### 4. Start Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
npm start
```

## Replacing the Excel File

To use a different Excel file:

1. Replace the file at `/data/Median Wage 2024.xlsx`
2. Update the filename in `scripts/ingest.ts` if needed
3. Run the ingestion script: `npm run ingest`
4. Restart the development server

The ingestion script is designed to work with various Excel formats by automatically detecting:
- Sheets with wage-related data
- Column headers (including merged cells)
- Occupation names in the first few columns
- Numeric wage data

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run ingest` - Process Excel data
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Project Structure

```
├── app/
│   ├── api/search/route.ts    # Search API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── Results.tsx            # Results display component
│   └── SearchBox.tsx          # Search input with autocomplete
├── lib/
│   ├── search.ts              # Search logic and Fuse.js integration
│   └── types.ts               # TypeScript type definitions
├── scripts/
│   └── ingest.ts              # Excel ingestion script
├── data/
│   └── Median Wage 2024.xlsx  # Source Excel file
├── public/data/
│   ├── wages.json             # Generated wage data
│   └── index.json             # Generated search index
└── __tests__/
    └── search.test.ts         # Unit tests
```

## Data Format

### Input (Excel)
The application expects Excel files with:
- Headers containing wage-related keywords
- Occupation names in early columns
- Numeric wage data in subsequent columns

### Output (JSON)
```typescript
type WageRow = {
  occupation: string;          // "Software Engineer"
  occupation_alt?: string[];   // Alternative names
  group?: string;              // Industry/category
  stats: Record<string, number | null>; // { "Gross – Median": 75000 }
  source: { sheet: string; row: number }; // Source reference
}
```

## Search Features

- **Fuzzy Matching**: Handles typos and partial matches
- **Synonym Support**: "software engineer" ↔ "developer"
- **Token Expansion**: Automatic plurals and variants
- **Debounced Suggestions**: 200ms delay for responsive UX
- **Keyboard Navigation**: Full arrow key and Enter support

## Customization

### Adding Synonyms
Edit the synonyms object in `lib/search.ts`:

```typescript
const synonyms = {
  'software engineer': ['developer', 'programmer'],
  // Add more mappings
};
```

### Styling
The app uses Tailwind CSS with a system font stack. Key classes:
- `bg-white dark:bg-gray-900` for adaptive backgrounds
- `text-gray-900 dark:text-white` for adaptive text
- Consistent spacing with `p-4`, `mb-8`, etc.

### Search Configuration
Adjust Fuse.js settings in `lib/search.ts`:

```typescript
const fuse = new Fuse(index, {
  threshold: 0.4,    // Lower = more strict
  distance: 100,     // Character distance for matches
  keys: [
    { name: 'occupation', weight: 0.7 },
    { name: 'tokens', weight: 0.3 }
  ]
});
```

## Testing

### Unit Tests
```bash
npm test
```

Tests cover:
- Search functionality and scoring
- Header detection and normalization
- Number parsing (currency symbols, commas)
- CSV export functionality

### End-to-End Tests
```bash
npm run test:e2e
```

Tests cover:
- Full user workflows
- Keyboard navigation
- Dark mode toggle
- Search and results display

## Performance

- **Lazy Loading**: Search data loads on first interaction
- **Debounced Input**: 200ms delay prevents excessive API calls
- **Optimized Bundle**: Minimal dependencies and tree shaking
- **Static Generation**: Fast page loads with Next.js SSG

## Browser Support

- Modern browsers with ES2020 support
- Responsive design for mobile and desktop
- Follows web accessibility guidelines (WCAG)

## License

MIT License - feel free to use this project as a template for your own wage lookup applications.
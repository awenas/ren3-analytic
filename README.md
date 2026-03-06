# ReN3 AnalyticDB Analytics Frontend

ReN3-style analytics platform with ReN3 branding.

## Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles + CSS variables
├── components/
│   ├── Header.tsx         # Top navigation bar with ReN3 logo
│   ├── Sidebar.tsx        # File explorer + table list
│   ├── EditorPanel.tsx    # Monaco SQL editor
│   ├── ResultsPanel.tsx    # Results table + lineage graph
│   ├── SchemaPanel.tsx    # Table schema viewer
│   └── TerminalBar.tsx    # Console output
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Features

- **File Explorer** - Navigate models, metrics, tests, and tables
- **SQL Editor** - Monaco editor with syntax highlighting
- **Results Table** - Query results with export options
- **Lineage Graph** - D3.js visualization of data flow
- **Schema Panel** - View table columns and types
- **Terminal Bar** - Console output display

## Design System

- **ReN3 Purple**: #6B4FBB
- **Node Colors**:
  - Source: #6B7280 (gray)
  - Model: #0D9488 (teal)
  - Metric: #EAB308 (gold)

## API Integration

Connect to backend at http://localhost:3001

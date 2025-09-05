# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server  
- `npm run lint` - Run Next.js linting
- `npm run export` - Build and export static version

## Deployment Commands

- `npm run deploy:vercel` - Deploy to Vercel production
- `npm run deploy:github` - Export and deploy to GitHub Pages

## Architecture Overview

This is the **AGFA Medical Viewer** - a Next.js 14 application for viewing DICOM medical images and PDF reports from AGFA CD data.

### Core Architecture

- **Framework**: Next.js 14 with React 19, TypeScript, Tailwind CSS v4
- **Medical Libraries**: 
  - `dwv` (DICOM Web Viewer) for medical image viewing
  - `react-pdf` for radiology report display
- **UI System**: shadcn/ui components with Radix UI primitives
- **Deployment**: Static export architecture (no server required)

### Key Components Structure

```
app/
├── page.tsx              # Main viewer application entry point
└── layout.tsx           # Root layout with providers

components/
├── dicom-viewer.tsx              # DICOM image viewer with DWV
├── pdf-report-viewer.tsx         # PDF report display
├── study-browser.tsx             # Study navigation/filtering
├── patient-info.tsx              # Patient demographics display  
├── medical-dashboard.tsx         # Main dashboard layout
├── responsive-viewer-layout.tsx  # Responsive layout handler
└── ui/                          # shadcn/ui components

lib/
├── types.ts            # TypeScript definitions for medical data
├── data-parser.ts      # Medical data loading/parsing utilities
└── utils.ts           # General utilities
```

### Data Structure

Application expects AGFA CD data in `public/data/`:
```
public/data/
├── DICOM/              # DICOM files organized by study accession
├── REPORTS/            # PDF radiology reports  
└── data.json          # Patient/study metadata (optional)
```

### Component Architecture

- **MedicalDashboard**: Main layout orchestrator
- **DicomViewer**: Handles DICOM image display using DWV library
- **StudyBrowser**: Provides study selection, search, and filtering
- **PatientInfo**: Displays patient demographics and study information
- **ResponsiveViewerLayout**: Manages desktop/mobile layout switching

### Technical Patterns

- Client-side only processing (no server dependencies)
- Static data loading from public directory structure
- Responsive design with mobile-first approach
- TypeScript throughout with strict type checking
- shadcn/ui design system with Tailwind CSS v4

### Path Aliases

- `@/components` → components/
- `@/lib` → lib/
- `@/ui` → components/ui/

### Medical Data Flow

1. Application loads from `loadMedicalData()` in data-parser.ts
2. Attempts to load structured data.json or falls back to directory scanning
3. DICOM files processed through DWV for image rendering
4. PDF reports handled through react-pdf viewer
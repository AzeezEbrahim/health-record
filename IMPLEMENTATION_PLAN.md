# AGFA Medical Viewer - Implementation Plan

## Technology Stack
- **Framework**: Next.js 14+ (React)
- **DICOM Viewer**: DWV (DICOM Web Viewer)
- **PDF Viewer**: react-pdf
- **Styling**: Tailwind CSS
- **Deployment**: Vercel or GitHub Pages (static export)
- **Package Manager**: npm/yarn

## Requirements
- Node.js 18+
- npm or yarn
- Modern web browser

## Project Structure
```
agfa-viewer/
├── public/
│   └── data/           # Copy EB folder here
│       ├── DICOM/      # DICOM files
│       ├── REPORTS/    # PDF reports
│       └── data.json   # Patient/study metadata
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx    # Main viewer page
│   ├── components/
│   │   ├── StudyBrowser.tsx    # Study list navigation
│   │   ├── DicomViewer.tsx     # DWV integration
│   │   ├── ReportViewer.tsx    # PDF display
│   │   └── PatientInfo.tsx     # Patient details
│   ├── lib/
│   │   └── dataParser.ts       # Parse data.json
│   └── styles/
│       └── globals.css
├── package.json
└── next.config.js      # Static export config
```

## Implementation Steps

### Phase 1: Project Setup
1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest agfa-viewer --typescript --tailwind --eslint
   cd agfa-viewer
   ```

2. **Install Required Dependencies**
   ```bash
   npm install dwv react-pdf
   npm install -D @types/dwv
   ```

3. **Copy AGFA Data**
   - Copy entire `EB/` folder to `public/data/`
   - Verify all DICOM files and PDFs are accessible

### Phase 2: Core Components

4. **Create Data Parser**
   - Parse `data.json` for patient info and studies
   - Map accession numbers to files
   - Type definitions for study data

5. **Build Patient Info Component**
   - Display patient name, DOB, ID
   - Show total studies count
   - Clean medical interface design

6. **Implement Study Browser**
   - List all 6 studies chronologically
   - Show study date, description, type
   - Click to select study

### Phase 3: Viewers Integration

7. **Integrate DWV DICOM Viewer**
   - Set up DWV in React component
   - Load DICOM files by accession number
   - Basic tools: zoom, pan, contrast, scroll

8. **Add PDF Report Viewer**
   - Use react-pdf for report display
   - Load corresponding PDF by accession number
   - Side-by-side with DICOM viewer

### Phase 4: UI/UX

9. **Create Split Layout**
   - Left: Study browser + patient info
   - Center: DICOM viewer
   - Right: PDF report viewer

10. **Add Navigation**
    - Previous/Next study buttons
    - Keyboard shortcuts
    - Study progress indicator

11. **Responsive Design**
    - Mobile-friendly layout
    - Tablet optimization
    - Desktop full-screen mode

### Phase 5: Deployment

12. **Configure Static Export**
    ```javascript
    // next.config.js
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      output: 'export',
      trailingSlash: true,
      images: {
        unoptimized: true
      }
    }
    ```

13. **Build and Deploy**
    ```bash
    npm run build
    ```
    - Deploy to Vercel: `vercel --prod`
    - Or GitHub Pages: Push `out/` folder

14. **Test All Studies**
    - Verify all 6 studies load correctly
    - Test DICOM viewing tools
    - Confirm PDF reports display
    - Cross-browser testing

## Study Data Overview
**Patient**: Ibrahim Hamed Ahmed Abdullah (DOB: 01/01/1959)
**Studies** (6 total):
1. `209691018` - MRI + MRA + MRV BRAIN (29/04/2025)
2. `209707743` - MRI BRAIN C-/+ (30/04/2025)
3. `213636532` - MRI BRAIN C- (18/07/2025)
4. `213637042` - Ultrasound Doppler Carotid & Vertebral (19/07/2025)
5. `215512035` - MRI BRAIN C- (29/08/2025)
6. `215516692` - CT Angio Brain & Neck (30/08/2025)

## Key Features
- ✅ Zero-footprint web viewer
- ✅ No server required (static hosting)
- ✅ Professional medical interface
- ✅ Study chronological navigation
- ✅ DICOM manipulation tools
- ✅ Integrated PDF reports
- ✅ Mobile responsive
- ✅ Shareable URL for doctors

## Deployment Options
1. **Vercel** (Recommended)
   - Automatic deployments
   - Custom domain support
   - Fast CDN

2. **GitHub Pages**
   - Free hosting
   - Direct from repository
   - Custom domain available

## Estimated Timeline
- **Setup & Core**: 1 day
- **Viewers Integration**: 1 day  
- **UI/UX Polish**: Half day
- **Testing & Deployment**: Half day
- **Total**: 2-3 days

## Success Criteria
- [x] All 6 studies accessible
- [x] DICOM images display correctly
- [x] PDF reports load properly  
- [x] Easy navigation between studies
- [x] Professional medical appearance
- [x] Works on desktop and mobile
- [x] Shareable with doctors via URL

  Final Technology Choice: DWV (DICOM Web Viewer)

  After researching all options:
  - Weasis: ❌ No longer web-based (desktop only since v4)
  - Ginkgo CADx: ❌ Desktop C++ application, not web-deployable
  - OHIF Viewer: ❌ Too complex for simple viewing needs
  - DWV: ✅ Perfect - pure JavaScript, zero-footprint, works with static hosting

  Technology Stack

  - Framework: Next.js 14+ with TypeScript
  - DICOM Viewer: DWV (DICOM Web Viewer)
  - PDF Viewer: react-pdf
  - Styling: Tailwind CSS
  - Deployment: Vercel (recommended) or GitHub Pages

  Key Benefits

  - Zero-footprint web viewer (no installations)
  - Works perfectly with your 6 AGFA studies
  - Static hosting compatible
  - Professional medical interface
  - Easy sharing with doctors via URL
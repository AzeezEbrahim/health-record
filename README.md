# AGFA Medical Viewer

A professional web-based DICOM and medical report viewer built with Next.js, designed for viewing AGFA CD medical imaging data.

## Features

- **DICOM Viewer**: Professional medical image viewing with DWV integration
- **PDF Report Viewer**: Integrated radiology report display
- **Study Browser**: Advanced navigation with search, filtering, and sorting
- **Patient Information**: Comprehensive patient data display
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Static Deployment**: Zero-server architecture for easy hosting

## Technology Stack

- **Framework**: Next.js 14+ with React 19
- **DICOM Viewer**: DWV (DICOM Web Viewer)
- **PDF Viewer**: react-pdf
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS v4
- **TypeScript**: Full type safety

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   \`\`\`bash
   git clone <repository-url>
   cd agfa-medical-viewer
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Add your AGFA data**
   \`\`\`bash
   # Create data directory
   mkdir -p public/data
   
   # Copy your AGFA CD contents to public/data/
   # Expected structure:
   # public/data/
   # ├── DICOM/           # DICOM files organized by study
   # ├── REPORTS/         # PDF reports
   # └── data.json        # Patient and study metadata
   \`\`\`

4. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open in browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

## Data Structure

### Expected AGFA Data Format

Place your AGFA CD data in `public/data/` with this structure:

\`\`\`
public/data/
├── DICOM/
│   ├── 209691018/       # Study accession number
│   │   ├── series1/
│   │   │   ├── image001.dcm
│   │   │   └── image002.dcm
│   │   └── series2/
│   └── 209707743/
├── REPORTS/
│   ├── 209691018_report.pdf
│   └── 209707743_report.pdf
└── data.json            # Patient metadata (optional)
\`\`\`

### Sample data.json

\`\`\`json
{
  "patient": {
    "name": "Patient Name",
    "birthDate": "1959-01-01",
    "patientId": "PATIENT_001"
  },
  "studies": [
    {
      "accessionNumber": "209691018",
      "studyDate": "2025-04-29",
      "studyDescription": "MRI BRAIN",
      "modality": "MR",
      "seriesData": [
        {
          "seriesNumber": "1",
          "seriesDescription": "T1 Axial",
          "instanceCount": 25,
          "dicomFiles": ["DICOM/209691018/series1/image001.dcm"]
        }
      ],
      "reportPath": "REPORTS/209691018_report.pdf"
    }
  ]
}
\`\`\`

## Deployment

### Option 1: Vercel (Recommended)

1. **Build the project**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Vercel**
   \`\`\`bash
   npm run deploy:vercel
   \`\`\`

   Or use the Vercel dashboard:
   - Connect your GitHub repository
   - Vercel will automatically detect Next.js and deploy

### Option 2: GitHub Pages

1. **Install gh-pages** (if not already installed)
   \`\`\`bash
   npm install -g gh-pages
   \`\`\`

2. **Build and deploy**
   \`\`\`bash
   npm run deploy:github
   \`\`\`

3. **Configure GitHub Pages**
   - Go to repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch

### Option 3: Manual Static Hosting

1. **Build the project**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Upload the `out/` folder**
   - Upload contents of `out/` folder to any static hosting service
   - Supports: Netlify, GitHub Pages, AWS S3, Firebase Hosting, etc.

## Environment Variables

For production deployment, you can set these environment variables:

\`\`\`bash
# For subdirectory deployment (e.g., GitHub Pages)
BASE_PATH=/repository-name
ASSET_PREFIX=/repository-name

# For custom domain
ASSET_PREFIX=https://your-domain.com
\`\`\`

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: WebAssembly, ES2020, CSS Grid, Flexbox

## File Size Considerations

- **DICOM Files**: Optimized loading with progressive display
- **PDF Reports**: Lazy loading and pagination
- **Bundle Size**: ~2MB gzipped (including medical libraries)
- **Recommended**: Host on CDN for better performance

## Security Notes

- **Client-Side Only**: All processing happens in the browser
- **No Server**: No patient data transmitted to external servers
- **Local Storage**: Data remains on the hosting domain
- **HTTPS Required**: Use HTTPS for production deployment

## Troubleshooting

### Common Issues

1. **DICOM files not loading**
   - Ensure files are in `public/data/DICOM/`
   - Check file permissions and CORS headers
   - Verify DICOM file format compatibility

2. **PDF reports not displaying**
   - Confirm PDF files are in `public/data/REPORTS/`
   - Check PDF file integrity
   - Ensure react-pdf worker is loading

3. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed

4. **Mobile performance**
   - Large DICOM files may load slowly on mobile
   - Consider image compression for mobile optimization
   - Use WiFi for initial data loading

## Development

### Project Structure

\`\`\`
src/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main viewer page
│   └── globals.css      # Global styles
├── components/
│   ├── dicom-viewer.tsx         # DICOM image viewer
│   ├── pdf-report-viewer.tsx    # PDF report display
│   ├── study-browser.tsx        # Study navigation
│   ├── patient-info.tsx         # Patient information
│   ├── mobile-navigation.tsx    # Mobile UI
│   └── responsive-viewer-layout.tsx
├── lib/
│   ├── types.ts         # TypeScript definitions
│   └── data-parser.ts   # Data processing utilities
└── components/ui/       # shadcn/ui components
\`\`\`

### Adding New Features

1. **Custom Tools**: Extend DICOM viewer tools in `dicom-viewer.tsx`
2. **Report Formats**: Add support for other report formats
3. **Data Sources**: Modify `data-parser.ts` for different data structures
4. **Themes**: Customize medical color schemes in `globals.css`

## License

This project is built for medical imaging professionals. Ensure compliance with local healthcare data regulations (HIPAA, GDPR, etc.) when deploying with patient data.

## Support

For technical issues:
1. Check the troubleshooting section above
2. Verify browser compatibility
3. Test with sample DICOM data first
4. Check browser console for error messages

---

**Note**: This viewer is designed for educational and professional use. Always follow your institution's guidelines for medical data handling and patient privacy.

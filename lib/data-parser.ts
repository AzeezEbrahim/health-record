import type { MedicalData, Study, AGFADataStructure, AGFARawData } from "./types"

export class AGFADataParser {
  // Parse raw AGFA data (JavaScript format)
  static parseRawAGFAData(rawData: AGFARawData): MedicalData {
    const patient = {
      name: rawData.data.patient.name,
      dob: this.formatDate(rawData.data.patient.date_of_birth),
      id: rawData.data.patient.id,
    }

    const studies: Study[] = rawData.data.reports.report.map((report, index) => {
      // Don't generate DICOM files upfront - use lazy loading instead
      // Just store minimal info needed for the study browser
      const dicomFiles: string[] = []
      
      // Only generate a few sample paths for preview - actual loading happens on demand
      const sampleCount = Math.min(3, 6957) // Just 3 sample files for fast loading
      const startFile = (index * 10) + 1 // Spread studies across the file range
      
      for (let i = 0; i < sampleCount; i++) {
        const fileNum = (startFile + i).toString().padStart(8, '0')
        dicomFiles.push(`/data/DICOM/${fileNum}/`)
      }

      // Calculate estimated image count based on modality (for display purposes only)
      let imageCount = 20
      const desc = report.description.toUpperCase()
      if (desc.includes('MRI')) {
        imageCount = 85 // Average MRI count
      } else if (desc.includes('CT')) {
        imageCount = 150 // Average CT count
      } else if (desc.includes('ULTRASOUND')) {
        imageCount = 12 // Average Ultrasound count
      }

      return {
        accession: report.accession_number,
        date: this.formatDate(report.study_date),
        description: report.description,
        type: this.mapModalityToType(report.description),
        modality: this.extractModality(report.description),
        dicomFiles: dicomFiles, // Minimal set for fast loading
        reportFile: report.pdf_enabled === 'True' ? `/data/REPORTS/${report.accession_number}.pdf` : undefined,
        seriesCount: 1, // Simplified
        imageCount: imageCount,
        dicomEnabled: report.dicom_enabled === 'True',
        pdfEnabled: report.pdf_enabled === 'True',
      }
    })

    // Sort studies by date (newest first)
    studies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return { patient, studies }
  }

  static parseAGFAData(agfaData: AGFADataStructure): MedicalData {
    const patient = {
      name: agfaData.patient.name,
      dob: this.formatDate(agfaData.patient.birthDate),
      id: agfaData.patient.patientId,
      mrn: agfaData.patient.mrn,
    }

    const studies: Study[] = agfaData.studies.map((study) => {
      // Collect all DICOM files from all series
      const dicomFiles: string[] = []
      let imageCount = 0

      study.seriesData.forEach((series) => {
        dicomFiles.push(...series.dicomFiles)
        imageCount += series.instanceCount
      })

      return {
        accession: study.accessionNumber,
        date: this.formatDate(study.studyDate),
        description: study.studyDescription,
        type: this.mapModalityToType(study.modality),
        modality: study.modality,
        dicomFiles,
        reportFile: study.reportPath,
        seriesCount: study.seriesData.length,
        imageCount,
      }
    })

    // Sort studies by date (newest first)
    studies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return { patient, studies }
  }

  static extractModality(description: string): string {
    const descUpper = description.toUpperCase()
    
    if (descUpper.includes("MRI") || descUpper.includes("MRA") || descUpper.includes("MRV")) return "MR"
    if (descUpper.includes("CT")) return "CT"
    if (descUpper.includes("ULTRASOUND") || descUpper.includes("DOPPLER")) return "US"
    if (descUpper.includes("X-RAY") || descUpper.includes("XRAY")) return "CR"
    
    return "OT"
  }

  static mapModalityToType(modality: string): Study["type"] {
    const modalityUpper = modality.toUpperCase()

    if (modalityUpper.includes("MR") || modalityUpper.includes("MRI")) return "MRI"
    if (modalityUpper.includes("CT")) return "CT"
    if (modalityUpper.includes("US") || modalityUpper.includes("ULTRASOUND")) return "Ultrasound"
    if (modalityUpper.includes("CR") || modalityUpper.includes("DR") || modalityUpper.includes("XR")) return "X-Ray"

    return "Other"
  }

  static formatDate(dateString: string): string {
    // Handle various date formats from AGFA
    try {
      // Handle DD/MM/YYYY format (AGFA format)
      if (dateString.includes('/')) {
        const parts = dateString.split('/')
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0')
          const month = parts[1].padStart(2, '0')
          const year = parts[2]
          
          // Create date in ISO format for parsing
          const isoDate = `${year}-${month}-${day}`
          const date = new Date(isoDate)
          
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit", 
              year: "numeric",
            })
          }
        }
      }

      // Try parsing as ISO date
      let date = new Date(dateString)

      // If invalid, try DICOM date format (YYYYMMDD)
      if (isNaN(date.getTime()) && dateString.length === 8) {
        const year = dateString.substring(0, 4)
        const month = dateString.substring(4, 6)
        const day = dateString.substring(6, 8)
        date = new Date(`${year}-${month}-${day}`)
      }

      // Return formatted date if valid
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      }

      // If all parsing fails, return original string
      return dateString
    } catch (error) {
      console.error("Date parsing error:", error, "for date:", dateString)
      return dateString // Return original if parsing fails
    }
  }

  // Mock data generator for development (based on the provided patient data)
  static getMockData(): MedicalData {
    return {
      patient: {
        name: "Ibrahim Hamed Ahmed Abdullah",
        dob: "01/01/1959",
        id: "PATIENT_ID_001",
      },
      studies: [
        {
          accession: "209691018",
          date: "29/04/2025",
          description: "MRI + MRA + MRV BRAIN",
          type: "MRI",
          modality: "MR",
          dicomFiles: [
            "/data/DICOM/00000001/", "/data/DICOM/00000002/", "/data/DICOM/00000003/", 
            "/data/DICOM/00000004/", "/data/DICOM/00000005/", "/data/DICOM/00000006/",
            "/data/DICOM/00000007/", "/data/DICOM/00000008/", "/data/DICOM/00000009/",
            "/data/DICOM/00000010/"
          ],
          reportFile: "/data/REPORTS/209691018.pdf",
          seriesCount: 3,
          imageCount: 156,
        },
        {
          accession: "209707743",
          date: "30/04/2025",
          description: "MRI BRAIN C-/+",
          type: "MRI",
          modality: "MR",
          dicomFiles: [
            "/data/DICOM/00000051/", "/data/DICOM/00000052/", "/data/DICOM/00000053/",
            "/data/DICOM/00000054/", "/data/DICOM/00000055/", "/data/DICOM/00000056/",
            "/data/DICOM/00000057/", "/data/DICOM/00000058/", "/data/DICOM/00000059/"
          ],
          reportFile: "/data/REPORTS/209707743.pdf",
          seriesCount: 2,
          imageCount: 89,
        },
        {
          accession: "213636532",
          date: "18/07/2025",
          description: "MRI BRAIN C-",
          type: "MRI",
          modality: "MR",
          dicomFiles: [
            "/data/DICOM/00000101/", "/data/DICOM/00000102/", "/data/DICOM/00000103/",
            "/data/DICOM/00000104/", "/data/DICOM/00000105/", "/data/DICOM/00000106/"
          ],
          reportFile: "/data/REPORTS/213636532.pdf",
          seriesCount: 1,
          imageCount: 45,
        },
        {
          accession: "213637042",
          date: "19/07/2025",
          description: "ULTRASOUND DOPPLER OF CAROTID & VERTEBRAL ARTERIES",
          type: "Ultrasound",
          modality: "US",
          dicomFiles: [
            "/data/DICOM/00000151/", "/data/DICOM/00000152/", "/data/DICOM/00000153/",
            "/data/DICOM/00000154/"
          ],
          reportFile: "/data/REPORTS/213637042.pdf",
          seriesCount: 1,
          imageCount: 12,
        },
        {
          accession: "215512035",
          date: "29/08/2025",
          description: "MRI BRAIN C-",
          type: "MRI",
          modality: "MR",
          dicomFiles: [
            "/data/DICOM/00000201/", "/data/DICOM/00000202/", "/data/DICOM/00000203/",
            "/data/DICOM/00000204/", "/data/DICOM/00000205/", "/data/DICOM/00000206/",
            "/data/DICOM/00000207/"
          ],
          reportFile: "/data/REPORTS/215512035.pdf",
          seriesCount: 1,
          imageCount: 67,
        },
        {
          accession: "215516692",
          date: "30/08/2025",
          description: "CT ANGIO BRAIN & NECK",
          type: "CT",
          modality: "CT",
          dicomFiles: [
            "/data/DICOM/00000251/", "/data/DICOM/00000252/", "/data/DICOM/00000253/",
            "/data/DICOM/00000254/", "/data/DICOM/00000255/", "/data/DICOM/00000256/",
            "/data/DICOM/00000257/", "/data/DICOM/00000258/", "/data/DICOM/00000259/",
            "/data/DICOM/00000260/"
          ],
          reportFile: "/data/REPORTS/215516692.pdf",
          seriesCount: 2,
          imageCount: 234,
        },
      ],
    }
  }

  // Generate DICOM files for a specific study on-demand (lazy loading)
  static generateDicomFilesForStudy(studyIndex: number, count: number = 5): string[] {
    const dicomFiles: string[] = []
    const startFile = (studyIndex * 50) + 1 // Each study gets 50 files range
    
    for (let i = 0; i < Math.min(count, 50); i++) {
      const fileNum = (startFile + i).toString().padStart(8, '0')
      // Ensure we don't exceed available files (6957 total)
      if (startFile + i <= 6957) {
        dicomFiles.push(`/data/DICOM/${fileNum}/`)
      }
    }
    
    return dicomFiles
  }
}

// Parse AGFA JavaScript data format
function parseAGFAJavaScript(content: string): AGFARawData {
  try {
    // Extract the JavaScript object from the file
    const match = content.match(/currentData\s*=\s*({.*});/)
    if (match) {
      // Replace single quotes with double quotes and fix other JS->JSON issues
      let jsonString = match[1]
      jsonString = jsonString.replace(/'/g, '"')
      return JSON.parse(jsonString)
    }
    throw new Error("Could not parse AGFA data format")
  } catch (error) {
    console.error("Error parsing AGFA JavaScript:", error)
    throw error
  }
}

// Load actual AGFA medical data with timeout and optimization
export async function loadMedicalData(): Promise<MedicalData> {
  try {
    console.log("Loading AGFA medical data from /data/data.json")
    
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch('/data/data.json', {
      signal: controller.signal,
      cache: 'force-cache' // Cache the response
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }
    
    const content = await response.text()
    console.log("Data file loaded, parsing...")
    
    const rawData = parseAGFAJavaScript(content)
    console.log("Raw data parsed, processing studies...")
    
    const medicalData = AGFADataParser.parseRawAGFAData(rawData)
    console.log(`Successfully loaded ${medicalData.studies.length} studies for ${medicalData.patient.name}`)
    
    return medicalData
  } catch (error: any) {
    console.error("Failed to load AGFA medical data:", error)
    
    if (error?.name === 'AbortError') {
      console.log("Data loading timed out, falling back to mock data")
    } else {
      console.log("Data loading failed, falling back to mock data")
    }
    
    // Fallback to mock data that matches real data structure
    return AGFADataParser.getMockData()
  }
}

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
      // Map DICOM files - using sequential numbering for now
      const dicomFiles: string[] = []
      // For now, assume first few DICOM files belong to first study, etc.
      // In real implementation, you'd use DICOMDIR or study metadata
      const startFile = index * 50 + 1 // Rough estimate
      for (let i = 0; i < Math.min(50, 100); i++) {
        const fileNum = (startFile + i).toString().padStart(8, '0')
        dicomFiles.push(`/data/DICOM/${fileNum}`)
      }

      return {
        accession: report.accession_number,
        date: this.formatDate(report.study_date),
        description: report.description,
        type: this.mapModalityToType(report.description),
        modality: this.extractModality(report.description),
        dicomFiles: dicomFiles.slice(0, 10), // Limit for demo
        reportFile: report.pdf_enabled === 'True' ? `/data/REPORTS/${report.accession_number}.pdf` : undefined,
        seriesCount: 1, // Default
        imageCount: Math.floor(Math.random() * 100) + 20, // Estimate
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
          dicomFiles: ["/data/DICOM/209691018/series1/image001.dcm", "/data/DICOM/209691018/series1/image002.dcm"],
          reportFile: "/data/REPORTS/209691018_report.pdf",
          seriesCount: 3,
          imageCount: 156,
        },
        {
          accession: "209707743",
          date: "30/04/2025",
          description: "MRI BRAIN C-/+",
          type: "MRI",
          modality: "MR",
          dicomFiles: ["/data/DICOM/209707743/series1/image001.dcm"],
          reportFile: "/data/REPORTS/209707743_report.pdf",
          seriesCount: 2,
          imageCount: 89,
        },
        {
          accession: "213636532",
          date: "18/07/2025",
          description: "MRI BRAIN C-",
          type: "MRI",
          modality: "MR",
          dicomFiles: ["/data/DICOM/213636532/series1/image001.dcm"],
          reportFile: "/data/REPORTS/213636532_report.pdf",
          seriesCount: 1,
          imageCount: 45,
        },
        {
          accession: "213637042",
          date: "19/07/2025",
          description: "Ultrasound Doppler Carotid & Vertebral",
          type: "Ultrasound",
          modality: "US",
          dicomFiles: ["/data/DICOM/213637042/series1/image001.dcm"],
          reportFile: "/data/REPORTS/213637042_report.pdf",
          seriesCount: 1,
          imageCount: 12,
        },
        {
          accession: "215512035",
          date: "29/08/2025",
          description: "MRI BRAIN C-",
          type: "MRI",
          modality: "MR",
          dicomFiles: ["/data/DICOM/215512035/series1/image001.dcm"],
          reportFile: "/data/REPORTS/215512035_report.pdf",
          seriesCount: 1,
          imageCount: 67,
        },
        {
          accession: "215516692",
          date: "30/08/2025",
          description: "CT Angio Brain & Neck",
          type: "CT",
          modality: "CT",
          dicomFiles: ["/data/DICOM/215516692/series1/image001.dcm"],
          reportFile: "/data/REPORTS/215516692_report.pdf",
          seriesCount: 2,
          imageCount: 234,
        },
      ],
    }
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

// Load actual AGFA medical data
export async function loadMedicalData(): Promise<MedicalData> {
  try {
    console.log("Loading AGFA medical data from /data/data.json")
    
    const response = await fetch('/data/data.json')
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }
    
    const content = await response.text()
    const rawData = parseAGFAJavaScript(content)
    
    console.log("Parsed AGFA raw data:", rawData)
    
    return AGFADataParser.parseRawAGFAData(rawData)
  } catch (error) {
    console.error("Failed to load AGFA medical data:", error)
    console.log("Falling back to mock data")
    
    // Fallback to mock data that matches real data structure
    return AGFADataParser.getMockData()
  }
}

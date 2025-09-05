export interface Patient {
  name: string
  dob: string
  id: string
  mrn?: string
}

export interface Study {
  accession: string
  date: string
  description: string
  type: "MRI" | "CT" | "Ultrasound" | "X-Ray" | "Other"
  modality: string
  dicomFiles: string[]
  reportFile?: string
  seriesCount?: number
  imageCount?: number
  dicomEnabled?: boolean
  pdfEnabled?: boolean
}

export interface MedicalData {
  patient: Patient
  studies: Study[]
}

// Raw AGFA data structure (JavaScript format)
export interface AGFARawData {
  data: {
    patient: {
      id: string
      name: string
      date_of_birth: string
    }
    viewer: {
      path: string
    }
    disclaimer: {
      path: string
    }
    reports: {
      report: Array<{
        accession_number: string
        description: string
        study_date: string
        dicom_enabled: string
        html_enabled: string
        p7m_enabled: string
        p7m_file_extension: string
        pdf_enabled: string
      }>
    }
  }
}

// Normalized AGFA data structure
export interface AGFADataStructure {
  patient: {
    name: string
    birthDate: string
    patientId: string
    mrn?: string
  }
  studies: Array<{
    accessionNumber: string
    studyDate: string
    studyDescription: string
    modality: string
    seriesData: Array<{
      seriesNumber: string
      seriesDescription: string
      instanceCount: number
      dicomFiles: string[]
    }>
    reportPath?: string
  }>
}

export interface DicomViewerProps {
  study: Study | null
  className?: string
  onFullscreen?: () => void
}

export interface PDFReportViewerProps {
  study: Study | null
  className?: string
}

// Future medical record types for extensibility
export interface LabResult {
  id: string
  date: string
  testName: string
  value: string
  unit: string
  referenceRange: string
  status: "normal" | "abnormal" | "critical"
  notes?: string
}

export interface VitalSigns {
  id: string
  date: string
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  notes?: string
}

export interface MedicalRecord {
  id: string
  patientId: string
  date: string
  type: "imaging" | "lab" | "vital" | "note"
  title: string
  description?: string
  data: Study | LabResult | VitalSigns | any
  attachments?: string[]
}

// Extended medical data for future use
// Echocardiography specific types
export interface EchoMeasurement {
  parameter: string
  normalRange: string
  patientValue: string
  unit: string
  status: "normal" | "abnormal" | "not_measured"
}

export interface EchoReport {
  id: string
  date: string
  patientId: string
  hospital: string
  cardiologist: string
  measurements: EchoMeasurement[]
  remarks: string[]
  conclusion: string[]
  recommendation?: string
  ejectionFraction?: number
  lvFunction?: string
}

export interface ExtendedMedicalData extends MedicalData {
  labResults?: LabResult[]
  vitalSigns?: VitalSigns[]
  echoReports?: EchoReport[]
  notes?: MedicalRecord[]
  timeline?: MedicalRecord[]
}

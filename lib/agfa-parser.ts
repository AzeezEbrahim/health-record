// AGFA IHE_PDI Structure Parser
// Parses the INDEX.HTM file to extract correct series and image mappings

export interface AGFASeries {
  htmlFile: string // e.g., "00000011.htm"
  seriesNumber: number // e.g., 11
  seriesId: string // e.g., "202"
  title: string // e.g., "dADC"
  imageCount: number // e.g., 25
  thumbnailStart: string // e.g., "00000011.00001.jpg"
  studyAccession: string // e.g., "209691018"
}

export interface AGFAStudyData {
  accession: string
  title: string
  date: string
  series: AGFASeries[]
}

export class AGFAParser {
  static async parseIndexFile(): Promise<AGFAStudyData[]> {
    try {
      const response = await fetch('/data/INDEX.HTM')
      const content = await response.text()
      
      return this.parseIndexContent(content)
    } catch (error) {
      console.error("Failed to load INDEX.HTM:", error)
      return []
    }
  }

  static parseIndexContent(content: string): AGFAStudyData[] {
    const studies: AGFAStudyData[] = []
    
    // Extract study blocks
    const studyRegex = /<div id="(\d+)" class="menu-item alpha"><h4>([^<]+)<\/h4><p[^>]*>Study (\d+) of ([^<]+)<\/p><ul>(.*?)<\/ul><\/div>/gs
    
    let match
    while ((match = studyRegex.exec(content)) !== null) {
      const [, accession, title, , date, seriesContent] = match
      
      // Parse series within this study
      const series = this.parseSeriesContent(seriesContent, accession)
      
      studies.push({
        accession,
        title: title.trim(),
        date: date.trim(),
        series
      })
    }
    
    return studies
  }

  static parseSeriesContent(seriesContent: string, studyAccession: string): AGFASeries[] {
    const series: AGFASeries[] = []
    
    // Extract series links - look for IHE_PDI HTML files with thumbnails
    const seriesRegex = /<a target="maincontent" href="IHE_PDI\/(\d+)\.htm"><img src="([^"]*)"[^>]*\/>Series (\d+)\[([^\]]*)\] : (\d+)<br>([^<]*)<\/a>/g
    
    let match
    while ((match = seriesRegex.exec(seriesContent)) !== null) {
      const [, htmlFile, thumbnailSrc, seriesNumber, seriesId, imageCount, title] = match
      
      // Only include series that have actual images (imageCount > 0)
      const count = parseInt(imageCount)
      if (count > 0 && thumbnailSrc && !thumbnailSrc.includes('visibility: hidden')) {
        // Extract thumbnail filename to determine image start
        const thumbnailMatch = thumbnailSrc.match(/THUMBS\/(\d+)\.00001\.jpg/)
        const thumbnailStart = thumbnailMatch ? thumbnailMatch[1] + '.00001.jpg' : ''
        
        series.push({
          htmlFile: htmlFile + '.htm',
          seriesNumber: parseInt(seriesNumber),
          seriesId: seriesId.trim(),
          title: title.trim(),
          imageCount: count,
          thumbnailStart,
          studyAccession
        })
      }
    }
    
    return series
  }

  // Generate image URLs for a specific series
  static generateImageURLsForSeries(series: AGFASeries): { images: string[], thumbnails: string[] } {
    const images: string[] = []
    const thumbnails: string[] = []
    
    if (!series.thumbnailStart) {
      return { images, thumbnails }
    }
    
    // Extract the starting image number from thumbnail
    const match = series.thumbnailStart.match(/(\d+)\.00001\.jpg/)
    if (!match) {
      return { images, thumbnails }
    }
    
    const startImageNum = parseInt(match[1])
    
    // Generate image URLs based on the pattern
    for (let i = 0; i < series.imageCount; i++) {
      const imageNum = (startImageNum + i).toString().padStart(8, '0')
      images.push(`/data/IHE_PDI/IMAGES/${imageNum}.00001.jpg`)
      thumbnails.push(`/data/IHE_PDI/THUMBS/${imageNum}.00001.jpg`)
    }
    
    return { images, thumbnails }
  }

  // Get series data for a specific study
  static async getStudySeriesData(studyAccession: string): Promise<AGFASeries[]> {
    const studies = await this.parseIndexFile()
    const study = studies.find(s => s.accession === studyAccession)
    return study ? study.series : []
  }

  // Get all available studies
  static async getAllStudies(): Promise<AGFAStudyData[]> {
    return this.parseIndexFile()
  }
}

// Helper function to test if an image exists
export async function testImageExists(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

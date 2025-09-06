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

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export class AGFAParser {
  static async parseIndexFile(): Promise<AGFAStudyData[]> {
    try {
      const response = await fetch(`${BASE_PATH}/data/INDEX.HTM`)
      const content = await response.text()
      
      return this.parseIndexContent(content)
    } catch (error) {
      console.error("Failed to load INDEX.HTM:", error)
      return []
    }
  }

  static parseIndexContent(content: string): AGFAStudyData[] {
    const studies: AGFAStudyData[] = []
    
    // Split content by study divs and process each
    const studyDivs = content.split('<div id="').filter(div => div.includes('class="menu-item alpha"'))
    
    for (const div of studyDivs) {
      try {
        // Extract accession number
        const accessionMatch = div.match(/^(\d+)"/)
        if (!accessionMatch) continue
        const accession = accessionMatch[1]
        
        // Extract title
        const titleMatch = div.match(/<h4>([^<]+)<\/h4>/)
        if (!titleMatch) continue
        const title = titleMatch[1].trim()
        
        // Extract date
        const dateMatch = div.match(/Study \d+ of ([^<]+)<\/p>/)
        if (!dateMatch) continue
        const date = dateMatch[1].trim()
        
        // Extract series content
        const ulMatch = div.match(/<ul>(.*?)<\/ul>/)
        if (!ulMatch) continue
        const seriesContent = ulMatch[1]
        
        // Parse series within this study
        const series = this.parseSeriesContent(seriesContent, accession)
        
        studies.push({
          accession,
          title,
          date,
          series
        })
      } catch (err) {
        console.warn("Error parsing study div:", err)
        continue
      }
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
          seriesId: seriesId.trim(), // This is the SerNr shown in AGFA viewer (like "904", "203", etc.)
          title: title.trim(),
          imageCount: count,
          thumbnailStart,
          studyAccession
        })
      }
    }
    
    // Sort by series ID number for consistent ordering (matches AGFA viewer)
    series.sort((a, b) => {
      const aId = parseInt(a.seriesId) || 0
      const bId = parseInt(b.seriesId) || 0
      return bId - aId // Descending order to match AGFA viewer
    })
    
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
      images.push(`${BASE_PATH}/data/IHE_PDI/IMAGES/${imageNum}.00001.jpg`)
      thumbnails.push(`${BASE_PATH}/data/IHE_PDI/THUMBS/${imageNum}.00001.jpg`)
    }
    
    return { images, thumbnails }
  }

  // Get series data for a specific study by reading HTML files directly
  static async getStudySeriesData(studyAccession: string): Promise<AGFASeries[]> {
    try {
      // First get the study range from INDEX.HTM
      const studies = await this.parseIndexFile()
      const study = studies.find(s => s.accession === studyAccession)
      
      if (!study || study.series.length === 0) {
        console.log(`No series found in INDEX.HTM for study ${studyAccession}`)
        return []
      }

      // Now read each HTML file to get the exact SerNr from the title
      const seriesWithCorrectSerNr: AGFASeries[] = []
      
      for (const series of study.series) {
        try {
          // Read the HTML file to get the real SerNr from title
          const response = await fetch(`${BASE_PATH}/data/IHE_PDI/${series.htmlFile}`)
          const htmlContent = await response.text()
          
          // Extract SerNr and title from HTML title tag
          const titleMatch = htmlContent.match(/<title>(\d+)\s+([^<]+)<\/title>/)
          if (titleMatch) {
            const [, serNr, seriesTitle] = titleMatch
            
            seriesWithCorrectSerNr.push({
              ...series,
              seriesId: serNr, // Use the real SerNr from HTML title
              title: seriesTitle.trim()
            })
          } else {
            // Fallback to original data
            seriesWithCorrectSerNr.push(series)
          }
        } catch (err) {
          console.warn(`Failed to read HTML file ${series.htmlFile}:`, err)
          // Use original series data as fallback
          seriesWithCorrectSerNr.push(series)
        }
      }

      // Sort by SerNr in descending order to match AGFA viewer
      seriesWithCorrectSerNr.sort((a, b) => {
        const aSerNr = parseInt(a.seriesId) || 0
        const bSerNr = parseInt(b.seriesId) || 0
        return bSerNr - aSerNr
      })

      console.log(`Loaded ${seriesWithCorrectSerNr.length} series for study ${studyAccession}:`)
      seriesWithCorrectSerNr.forEach(s => {
        console.log(`  SerNr: ${s.seriesId} - ${s.title} (${s.imageCount} images)`)
      })

      return seriesWithCorrectSerNr
    } catch (err) {
      console.error("Error getting study series data:", err)
      return []
    }
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

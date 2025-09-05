// DWV Library Loader with robust error handling
export class DWVLoader {
  private static instance: DWVLoader
  private isLoaded = false
  private isLoading = false
  private loadPromise: Promise<boolean> | null = null

  static getInstance(): DWVLoader {
    if (!DWVLoader.instance) {
      DWVLoader.instance = new DWVLoader()
    }
    return DWVLoader.instance
  }

  async loadDWV(): Promise<boolean> {
    // If already loaded, return true
    if (this.isLoaded && window.dwv) {
      return true
    }

    // If currently loading, wait for existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise
    }

    // Start loading
    this.isLoading = true
    this.loadPromise = this.performLoad()
    
    const result = await this.loadPromise
    this.isLoading = false
    
    return result
  }

  private async performLoad(): Promise<boolean> {
    try {
      // Check if DWV is already available
      if (window.dwv) {
        console.log("DWV already available globally")
        this.isLoaded = true
        return true
      }

      // Try multiple CDN sources for better reliability
      const cdnSources = [
        "https://unpkg.com/dwv@0.33.5/dist/dwv.min.js",
        "https://cdn.jsdelivr.net/npm/dwv@0.33.5/dist/dwv.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/dwv/0.33.5/dwv.min.js"
      ]

      for (const src of cdnSources) {
        try {
          console.log(`Attempting to load DWV from: ${src}`)
          const success = await this.loadScript(src)
          if (success && window.dwv) {
            console.log("DWV loaded successfully from:", src)
            this.isLoaded = true
            return true
          }
        } catch (error) {
          console.warn(`Failed to load DWV from ${src}:`, error)
          continue
        }
      }

      throw new Error("Failed to load DWV from all CDN sources")
    } catch (error) {
      console.error("DWV loading failed:", error)
      this.isLoaded = false
      return false
    }
  }

  private loadScript(src: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${src}"]`)
      if (existingScript) {
        // Script exists, check if DWV is available
        if (window.dwv) {
          resolve(true)
          return
        }
        // Wait a bit and check again
        setTimeout(() => {
          resolve(!!window.dwv)
        }, 1000)
        return
      }

      const script = document.createElement("script")
      script.src = src
      script.async = false // Load synchronously to ensure proper initialization
      script.crossOrigin = "anonymous"
      
      const timeout = setTimeout(() => {
        reject(new Error("Script loading timeout"))
      }, 10000) // 10 second timeout

      script.onload = () => {
        clearTimeout(timeout)
        // Wait a bit for DWV to initialize
        setTimeout(() => {
          if (window.dwv) {
            resolve(true)
          } else {
            reject(new Error("DWV not available after script load"))
          }
        }, 500)
      }

      script.onerror = (error) => {
        clearTimeout(timeout)
        reject(new Error(`Script loading error: ${error}`))
      }

      document.head.appendChild(script)
    })
  }

  isDWVLoaded(): boolean {
    return this.isLoaded && !!window.dwv
  }

  getDWV(): any {
    return window.dwv
  }
}

// Global DWV types
declare global {
  interface Window {
    dwv: any
  }
}

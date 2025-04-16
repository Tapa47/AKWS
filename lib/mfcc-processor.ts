// This is a mock implementation for demo purposes
// In a real application, this would use a WebAssembly module or connect to a backend service

interface KeywordResult {
  keyword: string
  start: number
  end: number
  confidence: number
}

// Mock MFCC processing
export async function detectKeywords(audioFile: File, threshold: number, useMfcc: boolean): Promise<KeywordResult[]> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Get audio duration
  const audioDuration = await getAudioDuration(audioFile)

  // Mock keywords to detect
  const keywords = ["hello", "thanks", "goodbye", "yes", "no"]

  // Generate mock results
  const results: KeywordResult[] = []

  // Generate 3-8 random detections
  const detectionCount = Math.floor(Math.random() * 6) + 3

  for (let i = 0; i < detectionCount; i++) {
    // Pick a random keyword
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]

    // Generate random start time
    const start = Math.random() * (audioDuration - 1)
    const duration = 0.3 + Math.random() * 0.7
    const end = Math.min(start + duration, audioDuration)

    // Generate confidence score
    // If MFCC is enabled, bias toward higher confidence
    const baseConfidence = useMfcc ? 0.6 + Math.random() * 0.4 : 0.3 + Math.random() * 0.7
    const confidence = baseConfidence * (threshold > 0.5 ? 1.2 : 0.8)

    // Only include if confidence is above threshold
    if (confidence >= threshold) {
      results.push({
        keyword,
        start,
        end,
        confidence,
      })
    }
  }

  // Sort by start time
  return results.sort((a, b) => a.start - b.start)
}

export async function trainModel(
  modelType: string,
  languages: string[],
  progressCallback: (progress: number) => void,
): Promise<void> {
  // Simulate training process
  let progress = 0

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      progress += Math.random() * 5

      if (progress >= 100) {
        clearInterval(interval)
        progressCallback(100)
        resolve()
      } else {
        progressCallback(progress)
      }
    }, 300)
  })
}

async function getAudioDuration(audioFile: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.src = URL.createObjectURL(audioFile)

    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration
      URL.revokeObjectURL(audio.src)
      resolve(duration)
    })

    // Fallback in case loadedmetadata doesn't fire
    setTimeout(() => {
      URL.revokeObjectURL(audio.src)
      resolve(30) // Default to 30 seconds
    }, 1000)
  })
}

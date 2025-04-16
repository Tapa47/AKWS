// This is a mock implementation for demo purposes
// In a real application, this would connect to a database

interface Keyword {
  id: string
  text: string
  language: string
  audioUrl: string
}

// Mock database
let KEYWORDS: Keyword[] = [
  {
    id: "1",
    text: "hello",
    language: "en",
    audioUrl: "/placeholder.svg?height=30&width=100",
  },
  {
    id: "2",
    text: "thank you",
    language: "en",
    audioUrl: "/placeholder.svg?height=30&width=100",
  },
  {
    id: "3",
    text: "hola",
    language: "es",
    audioUrl: "/placeholder.svg?height=30&width=100",
  },
]

export async function getKeywords(language?: string): Promise<Keyword[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (language) {
    return KEYWORDS.filter((kw) => kw.language === language)
  }

  return KEYWORDS
}

export async function addKeyword(text: string, language: string, audioFile: File): Promise<Keyword> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, we would upload the audio file to a storage service
  // and get a URL back. Here we'll just create a placeholder URL.
  const audioUrl = URL.createObjectURL(audioFile)

  const newKeyword: Keyword = {
    id: String(KEYWORDS.length + 1),
    text,
    language,
    audioUrl,
  }

  KEYWORDS.push(newKeyword)
  return newKeyword
}

export async function deleteKeyword(id: string): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  KEYWORDS = KEYWORDS.filter((kw) => kw.id !== id)
}

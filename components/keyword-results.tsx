"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

interface KeywordResult {
  keyword: string
  start: number
  end: number
  confidence: number
}

interface KeywordResultsProps {
  results: KeywordResult[]
  audioRef: React.RefObject<HTMLAudioElement>
}

const KeywordResults: React.FC<KeywordResultsProps> = ({ results, audioRef }) => {
  const handlePlaySegment = (start: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = start
      audioRef.current.play()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800"
    if (confidence >= 0.5) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-4">
      {results.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No keywords detected</div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-md border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{result.keyword}</span>
                  <Badge variant="outline" className={getConfidenceColor(result.confidence)}>
                    {Math.round(result.confidence * 100)}%
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">
                  {formatTime(result.start)} - {formatTime(result.end)}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handlePlaySegment(result.start)}>
                <Play className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default KeywordResults

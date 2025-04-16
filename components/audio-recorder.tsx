"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, AudioWaveformIcon as Waveform } from "lucide-react"
import { Card } from "@/components/ui/card"

interface AudioRecorderProps {
  isRecording: boolean
  setIsRecording: (isRecording: boolean) => void
  onRecordingComplete: (blob: Blob) => void
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ isRecording, setIsRecording, onRecordingComplete }) => {
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    chunksRef.current = []
    setAudioBlob(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" })
        setAudioBlob(blob)
        onRecordingComplete(blob)

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 flex flex-col items-center justify-center">
        {isRecording ? (
          <div className="flex flex-col items-center">
            <Waveform className="h-16 w-16 text-red-500 animate-pulse mb-2" />
            <div className="text-lg font-medium">{formatTime(recordingTime)}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Mic className="h-16 w-16 text-gray-400 mb-2" />
            <div className="text-sm text-gray-500">Ready to record</div>
          </div>
        )}
      </Card>

      <div className="flex justify-center">
        {isRecording ? (
          <Button variant="destructive" onClick={stopRecording} className="px-6">
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        ) : (
          <Button onClick={startRecording} className="px-6">
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        )}
      </div>
    </div>
  )
}

export default AudioRecorder

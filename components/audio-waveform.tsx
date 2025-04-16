"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface AudioWaveformProps {
  audioUrl: string
  results: any[]
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioUrl, results }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [duration, setDuration] = useState<number>(0)
  const [waveformData, setWaveformData] = useState<number[]>([])

  useEffect(() => {
    if (!audioUrl) return

    const audio = new Audio()
    audio.src = audioUrl

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
      generateMockWaveformData(audio.duration)
    })

    return () => {
      audio.remove()
    }
  }, [audioUrl])

  useEffect(() => {
    if (canvasRef.current && waveformData.length > 0) {
      drawWaveform()
    }
  }, [waveformData, results])

  const generateMockWaveformData = (duration: number) => {
    // In a real app, we would analyze the audio file to generate actual waveform data
    // For this demo, we'll generate random data
    const sampleRate = 50 // points per second

    // Validate duration to prevent invalid array length
    if (!isFinite(duration) || duration <= 0) {
      console.warn("Invalid audio duration:", duration)
      setWaveformData([])
      return
    }

    // Limit the maximum number of samples to prevent array size issues
    const maxSamples = 10000 // Reasonable upper limit
    const calculatedSamples = Math.floor(duration * sampleRate)
    const totalSamples = Math.min(calculatedSamples, maxSamples)

    const data: number[] = []

    for (let i = 0; i < totalSamples; i++) {
      // Generate a value between 0.1 and 1.0
      // Using a sine wave with some randomness for a more realistic look
      const base = Math.sin(i / 5) * 0.4 + 0.5
      const random = Math.random() * 0.3
      data.push(base + random)
    }

    setWaveformData(data)
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the device pixel ratio
    const dpr = window.devicePixelRatio || 1

    // Set the canvas dimensions accounting for device pixel ratio
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    // Scale the context to account for the device pixel ratio
    ctx.scale(dpr, dpr)

    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Set up drawing parameters
    const barWidth = 2
    const barSpacing = 1
    const totalWidth = waveformData.length * (barWidth + barSpacing)
    const scaleX = rect.width / totalWidth
    const centerY = rect.height / 2
    const maxBarHeight = rect.height * 0.8

    // Draw the waveform
    ctx.fillStyle = "#6366f1"

    for (let i = 0; i < waveformData.length; i++) {
      const x = i * (barWidth + barSpacing) * scaleX
      const barHeight = waveformData[i] * maxBarHeight
      const y = centerY - barHeight / 2

      ctx.fillRect(x, y, barWidth * scaleX, barHeight)
    }

    // Draw detected keywords if available
    if (results.length > 0) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)" // Red with transparency

      results.forEach((result) => {
        const startX = (result.start / duration) * rect.width
        const endX = (result.end / duration) * rect.width
        const width = endX - startX

        ctx.fillRect(startX, 0, width, rect.height)

        // Add keyword label
        ctx.fillStyle = "rgba(239, 68, 68, 1)"
        ctx.font = "10px sans-serif"
        ctx.fillText(result.keyword, startX, 12)
        ctx.fillStyle = "rgba(239, 68, 68, 0.3)"
      })
    }
  }

  return (
    <Card className="p-2 bg-gray-50">
      <canvas ref={canvasRef} className="w-full h-24" style={{ display: "block" }} />
    </Card>
  )
}

export default AudioWaveform

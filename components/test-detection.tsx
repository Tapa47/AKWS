"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Play, Pause, StopCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import AudioRecorder from "@/components/audio-recorder"
import AudioWaveform from "@/components/audio-waveform"
import KeywordResults from "@/components/keyword-results"
import { detectKeywords } from "@/lib/mfcc-processor"

export default function TestDetection() {
  const [activeTab, setActiveTab] = useState("upload")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [threshold, setThreshold] = useState(0.5)
  const [useMfcc, setUseMfcc] = useState(true)
  const [results, setResults] = useState<any[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(URL.createObjectURL(file))
      setResults([])
    }
  }

  const handleRecordingComplete = (blob: Blob) => {
    const file = new File([blob], "recording.wav", { type: "audio/wav" })
    setAudioFile(file)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(URL.createObjectURL(blob))
    setResults([])
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const handleDetectKeywords = async () => {
    if (!audioFile) {
      toast({
        title: "No audio selected",
        description: "Please upload or record audio first",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const detectionResults = await detectKeywords(audioFile, threshold, useMfcc)
      setResults(detectionResults)

      if (detectionResults.length === 0) {
        toast({
          title: "No keywords detected",
          description: "Try adjusting the threshold or using a different audio sample",
        })
      } else {
        toast({
          title: `${detectionResults.length} keywords detected`,
          description: "See results below for details",
        })
      }
    } catch (error) {
      toast({
        title: "Detection failed",
        description: "An error occurred during keyword detection",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Test Keyword Detection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-border/50 bg-muted/30">
              <CardHeader>
                <CardTitle>Audio Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger
                      value="upload"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Upload Audio
                    </TabsTrigger>
                    <TabsTrigger
                      value="record"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Record Audio
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4 mt-4">
                    <div className="flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg p-6 bg-muted/20">
                      <label className="flex flex-col items-center justify-center cursor-pointer w-full">
                        <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                        <span className="text-xs text-muted-foreground/70 mt-1">WAV, MP3, OGG files supported</span>
                        <Input type="file" accept=".wav,.mp3,.ogg" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>

                    {audioFile && (
                      <div className="text-sm text-muted-foreground mt-2">Selected file: {audioFile.name}</div>
                    )}
                  </TabsContent>

                  <TabsContent value="record" className="mt-4">
                    <AudioRecorder
                      isRecording={isRecording}
                      setIsRecording={setIsRecording}
                      onRecordingComplete={handleRecordingComplete}
                    />
                  </TabsContent>
                </Tabs>

                {audioUrl && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleStop}>
                        <StopCircle className="h-4 w-4" />
                      </Button>
                      <audio
                        ref={(el) => (audioRef.current = el)}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </div>

                    <AudioWaveform audioUrl={audioUrl} results={results} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50 bg-muted/30">
              <CardHeader>
                <CardTitle>Detection Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Label htmlFor="threshold">Detection Threshold</Label>
                    <span className="text-sm text-muted-foreground">{threshold.toFixed(2)}</span>
                  </div>
                  <Slider
                    id="threshold"
                    value={[threshold]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => setThreshold(value[0])}
                    className="mt-1.5"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="mfcc-mode" checked={useMfcc} onCheckedChange={setUseMfcc} />
                  <Label htmlFor="mfcc-mode">Use MFCC model</Label>
                </div>

                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={handleDetectKeywords}
                  disabled={!audioFile || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Detect Keywords
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {results.length > 0 && (
              <Card className="border-border/50 bg-muted/30">
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <KeywordResults results={results} audioRef={audioRef} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

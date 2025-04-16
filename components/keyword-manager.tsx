"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Upload, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import AudioRecorder from "@/components/audio-recorder"
import { getKeywords, addKeyword, deleteKeyword } from "@/lib/keywords"

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
]

interface Keyword {
  id: string
  text: string
  language: string
  audioUrl: string
}

export default function KeywordManager() {
  const [activeTab, setActiveTab] = useState("add")
  const [language, setLanguage] = useState("en")
  const [keyword, setKeyword] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadKeywords()
  }, [selectedLanguageFilter])

  const loadKeywords = async () => {
    try {
      const data = await getKeywords(selectedLanguageFilter)
      setKeywords(data)
    } catch (error) {
      console.error("Failed to load keywords:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(URL.createObjectURL(file))
    }
  }

  const handleRecordingComplete = (blob: Blob) => {
    const file = new File([blob], "recording.wav", { type: "audio/wav" })
    setAudioFile(file)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(URL.createObjectURL(blob))
  }

  const handleAddKeyword = async () => {
    if (!keyword.trim() || !audioFile) {
      toast({
        title: "Missing information",
        description: "Please provide both keyword text and audio",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await addKeyword(keyword, language, audioFile)
      toast({
        title: "Keyword added",
        description: `Successfully added "${keyword}" to your keywords`,
      })
      setKeyword("")
      setAudioFile(null)
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
        setAudioUrl(null)
      }
      loadKeywords()
    } catch (error) {
      toast({
        title: "Failed to add keyword",
        description: "An error occurred while adding the keyword",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteKeyword = async (id: string) => {
    try {
      await deleteKeyword(id)
      toast({
        title: "Keyword deleted",
        description: "The keyword has been removed",
      })
      loadKeywords()
    } catch (error) {
      toast({
        title: "Failed to delete keyword",
        description: "An error occurred while deleting the keyword",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-border/50 bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Keyword Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="add" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Add Reference Keywords
            </TabsTrigger>
            <TabsTrigger value="existing" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Existing Keywords
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1.5 bg-muted/50">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  placeholder="Enter keyword (e.g., 'hello', 'thanks')"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="mt-1.5 bg-muted/50"
                />
              </div>

              <div>
                <Label>Reference Audio</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1.5">
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-12 flex items-center justify-center bg-muted/50"
                      onClick={() => document.getElementById("audio-upload")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Audio
                    </Button>
                    <Input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    className="h-12 bg-muted/50"
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    {isRecording ? "Stop Recording" : "Record"}
                  </Button>
                </div>

                {isRecording && (
                  <div className="mt-4">
                    <AudioRecorder
                      isRecording={isRecording}
                      setIsRecording={setIsRecording}
                      onRecordingComplete={handleRecordingComplete}
                    />
                  </div>
                )}

                {audioUrl && (
                  <div className="mt-4">
                    <audio src={audioUrl} controls className="w-full" />
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={handleAddKeyword}
                disabled={isLoading || !keyword.trim() || !audioFile}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isLoading ? "Adding..." : "Add Reference"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="existing" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="filter-language">Filter by Language</Label>
                <Select value={selectedLanguageFilter} onValueChange={setSelectedLanguageFilter}>
                  <SelectTrigger className="mt-1.5 bg-muted/50">
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All languages</SelectItem>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {keywords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No keywords found. Add some keywords to get started.
                  </div>
                ) : (
                  keywords.map((kw) => (
                    <div
                      key={kw.id}
                      className="flex items-center justify-between p-3 rounded-md border border-border/50 bg-muted/30"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{kw.text}</span>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                          {LANGUAGES.find((l) => l.value === kw.language)?.label || kw.language}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <audio src={kw.audioUrl} controls className="h-8 w-32" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleDeleteKeyword(kw.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

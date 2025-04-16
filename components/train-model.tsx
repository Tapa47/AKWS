"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { trainModel } from "@/lib/mfcc-processor"

export default function TrainModel() {
  const [modelType, setModelType] = useState("mfcc")
  const [isTraining, setIsTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"])
  const { toast } = useToast()

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

  const MODEL_TYPES = [
    { value: "mfcc", label: "MFCC (Mel-Frequency Cepstral Coefficients)" },
    { value: "wavenet", label: "WaveNet" },
    { value: "transformer", label: "Transformer" },
  ]

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) => (prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]))
  }

  const handleTrainModel = async () => {
    if (selectedLanguages.length === 0) {
      toast({
        title: "No languages selected",
        description: "Please select at least one language for training",
        variant: "destructive",
      })
      return
    }

    setIsTraining(true)
    setProgress(0)

    try {
      // Simulate training progress
      const intervalId = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 500)

      // Call the actual training function
      await trainModel(modelType, selectedLanguages, (p) => setProgress(p))

      clearInterval(intervalId)
      setProgress(100)

      toast({
        title: "Training complete",
        description: `Successfully trained ${modelType.toUpperCase()} model for ${selectedLanguages.length} languages`,
      })
    } catch (error) {
      toast({
        title: "Training failed",
        description: "An error occurred during model training",
        variant: "destructive",
      })
    } finally {
      setIsTraining(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Train Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="model-type">Model Type</Label>
            <Select value={modelType} onValueChange={setModelType} disabled={isTraining}>
              <SelectTrigger id="model-type" className="mt-1.5 bg-muted/50">
                <SelectValue placeholder="Select model type" />
              </SelectTrigger>
              <SelectContent>
                {MODEL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Languages</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LANGUAGES.map((language) => (
                <div key={language.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language.value}`}
                    checked={selectedLanguages.includes(language.value)}
                    onCheckedChange={() => toggleLanguage(language.value)}
                    disabled={isTraining}
                  />
                  <Label htmlFor={`lang-${language.value}`} className="cursor-pointer">
                    {language.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {isTraining && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={handleTrainModel}
            disabled={isTraining || selectedLanguages.length === 0}
          >
            {isTraining ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Training Model...
              </div>
            ) : (
              "Train Model"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import KeywordManager from "@/components/keyword-manager"
import TestDetection from "@/components/test-detection"
import TrainModel from "@/components/train-model"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("keywords")

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Keyword Spotting System
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="keywords" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Keywords
            </TabsTrigger>
            <TabsTrigger value="test" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Test Detection
            </TabsTrigger>
            <TabsTrigger value="train" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Train Model
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keywords" className="space-y-4">
            <KeywordManager />
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <TestDetection />
          </TabsContent>

          <TabsContent value="train" className="space-y-4">
            <TrainModel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

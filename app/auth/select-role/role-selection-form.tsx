"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { saveRole } from "./actions"

export default function RoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<"manager" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelection = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await saveRole(selectedRole)
      if (result?.error) {
        setError(result.error)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-serif font-bold text-foreground">HireMeMaybe</h1>
            <p className="text-sm text-muted-foreground">BaZi Compatibility Analysis</p>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Choose Your Role</CardTitle>
              <CardDescription className="text-center">
                Select how you&apos;ll be using the platform to get personalized compatibility insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSelectedRole("manager")}
                  className={`flex flex-col items-center gap-4 p-6 rounded-lg border-2 transition-all hover:border-primary/50 ${
                    selectedRole === "manager" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl ${
                      selectedRole === "manager" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    💼
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Manager</h3>
                    <p className="text-sm text-muted-foreground">
                      Evaluate candidates and build compatible teams based on cosmic insights
                    </p>
                  </div>
                </button>

                <button
                  disabled
                  className="flex flex-col items-center gap-4 p-6 rounded-lg border-2 border-border bg-muted/50 cursor-not-allowed opacity-60 relative"
                >
                  <div className="h-16 w-16 rounded-full flex items-center justify-center text-3xl bg-muted">
                    👥
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Candidate</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover your compatibility with potential managers and teams
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}

              <Button onClick={handleRoleSelection} className="w-full" disabled={!selectedRole || isLoading}>
                {isLoading ? "Saving..." : "Continue to Profile"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

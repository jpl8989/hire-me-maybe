import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-serif font-bold text-foreground">HireMeMaybe</h1>
            <p className="text-sm text-muted-foreground">BaZi Compatibility Analysis</p>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl">📧</div>
              </div>
              <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
              <CardDescription className="text-center">We&apos;ve sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Please check your email and click the confirmation link to activate your account. Once confirmed,
                you&apos;ll be able to sign in and select your role.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

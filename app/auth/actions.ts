"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const repeatPassword = formData.get("repeatPassword") as string

  if (password !== repeatPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const supabase = await createClient()

  const headersList = await headers()
  const origin = headersList.get("origin") || headersList.get("referer")?.split("/").slice(0, 3).join("/") || ""

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/auth/sign-up-success")
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

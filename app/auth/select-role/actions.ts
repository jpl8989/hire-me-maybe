"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function saveRole(role: "manager") {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    role: role,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/birth-data")
}

export async function checkUserRole() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user already has a role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role) {
    redirect("/dashboard")
  }

  return { userId: user.id }
}

import { NextRequest } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { z } from "zod"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { getPromptForCard } from "@/lib/tarot/prompts"
import { hashToSeed } from "@/lib/utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const InputSchema = z.object({
  readingId: z.string().min(1),
  cardName: z.string().min(1),
})

fal.config({
  credentials: process.env.FAL_API_KEY!,
})

async function uploadToSupabase(bytes: ArrayBuffer, path: string, contentType: string) {
  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE!
  const bucket = "tarot-generated"

  const admin = createAdminClient(supabaseUrl, serviceRole)
  // If file exists, replace to keep deterministic path idempotent
  const { data: _data, error } = await admin.storage
    .from(bucket)
    .upload(path, bytes, { contentType, upsert: true })
  if (error) throw error

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(path)
  return pub.publicUrl
}

export async function POST(req: NextRequest) {
  try {
    // Basic guard: ensure required envs exist
    if (!process.env.FAL_API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
      return new Response(JSON.stringify({ fallback: true, error: "server_misconfigured" }), { status: 200 })
    }
    const json = await req.json()
    const { readingId, cardName } = InputSchema.parse(json)

    const seed = hashToSeed(readingId, cardName)
    const { prompt, negative } = getPromptForCard(cardName)

    // Model slug can be overridden via env (e.g., FAL_MODEL_SLUG="fal-ai/flux/schnell")
    const model = process.env.FAL_MODEL_SLUG || "fal-ai/flux/schnell"

    const result = await fal.run(model, {
      input: {
        // minimal, broadly-supported inputs for flux/schnell
        prompt,
        seed,
        width: 512,
        height: 768,
      },
      logs: true,
      timeout: 15000,
    }) as any

    // Expect an image URL or bytes. Serverless client usually returns a file URL.
    let imageUrl: string | null = null
    if (result?.images?.[0]?.url) {
      imageUrl = result.images[0].url
    } else if (result?.image?.url) {
      imageUrl = result.image.url
    } else if (typeof result === "string") {
      imageUrl = result
    }

    if (!imageUrl) {
      return new Response(JSON.stringify({ fallback: true, error: "no_image", model }), { status: 200 })
    }

    const resp = await fetch(imageUrl)
    if (!resp.ok) {
      return new Response(JSON.stringify({ fallback: true, error: "fetch_failed", status: resp.status }), { status: 200 })
    }
    const contentType = resp.headers.get("content-type") || "image/png"
    const bytes = await resp.arrayBuffer()

    // Store with the raw card name to avoid double-encoding in public URLs
    const path = `readings/${readingId}/${cardName}.png`
    const publicUrl = await uploadToSupabase(bytes, path, contentType)

    return new Response(JSON.stringify({ url: publicUrl }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ fallback: true, error: err?.message || "unknown" }), { status: 200 })
  }
}



import { NextResponse } from "next/server"

export const runtime = "nodejs"

let cachedChoice:
  | {
      version: "v1" | "v1beta"
      model: string
      at: number
    }
  | undefined

const CHOICE_CACHE_TTL_MS = 1000 * 60 * 60 // 1 hour

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatRequestBody = {
  messages: ChatMessage[]
}

type ListModelsResponse = {
  models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>
}

type GenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

function buildContents(messages: ChatMessage[]) {
  return messages
    .filter((m): m is ChatMessage => {
      return (
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
      )
    })
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))
}

async function listModels(apiKey: string, version: "v1" | "v1beta") {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`)
    const bodyText = await res.text().catch(() => "")

    if (!res.ok) {
      return {
        ok: false as const,
        status: res.status,
        bodyText,
      }
    }

    let data: ListModelsResponse | null = null
    try {
      data = (JSON.parse(bodyText) as ListModelsResponse) || null
    } catch {
      data = null
    }

    return {
      ok: true as const,
      status: res.status,
      data,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed"
    return {
      ok: false as const,
      status: 0,
      bodyText: message,
    }
  }
}

function orderedModelsFromList(data: ListModelsResponse | null): string[] {
  const models = data?.models || []
  const candidates = models
    .filter((m) => m?.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name)
    .filter((n): n is string => typeof n === "string" && n.length > 0)

  if (candidates.length === 0) return []

  // Prefer cheaper/faster models first.
  const preferred = [
    "models/gemini-2.0-flash-lite",
    "models/gemini-2.0-flash",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
    "models/gemini-1.0-pro",
  ]

  const ordered = [
    ...preferred.filter((p) => candidates.includes(p)),
    ...candidates.filter((c) => !preferred.includes(c)),
  ]

  // Dedup while preserving order
  return Array.from(new Set(ordered))
}

function normalizeModelName(name: string) {
  return name.startsWith("models/") ? name.slice("models/".length) : name
}

async function tryGenerate({
  apiKey,
  version,
  model,
  contents,
}: {
  apiKey: string
  version: "v1" | "v1beta"
  model: string
  contents: any[]
}): Promise<{ ok: true; reply: string } | { ok: false; status: number; bodyText: string }> {
  const payload: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  }

  // The `systemInstruction` field is supported in v1beta but rejected in v1.
  if (version === "v1beta") {
    payload.systemInstruction = {
      parts: [
        {
          text: "You are Smart Food Finder, a friendly food/restaurant assistant. Help users pick meals, cuisines, and dishes. Ask short clarifying questions when needed and keep answers concise.",
        },
      ],
    }
  }

  const url = `https://generativelanguage.googleapis.com/${version}/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${apiKey}`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const bodyText = await res.text().catch(() => "")
    if (!res.ok) return { ok: false, status: res.status, bodyText }

    const data = (JSON.parse(bodyText) as GenerateContentResponse) || {}
    const parts = data?.candidates?.[0]?.content?.parts || []
    const reply = parts.map((p) => p?.text || "").join("").trim()

    if (!reply) return { ok: false, status: 502, bodyText: "No reply returned" }
    return { ok: true, reply }
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed"
    return { ok: false, status: 0, bodyText: message }
  }
}

async function chooseWorkingModel(apiKey: string, contents: any[], envModel: string | null) {
  const debug: Record<string, any> = {
    forcedModel: envModel || null,
    attempts: [] as any[],
  }
  // If env forces a model, try it first.
  // If it's simply not available (404), fall back to auto-selection.
  if (envModel && envModel.trim().length > 0) {
    const forced = envModel.trim()
    const attempts: Array<{ version: "v1" | "v1beta"; status?: number; bodyText?: string }> = []

    for (const version of ["v1", "v1beta"] as const) {
      const attempt = await tryGenerate({ apiKey, version, model: forced, contents })
      if (attempt.ok) return { version, model: forced, reply: attempt.reply }
      attempts.push({ version, status: attempt.status, bodyText: attempt.bodyText })
    }

    debug.attempts.push({ phase: "forced-model", model: forced, attempts })

    const all404 = attempts.length > 0 && attempts.every((a) => a.status === 404)
    if (!all404) {
      const s = attempts.map((a) => `${a.version}:${a.status}`).join(",")
      const err = new Error(`Forced model failed: ${forced} (${s})`)
      ;(err as any).debug = debug
      throw err
    }
    // else: continue into auto-selection below
  }

  // Cached choice?
  if (cachedChoice && Date.now() - cachedChoice.at < CHOICE_CACHE_TTL_MS) {
    const attempt = await tryGenerate({
      apiKey,
      version: cachedChoice.version,
      model: cachedChoice.model,
      contents,
    })
    if (attempt.ok) return { version: cachedChoice.version, model: cachedChoice.model, reply: attempt.reply }

    debug.attempts.push({
      phase: "cached-choice",
      version: cachedChoice.version,
      model: cachedChoice.model,
      status: attempt.status,
      bodyText: attempt.bodyText?.slice?.(0, 500) || attempt.bodyText,
    })
  }

  let sawQuotaExceeded = false

  // Try to discover models from API (v1 then v1beta)
  const versions: Array<"v1" | "v1beta"> = ["v1", "v1beta"]
  for (const version of versions) {
    const listed = await listModels(apiKey, version)

    if (!listed.ok) {
      debug.attempts.push({
        phase: "list-models",
        version,
        status: listed.status,
        bodyText: listed.bodyText?.slice?.(0, 500) || listed.bodyText,
      })
      continue
    }

    const ordered = orderedModelsFromList(listed.data)
    debug.attempts.push({
      phase: "list-models",
      version,
      status: listed.status,
      modelCount: listed.data?.models?.length || 0,
      orderedCandidates: ordered.slice(0, 5),
    })

    for (const candidate of ordered.slice(0, 5)) {
      const model = normalizeModelName(candidate)
      const attempt = await tryGenerate({ apiKey, version, model, contents })
      if (attempt.ok) {
        cachedChoice = { version, model, at: Date.now() }
        return { version, model, reply: attempt.reply }
      }

      if (attempt.status === 429) sawQuotaExceeded = true

      debug.attempts.push({
        phase: "generate-with-candidate",
        version,
        model,
        status: attempt.status,
        bodyText: attempt.bodyText?.slice?.(0, 500) || attempt.bodyText,
      })
    }
  }

  // Last resort: brute-force a few common model names across both versions.
  const fallbackModels = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
  ]
  for (const version of versions) {
    for (const model of fallbackModels) {
      const attempt = await tryGenerate({ apiKey, version, model, contents })
      if (attempt.ok) {
        cachedChoice = { version, model, at: Date.now() }
        return { version, model, reply: attempt.reply }
      }

      if (attempt.status === 429) sawQuotaExceeded = true

      // Only keep the first few failures to avoid huge responses.
      if (debug.attempts.length < 10) {
        debug.attempts.push({
          phase: "fallback-generate",
          version,
          model,
          status: attempt.status,
          bodyText: attempt.bodyText?.slice?.(0, 500) || attempt.bodyText,
        })
      }
    }
  }

  if (sawQuotaExceeded) {
    const err = new Error(
      "Gemini quota exceeded for this API key. Check your plan/billing in Google AI Studio (or wait and try again).",
    )
    ;(err as any).statusCode = 429
    ;(err as any).debug = debug
    throw err
  }

  const err = new Error("No supported Gemini model found for this API key.")
  ;(err as any).debug = debug
  throw err
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    const envModel = (process.env.GEMINI_MODEL || "").trim() || null

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY. Set it in your .env.local file." },
        { status: 500 },
      )
    }

    const body = (await req.json()) as Partial<ChatRequestBody>
    const messages = Array.isArray(body.messages) ? body.messages : []

    const contents = buildContents(messages)

    const hasUserMessage = contents.some((c) => c.role === "user")
    if (!hasUserMessage) {
      return NextResponse.json({ error: "No user message provided." }, { status: 400 })
    }

    const { reply } = await chooseWorkingModel(apiKey, contents, envModel)
    return NextResponse.json({ reply })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    const debug = (err as any)?.debug
    const status = typeof (err as any)?.statusCode === "number" ? (err as any).statusCode : 502

    return NextResponse.json(
      {
        error: "Gemini API request failed.",
        details: message,
        // In dev, include extra diagnostics (never includes the API key).
        debug: process.env.NODE_ENV === "production" ? undefined : debug,
      },
      { status },
    )
  }
}

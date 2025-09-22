export interface LlmAnalysisResult {
  credibilityScore: number
  verdict: 'HIGH RISK' | 'WATCH' | 'SAFE'
  reasoning: string
}

// Optional Gemini analysis if GEMINI_API_KEY is set; otherwise returns null
export async function llmAnalyzeAnnouncement(text: string): Promise<LlmAnalysisResult | null> {
  if (!process.env.GEMINI_API_KEY) return null
  const content = (text || '').trim()
  if (!content) return null

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `You are a compliance analyst. Assess the credibility of this corporate announcement:
Text: "${content}"
Return a compact JSON with fields { credibilityScore (0-100), verdict in ["HIGH RISK","WATCH","SAFE"], reasoning (1-2 sentences) } only.`
    const resp = await model.generateContent(prompt)
    const textOut = resp?.response?.text?.() || ''
    const jsonStart = textOut.indexOf('{')
    const jsonEnd = textOut.lastIndexOf('}')
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(textOut.slice(jsonStart, jsonEnd + 1))
      const credibilityScore = Math.max(0, Math.min(100, Number(parsed.credibilityScore) || 50))
      const verdict = (parsed.verdict === 'HIGH RISK' || parsed.verdict === 'WATCH' || parsed.verdict === 'SAFE') ? parsed.verdict : 'WATCH'
      const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning : 'LLM reasoning unavailable.'
      return { credibilityScore, verdict, reasoning }
    }
  } catch {
    // Ignore LLM failures and fall back
  }
  return null
}



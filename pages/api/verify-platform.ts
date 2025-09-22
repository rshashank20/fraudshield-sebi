import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAppOrWebsite } from '../../utils/verifyAppOrWebsite'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { name }: { name?: string } = req.body || {}
    const result = verifyAppOrWebsite(name || '')
    return res.status(200).json(result)
  } catch (error) {
    return res.status(200).json({
      confidenceScore: 50,
      verdict: 'WATCH',
      reasoning: 'Verification encountered an issue; defaulting to watch. Please cross-check with official broker lists and app store publisher details.',
      evidenceLink: 'https://www.sebi.gov.in/'
    })
  }
}



import type { NextApiRequest, NextApiResponse } from 'next'

interface BseItem {
  title: string
  link?: string
  published?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const resp = await fetch('https://www.bseindia.com/xml-data/corpfiling/BA_Ann.xml', { signal: controller.signal })
    clearTimeout(timeout)

    if (!resp.ok) {
      return res.status(200).json({ items: [] as BseItem[], source: 'BSE', note: 'Feed unavailable' })
    }

    const xml = await resp.text()
    // very light parsing: split on <Item> ... </Item>
    const items: BseItem[] = []
    const itemRegex = /<Item>([\s\S]*?)<\/Item>/gi
    let match: RegExpExecArray | null
    while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
      const block = match[1]
      const titleMatch = /<Title>([\s\S]*?)<\/Title>/i.exec(block)
      const linkMatch = /<Link>([\s\S]*?)<\/Link>/i.exec(block)
      const dateMatch = /<PubDate>([\s\S]*?)<\/PubDate>/i.exec(block)
      items.push({
        title: (titleMatch?.[1] || '').trim(),
        link: (linkMatch?.[1] || '').trim(),
        published: (dateMatch?.[1] || '').trim()
      })
    }

    return res.status(200).json({ items, source: 'BSE' })
  } catch (e) {
    return res.status(200).json({ items: [] as BseItem[], source: 'BSE', note: 'Network error or blocked' })
  }
}



const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchWikipediaData(month, day) {
  const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ChronicleOfTime/1.0' } });
  if (!res.ok) throw new Error('Wikipedia API error: ' + res.status);
  return await res.json();
}

function pickBestEvents(events, count) {
  if (!events || events.length === 0) return [];
  const sorted = [...events].sort((a, b) => (b.pages?.length || 0) - (a.pages?.length || 0));
  return sorted.slice(0, count).map(e => `${e.year}: ${e.text}`);
}

function pickBestBirths(births, count) {
  if (!births || births.length === 0) return [];
  const sorted = [...births].sort((a, b) => (b.pages?.length || 0) - (a.pages?.length || 0));
  return sorted.slice(0, count).map(b => {
    const desc = b.pages?.[0]?.description || '';
    return `${b.year}: ${b.text}${desc ? ' — ' + desc : ''}`;
  });
}

// ── FULL DATE NEWSPAPER ──────────────────────────────────────────────────────

app.post('/api/newspaper', async (req, res) => {
  const { formattedDate, month, day, year, language } = req.body;
  if (!formattedDate) return res.status(400).json({ error: 'Missing date' });

  const isHebrew = language === 'he';
  let wikiEvents = [], wikiBirths = [];

  try {
    const wikiData = await fetchWikipediaData(month, day);
    wikiEvents = pickBestEvents(wikiData.events, 12);
    wikiBirths = pickBestBirths(wikiData.births, 10);
  } catch (e) {
    console.warn('Wikipedia fetch failed:', e.message);
  }

  const eventsContext = wikiEvents.length > 0
    ? `VERIFIED HISTORICAL EVENTS on ${month}/${day} from Wikipedia:\n${wikiEvents.join('\n')}`
    : `Use your knowledge of real historical events on ${month}/${day}.`;

  const birthsContext = wikiBirths.length > 0
    ? `VERIFIED BIRTHS on ${month}/${day} from Wikipedia (use ONLY these):\n${wikiBirths.join('\n')}`
    : `Use your knowledge of notable people born on ${month}/${day}.`;

  const englishPrompt = `You are a historical newspaper editor. Write a vivid newspaper front page for: ${formattedDate}.

${eventsContext}

${birthsContext}

- Base ALL stories on the verified events listed above
- For notableBirths use ONLY people from the verified births list
- Write in dramatic engaging newspaper style, include the year in each story
- For notableBirths names also provide Hebrew transliteration in parentheses e.g. "Nicole Kidman (ניקול קידמן)"

Return ONLY raw JSON, no backticks:
{
  "mainHeadline": "dramatic headline from the most significant event",
  "mainDeck": "1-2 sentence subheadline",
  "mainBody": "3-4 sentences vivid prose about the main event including year",
  "col1Tag": "POLITICS or WAR or SCIENCE or ARTS or EXPLORATION or SPORTS",
  "col1Headline": "headline for second event",
  "col1Body": "2-3 sentences including year",
  "col2Tag": "category",
  "col2Headline": "headline for third event",
  "col2Body": "2-3 sentences including year",
  "col3Tag": "category",
  "col3Headline": "headline for fourth event",
  "col3Body": "2-3 sentences including year",
  "curiosities": [
    {"title": "Did You Know?", "body": "interesting fact from the events above"},
    {"title": "By The Numbers", "body": "surprising statistic related to one of the events"},
    {"title": "The World Then", "body": "vivid snapshot of everyday life in the year of the main event"}
  ],
  "notableBirths": [
    {"year": 1900, "name": "Full Name (עברית)", "note": "brief description"},
    {"year": 1930, "name": "Full Name (עברית)", "note": "brief description"},
    {"year": 1955, "name": "Full Name (עברית)", "note": "brief description"},
    {"year": 1970, "name": "Full Name (עברית)", "note": "brief description"},
    {"year": 1985, "name": "Full Name (עברית)", "note": "brief description"}
  ]
}`;

  try {
    const englishMsg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: englishPrompt }],
    });
    const rawEn = englishMsg.content.map(b => b.text || '').join('');
    const cleanEn = rawEn.replace(/```json/g, '').replace(/```/g, '').trim();
    const enData = JSON.parse(cleanEn);

    if (!isHebrew) {
      if (enData.notableBirths) {
        enData.notableBirths = enData.notableBirths.map(b => ({
          ...b, name: b.name.replace(/\s*\([^)]*[\u0590-\u05FF][^)]*\)/g, '').trim()
        }));
      }
      return res.json(enData);
    }

    // Translate to Hebrew
    const heMsg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: `Translate this newspaper JSON to Hebrew. For notableBirths names: extract only the Hebrew text from parentheses (e.g. from "Nicole Kidman (ניקול קידמן)" use "ניקול קידמן"). Translate all other text fields. Keep years as numbers. Return ONLY raw JSON:\n${cleanEn}` }],
    });
    const rawHe = heMsg.content.map(b => b.text || '').join('');
    const cleanHe = rawHe.replace(/```json/g, '').replace(/```/g, '').trim();
    const heData = JSON.parse(cleanHe);

    if (heData.notableBirths) {
      heData.notableBirths = heData.notableBirths.map(b => {
        const m = b.name.match(/\(([^\)]*[\u0590-\u05FF][^\)]*)\)/);
        if (m) b.name = m[1].trim();
        return b;
      });
    }
    res.json(heData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── BIRTH YEAR NEWSPAPER ─────────────────────────────────────────────────────

app.post('/api/birthyear', async (req, res) => {
  const { year, language } = req.body;
  if (!year) return res.status(400).json({ error: 'Missing year' });

  const isHebrew = language === 'he';

  const englishPrompt = `You are a historical newspaper editor. Create a "The Year You Were Born" special edition newspaper for the year ${year}.

Cover the biggest and most memorable events, cultural moments, inventions, and births of that entire year.

Return ONLY raw JSON, no backticks:
{
  "mainHeadline": "The single most important or dramatic headline from ${year}",
  "mainDeck": "1-2 sentence subheadline expanding on the main story",
  "mainBody": "3-4 sentences of vivid newspaper prose about the main event of ${year}",
  "col1Tag": "POLITICS or WAR or SCIENCE or ARTS or SPORTS",
  "col1Headline": "Second biggest story of ${year}",
  "col1Body": "2-3 sentences",
  "col2Tag": "category",
  "col2Headline": "Third story of ${year}",
  "col2Body": "2-3 sentences",
  "col3Tag": "category",
  "col3Headline": "Fourth story of ${year}",
  "col3Body": "2-3 sentences",
  "curiosities": [
    {"title": "Life in ${year}", "body": "What everyday life looked like — prices, fashion, technology, culture"},
    {"title": "Born This Year", "body": "Notable people born in ${year} — include 3-4 names with Hebrew transliteration in parentheses"},
    {"title": "The World in Numbers", "body": "Surprising statistics or facts that define ${year}"}
  ],
  "notableBirths": [
    {"year": ${year}, "name": "Famous Person (עברית)", "note": "brief description"},
    {"year": ${year}, "name": "Famous Person (עברית)", "note": "brief description"},
    {"year": ${year}, "name": "Famous Person (עברית)", "note": "brief description"},
    {"year": ${year}, "name": "Famous Person (עברית)", "note": "brief description"},
    {"year": ${year}, "name": "Famous Person (עברית)", "note": "brief description"}
  ]
}`;

  try {
    const englishMsg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: englishPrompt }],
    });
    const rawEn = englishMsg.content.map(b => b.text || '').join('');
    const cleanEn = rawEn.replace(/```json/g, '').replace(/```/g, '').trim();
    const enData = JSON.parse(cleanEn);

    if (!isHebrew) {
      if (enData.notableBirths) {
        enData.notableBirths = enData.notableBirths.map(b => ({
          ...b, name: b.name.replace(/\s*\([^)]*[\u0590-\u05FF][^)]*\)/g, '').trim()
        }));
      }
      return res.json(enData);
    }

    const heMsg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: `Translate this newspaper JSON to Hebrew. For notableBirths names: extract only the Hebrew text from parentheses. Translate all other text fields. Keep years as numbers. Return ONLY raw JSON:\n${cleanEn}` }],
    });
    const rawHe = heMsg.content.map(b => b.text || '').join('');
    const cleanHe = rawHe.replace(/```json/g, '').replace(/```/g, '').trim();
    const heData = JSON.parse(cleanHe);

    if (heData.notableBirths) {
      heData.notableBirths = heData.notableBirths.map(b => {
        const m = b.name.match(/\(([^\)]*[\u0590-\u05FF][^\)]*)\)/);
        if (m) b.name = m[1].trim();
        return b;
      });
    }
    res.json(heData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

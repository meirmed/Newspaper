const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchWikipediaData(month, day) {
  const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ChronicleOfTime/1.0 (historical newspaper app)' }
  });
  if (!res.ok) throw new Error('Wikipedia API error: ' + res.status);
  return await res.json();
}

function pickBestEvents(events, count) {
  if (!events || events.length === 0) return [];
  // Sort by number of pages linked (proxy for importance)
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

app.post('/api/newspaper', async (req, res) => {
  const { formattedDate, month, day, year, language } = req.body;
  if (!formattedDate) return res.status(400).json({ error: 'Missing date' });

  const isHebrew = language === 'he';

  let wikiEvents = [];
  let wikiBirths = [];

  try {
    const wikiData = await fetchWikipediaData(month, day);
    wikiEvents = pickBestEvents(wikiData.events, 12);
    wikiBirths = pickBestBirths(wikiData.births, 10);
  } catch (e) {
    console.warn('Wikipedia fetch failed, falling back to Claude knowledge:', e.message);
  }

  const hasWikiData = wikiEvents.length > 0;

  const eventsContext = hasWikiData
    ? `VERIFIED HISTORICAL EVENTS on ${month}/${day} from Wikipedia (use these as your source):\n${wikiEvents.join('\n')}`
    : `Use your knowledge of real historical events on ${month}/${day}.`;

  const birthsContext = hasWikiData && wikiBirths.length > 0
    ? `VERIFIED BIRTHS on ${month}/${day} from Wikipedia (use ONLY these, do not invent any):\n${wikiBirths.join('\n')}`
    : `Use your knowledge of notable people born on ${month}/${day}.`;

  const prompt = isHebrew
    ? `אתה עורך עיתון היסטורי. כתוב עמוד שער עיתון היסטורי מרתק לתאריך: ${formattedDate}.

להלן נתונים מאומתים מוויקיפדיה — השתמש בהם בלבד, אל תמציא עובדות:

אירועים היסטוריים:
${wikiEvents.length > 0 ? wikiEvents.join('\n') : 'השתמש בידע שלך על אירועים היסטוריים בתאריך זה.'}

ילידי היום:
${wikiBirths.length > 0 ? wikiBirths.join('\n') : 'השתמש בידע שלך על אנשים מפורסמים שנולדו בתאריך זה.'}

החזר אך ורק אובייקט JSON תקני, ללא backticks, ללא טקסט נוסף:
{
  "mainHeadline": "כותרת דרמטית על האירוע המשמעותי ביותר מהרשימה למעלה",
  "mainDeck": "תת-כותרת מרתקת של 1-2 משפטים",
  "mainBody": "3-4 משפטים בסגנון עיתונות ציורית על האירוע הראשי, כולל השנה",
  "col1Tag": "קטגוריה",
  "col1Headline": "כותרת לאירוע שני מהרשימה",
  "col1Body": "2-3 משפטים על האירוע כולל השנה",
  "col2Tag": "קטגוריה",
  "col2Headline": "כותרת לאירוע שלישי מהרשימה",
  "col2Body": "2-3 משפטים כולל השנה",
  "col3Tag": "קטגוריה",
  "col3Headline": "כותרת לאירוע רביעי מהרשימה",
  "col3Body": "2-3 משפטים כולל השנה",
  "curiosities": [
    {"title": "הידעת?", "body": "עובדה מעניינת מהאירועים שלמעלה"},
    {"title": "במספרים", "body": "עובדה סטטיסטית מפתיעה הקשורה לאירועים"},
    {"title": "העולם אז", "body": "תיאור חי של החיים היומיומיים בשנה הבולטת"}
  ],
  "notableBirths": [
    {"year": 1900, "name": "שם מהרשימה", "note": "תיאור קצר"},
    {"year": 1920, "name": "שם נוסף", "note": "תיאור קצר"},
    {"year": 1950, "name": "שם שלישי", "note": "תיאור קצר"},
    {"year": 1970, "name": "שם רביעי", "note": "תיאור קצר"},
    {"year": 1985, "name": "שם חמישי", "note": "תיאור קצר"}
  ]
}
החזר אך ורק את אובייקט ה-JSON הגולמי.`
    : `You are a historical newspaper editor. Write a vivid newspaper front page for: ${formattedDate}.

${eventsContext}

${birthsContext}

Instructions:
- Base ALL stories on the verified events listed above
- For notableBirths, use ONLY people from the verified births list above — do not invent or substitute anyone
- Write in dramatic, engaging newspaper style
- Include the year in each story

Return ONLY a raw JSON object, no backticks, no other text:
{
  "mainHeadline": "Dramatic headline based on the most significant event from the list above",
  "mainDeck": "Compelling 1-2 sentence subheadline expanding on the main story",
  "mainBody": "3-4 sentences of vivid newspaper prose about the main event, including the year",
  "col1Tag": "POLITICS or WAR or SCIENCE or ARTS or EXPLORATION or SPORTS",
  "col1Headline": "Headline for a second event from the list",
  "col1Body": "2-3 sentences including the year",
  "col2Tag": "category",
  "col2Headline": "Headline for a third event from the list",
  "col2Body": "2-3 sentences including the year",
  "col3Tag": "category",
  "col3Headline": "Headline for a fourth event from the list",
  "col3Body": "2-3 sentences including the year",
  "curiosities": [
    {"title": "Did You Know?", "body": "An interesting fact derived from the events above"},
    {"title": "By The Numbers", "body": "A surprising statistic related to one of the events"},
    {"title": "The World Then", "body": "A vivid snapshot of everyday life in the year of the main event"}
  ],
  "notableBirths": [
    {"year": 1900, "name": "Name from verified list", "note": "brief description"},
    {"year": 1920, "name": "Name from verified list", "note": "brief description"},
    {"year": 1950, "name": "Name from verified list", "note": "brief description"},
    {"year": 1970, "name": "Name from verified list", "note": "brief description"},
    {"year": 1985, "name": "Name from verified list", "note": "brief description"}
  ]
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(clean);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function getMonthHe(month) {
  const m = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  return m[parseInt(month, 10) - 1] || '';
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

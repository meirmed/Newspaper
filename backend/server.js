const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/newspaper', async (req, res) => {
  const { formattedDate, month, day, year, language } = req.body;
  if (!formattedDate) return res.status(400).json({ error: 'Missing date' });

  const isHebrew = language === 'he';

  const prompt = isHebrew
    ? `אתה עורך עיתון היסטורי. צור עמוד שער עיתון היסטורי מרתק לתאריך: ${formattedDate}.

החזר אך ורק אובייקט JSON תקני עם המבנה הבא, ללא backticks, ללא טקסט נוסף:
{
  "mainHeadline": "כותרת דרמטית על האירוע ההיסטורי המשמעותי ביותר שהתרחש ב-${day} ב${getMonthHe(month)} בכל שנה בהיסטוריה",
  "mainDeck": "תת-כותרת מרתקת של 1-2 משפטים המרחיבה על הכתבה הראשית",
  "mainBody": "3-4 משפטים בסגנון עיתונות ציורית המתארים את האירוע, כולל השנה שבה התרחש",
  "col1Tag": "קטגוריה (לדוגמה: פוליטיקה, מלחמה, מדע, אמנות, חקר)",
  "col1Headline": "כותרת לאירוע היסטורי שני בתאריך זה",
  "col1Body": "2-3 משפטים על האירוע כולל השנה",
  "col2Tag": "קטגוריה",
  "col2Headline": "כותרת לאירוע היסטורי שלישי בתאריך זה",
  "col2Body": "2-3 משפטים כולל השנה",
  "col3Tag": "קטגוריה",
  "col3Headline": "כותרת לאירוע היסטורי רביעי בתאריך זה",
  "col3Body": "2-3 משפטים כולל השנה",
  "curiosities": [
    {"title": "הידעת?", "body": "עובדה מעניינת הקשורה לתאריך זה או לתקופתו"},
    {"title": "במספרים", "body": "עובדה סטטיסטית מפתיעה הקשורה לאירועי תאריך זה"},
    {"title": "העולם אז", "body": "תיאור חי של החיים היומיומיים בשנה הבולטת שהוזכרה"}
  ],
  "notableBirths": [
    {"year": 1850, "name": "שם המפורסם", "note": "תיאור קצר"},
    {"year": 1920, "name": "שם נוסף", "note": "תיאור קצר"},
    {"year": 1965, "name": "שם שלישי", "note": "תיאור קצר"},
    {"year": 1978, "name": "שם רביעי", "note": "תיאור קצר"},
    {"year": 1990, "name": "שם חמישי", "note": "תיאור קצר"}
  ]
}
השתמש בעובדות היסטוריות אמיתיות. החזר אך ורק את אובייקט ה-JSON הגולמי.`
    : `You are a historical newspaper editor. Generate a vivid newspaper front page for: ${formattedDate}.

Return ONLY a raw JSON object, no backticks, no other text:
{
  "mainHeadline": "Dramatic headline about the most significant event on ${month}/${day} in any year of history",
  "mainDeck": "Compelling 1-2 sentence subheadline expanding on the main story",
  "mainBody": "3-4 sentences of vivid newspaper-style prose describing this event, including the year it occurred",
  "col1Tag": "POLITICS or WAR or SCIENCE or ARTS or EXPLORATION",
  "col1Headline": "Headline for a second historical event on this date",
  "col1Body": "2-3 sentences about this event including the year",
  "col2Tag": "category",
  "col2Headline": "Headline for a third historical event on this date",
  "col2Body": "2-3 sentences including the year",
  "col3Tag": "category",
  "col3Headline": "Headline for a fourth historical event on this date",
  "col3Body": "2-3 sentences including the year",
  "curiosities": [
    {"title": "Did You Know?", "body": "An interesting fact tied to this date or era"},
    {"title": "By The Numbers", "body": "A surprising statistic related to this date's events"},
    {"title": "The World Then", "body": "A vivid snapshot of everyday life in the most notable year mentioned"}
  ],
  "notableBirths": [
    {"year": 1850, "name": "Famous Person", "note": "brief description"},
    {"year": 1920, "name": "Another Person", "note": "brief description"},
    {"year": 1965, "name": "Third Person", "note": "brief description"},
    {"year": 1978, "name": "Fourth Person", "note": "brief description"},
    {"year": 1990, "name": "Fifth Person", "note": "brief description"}
  ]
}
Use real historical facts only. Return ONLY the raw JSON object.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
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
